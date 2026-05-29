export type BrowserPrivacyShieldMode = "balanced" | "strict" | "compatibility";
export type BrowserPrivacyShieldDecision = "blocked" | "review" | "allowed";
export type BrowserPrivacyShieldRuleCategory = "ads" | "tracking" | "fingerprinting" | "cookies" | "first_party" | "download";
export type BrowserPrivacyShieldActionId = "review_rules" | "strict_preview" | "allow_site";

export type BrowserPrivacyShieldRule = {
  id: string;
  category: BrowserPrivacyShieldRuleCategory;
  decision: BrowserPrivacyShieldDecision;
  title: string;
  detail: string;
  scope: string;
};

export type BrowserPrivacyShieldEvent = {
  id: string;
  decision: BrowserPrivacyShieldDecision;
  label: string;
  detail: string;
  source: string;
};

export type BrowserPrivacyShieldAction = {
  id: BrowserPrivacyShieldActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserPrivacyShieldPreview = {
  id: string;
  title: string;
  hostname: string;
  currentTitle: string;
  mode: BrowserPrivacyShieldMode;
  modeLabel: string;
  blockedCount: number;
  reviewCount: number;
  allowedCount: number;
  rules: BrowserPrivacyShieldRule[];
  events: BrowserPrivacyShieldEvent[];
  details: string[];
  guardrails: string[];
  actions: BrowserPrivacyShieldAction[];
};

export type BrowserPrivacyShieldPreviewOptions = {
  currentUrl: string;
  currentTitle: string;
  workspaceName: string;
  sourceType?: string;
  captureCount?: number;
  mode?: BrowserPrivacyShieldMode;
};

const trustedFirstPartyHosts = ["docs.oracle.com", "cloud.oracle.com", "github.com", "livelabs.oracle.com"];

export function createBrowserPrivacyShieldPreview(options: BrowserPrivacyShieldPreviewOptions): BrowserPrivacyShieldPreview {
  const hostname = extractHostname(options.currentUrl);
  const mode = options.mode ?? "balanced";
  const sourceType = options.sourceType ?? "web";
  const isTrustedFirstParty = trustedFirstPartyHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  const rules = createRules({ hostname, mode, isTrustedFirstParty });
  const events = createEvents({ hostname, sourceType, isTrustedFirstParty, mode });
  const decisions = [...rules.map((rule) => rule.decision), ...events.map((event) => event.decision)];
  const blockedCount = decisions.filter((decision) => decision === "blocked").length;
  const reviewCount = decisions.filter((decision) => decision === "review").length;
  const allowedCount = decisions.filter((decision) => decision === "allowed").length;

  return {
    id: `browser-privacy-shield-${hashSeed(`${hostname}:${mode}:${options.workspaceName}:${options.currentTitle}`)}`,
    title: "Privacy Shield Preview",
    hostname,
    currentTitle: normalizeText(options.currentTitle, "Current page"),
    mode,
    modeLabel: getModeLabel(mode),
    blockedCount,
    reviewCount,
    allowedCount,
    rules,
    events,
    details: [
      `workspace: ${normalizeText(options.workspaceName, "Workspace")}`,
      `host: ${hostname || "about:blank"}`,
      `mode: ${mode}`,
      `source: ${sourceType}`,
      `captures: ${Math.max(0, options.captureCount ?? 0)}`
    ],
    guardrails: [
      "BrowserOS source / asset / uBlock rule reuse なし",
      "この preview は network request を遮断せず、local rule decision だけを表示する",
      "customer login、OCI Console、payment、permission change は ad-block rule ではなく action approval gate で扱う",
      "allowlist / strict mode の変更は review-only とし、実 browser profile へ保存しない",
      "external filter list download、cloud sync、extension install は開始しない"
    ],
    actions: [
      {
        id: "review_rules",
        label: "Review rules",
        enabled: true,
        reason: "現在ページに適用予定の local rules を確認します。"
      },
      {
        id: "strict_preview",
        label: "Strict preview",
        enabled: mode !== "strict",
        reason: mode === "strict" ? "strict mode preview は既に選択されています。" : "strict mode の差分を review-only で確認します。"
      },
      {
        id: "allow_site",
        label: "Allow site preview",
        enabled: false,
        reason: "この切片では site allowlist の保存は行いません。"
      }
    ]
  };
}

function createRules(options: {
  hostname: string;
  mode: BrowserPrivacyShieldMode;
  isTrustedFirstParty: boolean;
}): BrowserPrivacyShieldRule[] {
  const thirdPartyDecision: BrowserPrivacyShieldDecision = options.mode === "compatibility" ? "review" : "blocked";
  const adDecision: BrowserPrivacyShieldDecision = options.mode === "compatibility" ? "review" : "blocked";
  const fingerprintingDecision: BrowserPrivacyShieldDecision = options.mode === "strict" ? "blocked" : "review";

  return [
    {
      id: "privacy-rule-third-party-tracking",
      category: "tracking",
      decision: thirdPartyDecision,
      title: "Third-party tracking scripts",
      detail: "analytics、cross-site identifier、retargeting endpoint を request review に分類する。",
      scope: "third-party"
    },
    {
      id: "privacy-rule-ad-slots",
      category: "ads",
      decision: adDecision,
      title: "Ad slots and sponsored frames",
      detail: "content area の ad slot、sponsored iframe、ad pixel を local blocking candidate にする。",
      scope: "third-party"
    },
    {
      id: "privacy-rule-fingerprinting",
      category: "fingerprinting",
      decision: fingerprintingDecision,
      title: "Fingerprinting probes",
      detail: "canvas、font、audio、device probing は strict mode で block、balanced mode で review にする。",
      scope: "browser APIs"
    },
    {
      id: "privacy-rule-cookie-banners",
      category: "cookies",
      decision: "review",
      title: "Cookie banner overlays",
      detail: "login や consent が必要な UI は自動 click せず、assistant approval に回す。",
      scope: "visible page UI"
    },
    {
      id: "privacy-rule-first-party",
      category: "first_party",
      decision: options.isTrustedFirstParty ? "allowed" : "review",
      title: "First-party enterprise page",
      detail: options.isTrustedFirstParty
        ? `${options.hostname} は trusted first-party として document / navigation を許可する。`
        : `${options.hostname || "current host"} は workspace trust review が必要。`,
      scope: "current host"
    }
  ];
}

function createEvents(options: {
  hostname: string;
  sourceType: string;
  isTrustedFirstParty: boolean;
  mode: BrowserPrivacyShieldMode;
}): BrowserPrivacyShieldEvent[] {
  const hostLabel = options.hostname || "about:blank";
  const strictOnlyEvents: BrowserPrivacyShieldEvent[] =
    options.mode === "strict"
      ? [
          {
            id: "privacy-event-download-review",
            decision: "review",
            label: "Download prompt",
            detail: "file download は extension / executable / archive を review queue に送る。",
            source: hostLabel
          }
        ]
      : [];

  return [
    {
      id: "privacy-event-document-allowed",
      decision: options.isTrustedFirstParty ? "allowed" : "review",
      label: "Main document",
      detail: `${hostLabel} の main document navigation は browser read として扱う。`,
      source: options.sourceType
    },
    {
      id: "privacy-event-cross-site-trackers",
      decision: options.mode === "compatibility" ? "review" : "blocked",
      label: "Cross-site trackers",
      detail: "known tracker 相当の third-party request は clean-room local classifier で遮断候補にする。",
      source: "third-party"
    },
    {
      id: "privacy-event-cookie-banner",
      decision: "review",
      label: "Consent banner",
      detail: "同意、login、personalization は自動操作せず user review に残す。",
      source: "page UI"
    },
    ...strictOnlyEvents
  ];
}

function getModeLabel(mode: BrowserPrivacyShieldMode): string {
  if (mode === "strict") {
    return "Strict local blocking";
  }

  if (mode === "compatibility") {
    return "Compatibility review";
  }

  return "Balanced local protection";
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : fallback;
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 41 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
