export type BrowserCliCommandKind = "open" | "ask" | "workflow" | "schedule" | "mcp";
export type BrowserCliCommandStatus = "ready" | "review" | "blocked";
export type BrowserCliCommandRisk = "safe" | "review" | "blocked";
export type BrowserCliActionId = "copy_ready_commands" | "review_commands" | "execute_commands";

export type BrowserCliCommand = {
  id: string;
  kind: BrowserCliCommandKind;
  label: string;
  command: string;
  status: BrowserCliCommandStatus;
  risk: BrowserCliCommandRisk;
  detail: string;
  outputPreview: string;
};

export type BrowserCliAction = {
  id: BrowserCliActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserCliControlPreview = {
  id: string;
  title: string;
  workspaceName: string;
  routeLabel: string;
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  commands: BrowserCliCommand[];
  details: string[];
  guardrails: string[];
  actions: BrowserCliAction[];
};

export type BrowserCliControlPreviewOptions = {
  workspaceName: string;
  playbookTitle: string;
  currentUrl: string;
  currentTitle: string;
  providerLabel: string;
  mcpEndpointStatus?: string;
  captureCount: number;
  knowledgeChunkCount: number;
};

export function createBrowserCliControlPreview(options: BrowserCliControlPreviewOptions): BrowserCliControlPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const playbookTitle = normalizeText(options.playbookTitle, "Playbook");
  const currentTitle = normalizeText(options.currentTitle, "Current page");
  const providerLabel = normalizeText(options.providerLabel, "OCI GenAI Enterprise");
  const safeUrl = sanitizeUrl(options.currentUrl);
  const mcpStatus = normalizeText(options.mcpEndpointStatus ?? "preview", "preview");
  const mcpReady = isMcpEndpointReady(mcpStatus);
  const commands: BrowserCliCommand[] = [
    {
      id: "open_current_page",
      kind: "open",
      label: "Open current page",
      command: `launchpad open --workspace ${quoteCliArgument(workspaceName)} --url ${quoteCliArgument(safeUrl)}`,
      status: "ready",
      risk: "safe",
      detail: "現在の page URL を browser preview に戻す read-only command。",
      outputPreview: `tab: ${currentTitle}`
    },
    {
      id: "ask_current_page",
      kind: "ask",
      label: "Ask this page",
      command: `launchpad ask --page current --provider ${quoteCliArgument(providerLabel)} --context local-only`,
      status: "ready",
      risk: "safe",
      detail: "OCI GenAI Enterprise AI Project を既定 provider として、page context の prompt draft を作る。",
      outputPreview: `${Math.max(0, options.knowledgeChunkCount)} knowledge chunks available`
    },
    {
      id: "draft_workflow",
      kind: "workflow",
      label: "Draft workflow",
      command: `launchpad workflow draft --playbook ${quoteCliArgument(playbookTitle)} --approval required`,
      status: "review",
      risk: "review",
      detail: "Council workflow graph の draft だけを作り、保存や実行は user review に残す。",
      outputPreview: "workflow: draft only"
    },
    {
      id: "draft_schedule",
      kind: "schedule",
      label: "Draft schedule",
      command: "launchpad schedule draft --from-current-page --manual-review",
      status: "review",
      risk: "review",
      detail: "現在ページから scheduled task draft を作るが、alarm や background run は開始しない。",
      outputPreview: `${Math.max(0, options.captureCount)} local captures as evidence`
    },
    {
      id: "mcp_status",
      kind: "mcp",
      label: "MCP bridge status",
      command: "launchpad mcp status --scope local-browser --no-start",
      status: mcpReady ? "review" : "blocked",
      risk: mcpReady ? "review" : "blocked",
      detail: mcpReady
        ? "local MCP endpoint の状態確認だけを review command として扱う。"
        : "local MCP endpoint が ready ではないため、接続変更 command は blocked とする。",
      outputPreview: `mcp: ${mcpStatus}`
    }
  ];

  const readyCount = commands.filter((command) => command.status === "ready").length;
  const reviewCount = commands.filter((command) => command.status === "review").length;
  const blockedCount = commands.filter((command) => command.status === "blocked").length;

  return {
    id: `browser-cli-control-${hashSeed(`${workspaceName}:${playbookTitle}:${safeUrl}:${mcpStatus}`)}`,
    title: "CLI Control Preview",
    workspaceName,
    routeLabel: `${currentTitle} / ${providerLabel}`,
    readyCount,
    reviewCount,
    blockedCount,
    commands,
    details: [
      `workspace: ${workspaceName}`,
      `page: ${currentTitle}`,
      `provider: ${providerLabel}`,
      `mcp endpoint: ${mcpStatus}`,
      `captures: ${Math.max(0, options.captureCount)}`,
      `knowledge chunks: ${Math.max(0, options.knowledgeChunkCount)}`
    ],
    guardrails: [
      "BrowserOS source / CLI implementation reuse なし",
      "この preview は shell command、external MCP、OCI call、file write、cloud sync を開始しない",
      "credential、wallet、private key、token は command args に含めない",
      "workflow、schedule、MCP bridge の変更は user review required として扱う",
      "URL query に secret らしい key が含まれる場合は command preview から redaction する"
    ],
    actions: [
      {
        id: "copy_ready_commands",
        label: "Copy ready",
        enabled: readyCount > 0,
        reason: "ready command の preview text だけを確認対象にします。"
      },
      {
        id: "review_commands",
        label: "Review",
        enabled: reviewCount > 0,
        reason: "workflow / schedule / MCP command は review queue に残します。"
      },
      {
        id: "execute_commands",
        label: "Execute",
        enabled: false,
        reason: "この clean-room preview では CLI command を実行しません。"
      }
    ]
  };
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? redactSensitiveText(normalized) : fallback;
}

function sanitizeUrl(value: string): string {
  const normalized = normalizeText(value, "about:blank");

  try {
    const url = new URL(normalized);
    let redacted = false;

    for (const key of Array.from(url.searchParams.keys())) {
      if (isSensitiveKey(key)) {
        url.searchParams.delete(key);
        redacted = true;
      }
    }

    if (redacted) {
      url.searchParams.set("redacted", "1");
    }

    return url.toString();
  } catch {
    return redactSensitiveText(normalized);
  }
}

function isSensitiveKey(value: string): boolean {
  return /api[-_]?key|auth|credential|key[-_]?file|password|private[-_]?key|secret|signature|token|wallet/i.test(value);
}

function redactSensitiveText(value: string): string {
  return value.replace(
    /(api[-_ ]?key|auth|credential|key[-_ ]?file|password|private[-_ ]?key|secret|signature|token|wallet)\s*[:=]\s*("[^"]+"|'[^']+'|\S+)/gi,
    "$1=REDACTED"
  );
}

function quoteCliArgument(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ")}"`;
}

function isMcpEndpointReady(status: string): boolean {
  return /connected|healthy|ok|ready|running/i.test(status);
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 53 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
