export type BrowserChromeImportKind = "bookmarks" | "history" | "passwords" | "extensions" | "settings";
export type BrowserChromeImportDecision = "ready" | "review" | "blocked";
export type BrowserChromeImportActionId = "review_import_map" | "start_import" | "open_chrome_help";

export type BrowserChromeImportItem = {
  id: string;
  kind: BrowserChromeImportKind;
  label: string;
  detail: string;
  decision: BrowserChromeImportDecision;
  estimateLabel: string;
  riskLabel: string;
};

export type BrowserChromeImportAction = {
  id: BrowserChromeImportActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserChromeImportPreview = {
  id: string;
  title: string;
  workspaceName: string;
  profileLabel: string;
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  items: BrowserChromeImportItem[];
  actions: BrowserChromeImportAction[];
  guardrails: string[];
};

export type BrowserChromeImportPreviewOptions = {
  workspaceName: string;
  profileLabel?: string;
  bookmarkCount?: number;
  captureCount?: number;
  extensionReviewCount?: number;
};

export function createBrowserChromeImportPreview(options: BrowserChromeImportPreviewOptions): BrowserChromeImportPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const profileLabel = normalizeText(options.profileLabel ?? "Chrome Default Profile", "Chrome Default Profile");
  const bookmarkCount = clampCount(options.bookmarkCount);
  const captureCount = clampCount(options.captureCount);
  const extensionReviewCount = clampCount(options.extensionReviewCount);
  const items: BrowserChromeImportItem[] = [
    {
      id: "chrome-import-bookmarks",
      kind: "bookmarks",
      label: "Bookmarks",
      detail: "Chrome bookmark export / HTML import を想定し、workspace の bookmark preview に追加する候補だけを表示します。",
      decision: "review",
      estimateLabel: bookmarkCount > 0 ? `${bookmarkCount} existing preview bookmarks` : "no local bookmarks yet",
      riskLabel: "URL review required"
    },
    {
      id: "chrome-import-history",
      kind: "history",
      label: "History",
      detail: "最近の browsing history は semantic recall 候補として扱えますが、この切片では Chrome profile DB を読みません。",
      decision: "blocked",
      estimateLabel: `${captureCount} local captures available`,
      riskLabel: "profile DB blocked"
    },
    {
      id: "chrome-import-passwords",
      kind: "passwords",
      label: "Passwords",
      detail: "password、cookie、session token、passkey は import scope から除外します。",
      decision: "blocked",
      estimateLabel: "0 secrets imported",
      riskLabel: "secrets excluded"
    },
    {
      id: "chrome-import-extensions",
      kind: "extensions",
      label: "Extensions",
      detail: "Chrome extension compatibility は permissions review に渡し、all-sites / native messaging は自動許可しません。",
      decision: extensionReviewCount > 0 ? "review" : "ready",
      estimateLabel: extensionReviewCount > 0 ? `${extensionReviewCount} permission reviews` : "permission preview ready",
      riskLabel: extensionReviewCount > 0 ? "review required" : "local manifest mapping"
    },
    {
      id: "chrome-import-settings",
      kind: "settings",
      label: "Settings",
      detail: "search engine、startup page、download path は AI Launchpad の clean-room settings draft として扱います。",
      decision: "ready",
      estimateLabel: "draft-only",
      riskLabel: "no profile write"
    }
  ];
  const readyCount = items.filter((item) => item.decision === "ready").length;
  const reviewCount = items.filter((item) => item.decision === "review").length;
  const blockedCount = items.filter((item) => item.decision === "blocked").length;

  return {
    id: `chrome-import-${hashSeed(`${workspaceName}:${profileLabel}:${bookmarkCount}:${captureCount}`)}`,
    title: "Chrome Import Preview",
    workspaceName,
    profileLabel,
    readyCount,
    reviewCount,
    blockedCount,
    items,
    actions: [
      {
        id: "review_import_map",
        label: "Review import map",
        enabled: true,
        reason: "import 対象と除外対象を local preview で確認します。"
      },
      {
        id: "start_import",
        label: "Start import",
        enabled: false,
        reason: "この切片では Chrome profile read/write と browser data import を開始しません。"
      },
      {
        id: "open_chrome_help",
        label: "Open Chrome import help",
        enabled: false,
        reason: "外部 browser automation や chrome://settings/importData への遷移は行いません。"
      }
    ],
    guardrails: [
      "BrowserOS source / import implementation reuse なし",
      "Chrome profile、History SQLite、Login Data、Cookies、Secure Preferences を読み書きしない",
      "password、cookie、token、wallet、private key、passkey は import scope から除外する",
      "extension は manifest reuse ではなく permission review preview として扱う",
      "OCI GenAI、cloud sync、external MCP、browser automation は開始しない"
    ]
  };
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? redactSensitiveText(normalized) : fallback;
}

function redactSensitiveText(value: string): string {
  return value.replace(
    /(api[-_ ]?key|auth|credential|key[-_ ]?file|password|private[-_ ]?key|secret|signature|token|wallet|cookie)\s*[:=]\s*("[^"]+"|'[^']+'|\S+)/gi,
    "$1=REDACTED"
  );
}

function clampCount(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value ?? 0));
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 53 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
