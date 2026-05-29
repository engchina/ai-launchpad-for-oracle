export type BrowserExtensionDecision = "allowed" | "review" | "blocked";
export type BrowserExtensionRisk = "low" | "medium" | "high";
export type BrowserExtensionInstallSource = "chrome_import" | "enterprise_policy" | "local_preview" | "manual";
export type BrowserExtensionPermissionScope =
  | "active_tab"
  | "all_sites"
  | "bookmarks"
  | "cookies"
  | "downloads"
  | "history"
  | "native_messaging"
  | "side_panel"
  | "storage";
export type BrowserExtensionActionId = "review_permissions" | "import_from_chrome" | "install_extension";

export type BrowserExtensionPermission = {
  id: string;
  scope: BrowserExtensionPermissionScope;
  label: string;
  decision: BrowserExtensionDecision;
  detail: string;
};

export type BrowserExtensionItem = {
  id: string;
  name: string;
  source: BrowserExtensionInstallSource;
  decision: BrowserExtensionDecision;
  risk: BrowserExtensionRisk;
  siteAccess: string;
  detail: string;
  permissions: BrowserExtensionPermission[];
};

export type BrowserExtensionAction = {
  id: BrowserExtensionActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserExtensionPermissionsPreview = {
  id: string;
  title: string;
  hostname: string;
  currentTitle: string;
  workspaceName: string;
  installedCount: number;
  allowedCount: number;
  reviewCount: number;
  blockedCount: number;
  extensions: BrowserExtensionItem[];
  details: string[];
  guardrails: string[];
  actions: BrowserExtensionAction[];
};

export type BrowserExtensionPermissionsPreviewOptions = {
  workspaceName: string;
  currentUrl: string;
  currentTitle: string;
  captureCount: number;
  connectedMcpCount?: number;
};

export function createBrowserExtensionPermissionsPreview(
  options: BrowserExtensionPermissionsPreviewOptions
): BrowserExtensionPermissionsPreview {
  const hostname = extractHostname(options.currentUrl);
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const currentTitle = normalizeText(options.currentTitle, "Current page");
  const extensions = createExtensionItems({
    hostname,
    workspaceName,
    connectedMcpCount: Math.max(0, options.connectedMcpCount ?? 0)
  });
  const allowedCount = extensions.filter((extension) => extension.decision === "allowed").length;
  const reviewCount = extensions.filter((extension) => extension.decision === "review").length;
  const blockedCount = extensions.filter((extension) => extension.decision === "blocked").length;

  return {
    id: `browser-extension-permissions-${hashSeed(`${workspaceName}:${hostname}:${currentTitle}`)}`,
    title: "Extensions Preview",
    hostname,
    currentTitle,
    workspaceName,
    installedCount: extensions.length,
    allowedCount,
    reviewCount,
    blockedCount,
    extensions,
    details: [
      `workspace: ${workspaceName}`,
      `host: ${hostname || "about:blank"}`,
      `page: ${currentTitle}`,
      `captures: ${Math.max(0, options.captureCount)}`,
      `connected MCP: ${Math.max(0, options.connectedMcpCount ?? 0)}`
    ],
    guardrails: [
      "BrowserOS source / extension manifest / implementation reuse なし",
      "この preview は Chrome Web Store request、extension install、profile write を開始しない",
      "password、cookie、wallet、token、private key を extension context に渡さない",
      "all sites、cookies、history、native messaging は enterprise review required として扱う",
      "OCI Console、customer tenant、payment、credential page では extension automation を blocked にする"
    ],
    actions: [
      {
        id: "review_permissions",
        label: "Review permissions",
        enabled: true,
        reason: "extension permission と site access の review queue を表示します。"
      },
      {
        id: "import_from_chrome",
        label: "Import from Chrome",
        enabled: false,
        reason: "この切片では Chrome profile import を開始しません。"
      },
      {
        id: "install_extension",
        label: "Install extension",
        enabled: false,
        reason: "extension install、update、uninstall は実行しません。"
      }
    ]
  };
}

function createExtensionItems(options: {
  hostname: string;
  workspaceName: string;
  connectedMcpCount: number;
}): BrowserExtensionItem[] {
  const currentHost = options.hostname || "current page";
  const enterprisePage = isEnterpriseHost(options.hostname);

  return [
    {
      id: "oracle-docs-capture-helper",
      name: "Oracle Docs Capture Helper",
      source: "enterprise_policy",
      decision: "allowed",
      risk: "low",
      siteAccess: enterprisePage ? currentHost : "docs.oracle.com only",
      detail: "current page の title、URL、visible text を capture preview に渡す read-only helper。",
      permissions: [
        {
          id: "oracle-docs-active-tab",
          scope: "active_tab",
          label: "Active tab",
          decision: "allowed",
          detail: "user gesture 後の現在 tab だけを読む。"
        },
        {
          id: "oracle-docs-storage",
          scope: "storage",
          label: "Local storage",
          decision: "allowed",
          detail: "capture draft id と UI preference だけを local に保存する。"
        }
      ]
    },
    {
      id: "ublock-origin-compatibility",
      name: "uBlock Origin Compatibility",
      source: "chrome_import",
      decision: "review",
      risk: "medium",
      siteAccess: "all sites / review",
      detail: "Chrome compatible extension として認識するが、filter list と rule import はこの preview では扱わない。",
      permissions: [
        {
          id: "ublock-all-sites",
          scope: "all_sites",
          label: "All sites",
          decision: "review",
          detail: "global request access は enterprise review が必要。"
        },
        {
          id: "ublock-storage",
          scope: "storage",
          label: "Storage",
          decision: "review",
          detail: "rule list、allowlist、mode preference は profile write なしの preview に限定する。"
        }
      ]
    },
    {
      id: "enterprise-password-manager",
      name: "Enterprise Password Manager",
      source: "manual",
      decision: "review",
      risk: "high",
      siteAccess: "login pages / review",
      detail: "password field、cookie、identity session は assistant context から分離し、autofill は user review に残す。",
      permissions: [
        {
          id: "password-cookies",
          scope: "cookies",
          label: "Cookies",
          decision: "review",
          detail: "session cookie への access は prompt / memory / cloud sync に渡さない。"
        },
        {
          id: "password-all-sites",
          scope: "all_sites",
          label: "All sites",
          decision: "review",
          detail: "autofill scope は site allowlist が必要。"
        }
      ]
    },
    {
      id: "ai-autofill-agent",
      name: "AI Autofill Agent",
      source: "local_preview",
      decision: "blocked",
      risk: "high",
      siteAccess: "all sites / blocked",
      detail: "AI による form fill、payment、login、tenant change は browser action approval gate なしでは blocked。",
      permissions: [
        {
          id: "ai-autofill-all-sites",
          scope: "all_sites",
          label: "All sites",
          decision: "blocked",
          detail: "page write / form fill を global scope で許可しない。"
        },
        {
          id: "ai-autofill-history",
          scope: "history",
          label: "History",
          decision: "blocked",
          detail: "semantic history search と extension history access を分離する。"
        }
      ]
    },
    {
      id: "local-mcp-native-host",
      name: "Local MCP Native Host",
      source: "local_preview",
      decision: options.connectedMcpCount > 0 ? "review" : "blocked",
      risk: "high",
      siteAccess: `${options.workspaceName} workspace / local only`,
      detail:
        options.connectedMcpCount > 0
          ? "local MCP bridge は review queue の command / tool boundary として扱う。"
          : "connected MCP がないため native host bridge は blocked。",
      permissions: [
        {
          id: "mcp-native-messaging",
          scope: "native_messaging",
          label: "Native messaging",
          decision: options.connectedMcpCount > 0 ? "review" : "blocked",
          detail: "local connector への bridge は user approval と audit trail が必要。"
        },
        {
          id: "mcp-downloads",
          scope: "downloads",
          label: "Downloads",
          decision: "review",
          detail: "generated artifact の download は file write review として扱う。"
        }
      ]
    }
  ];
}

function isEnterpriseHost(hostname: string): boolean {
  return ["docs.oracle.com", "cloud.oracle.com", "livelabs.oracle.com"].some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
}

function extractHostname(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
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
    hash = (hash * 53 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
