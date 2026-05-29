import type { BrowserMcpEndpointState } from "./api";

export type BrowserMcpClientCommandId = "codex" | "claude-code" | "gemini-cli" | "openclaw" | "claude-desktop";

export type BrowserMcpClientCommand = {
  id: BrowserMcpClientCommandId;
  label: string;
  description: string;
  command: string;
};

export type BrowserMcpClientOnboardingStatus = "ready" | "endpoint_stopped" | "copy_required" | "review_required";

export type BrowserMcpClientOnboardingClient = BrowserMcpClientCommand & {
  transportLabel: string;
  status: BrowserMcpClientOnboardingStatus;
  verificationPrompt: string;
  riskLabel: string;
};

export type BrowserMcpClientOnboardingPreview = {
  id: string;
  title: string;
  endpointUrl: string;
  endpointStatus: BrowserMcpEndpointState["status"];
  localOnlyNotice: string;
  clients: BrowserMcpClientOnboardingClient[];
  setupSteps: Array<{
    id: string;
    title: string;
    detail: string;
    status: BrowserMcpClientOnboardingStatus;
  }>;
  toolCategories: Array<{
    label: string;
    count: number;
    scope: "read" | "review" | "blocked";
  }>;
  externalAppGroups: Array<{
    label: string;
    examples: string[];
    authBoundary: "connected" | "oauth_required" | "manual_fallback";
  }>;
  customMcpServer: {
    title: string;
    sseUrlPlaceholder: string;
    status: BrowserMcpClientOnboardingStatus;
    guardrail: string;
  };
  stats: Array<{
    label: string;
    value: string;
  }>;
  guardrails: string[];
};

export function getBrowserMcpEndpointDisplayUrl(state: BrowserMcpEndpointState): string {
  return state.url ?? `http://${state.config.host}:${state.config.port}${state.config.endpointPath}`;
}

export function createBrowserMcpClientCommands(endpointUrl: string): BrowserMcpClientCommand[] {
  return [
    {
      id: "codex",
      label: "Codex CLI",
      description: "OpenAI Codex CLI HTTP MCP",
      command: `codex mcp add ai-launchpad-browser ${endpointUrl} --transport http`
    },
    {
      id: "claude-code",
      label: "Claude Code",
      description: "Claude Code user scope HTTP MCP",
      command: `claude mcp add --transport http ai-launchpad-browser ${endpointUrl} --scope user`
    },
    {
      id: "gemini-cli",
      label: "Gemini CLI",
      description: "Gemini CLI user scope HTTP MCP",
      command: `gemini mcp add ai-launchpad-browser ${endpointUrl} --transport http --scope user`
    },
    {
      id: "openclaw",
      label: "OpenClaw",
      description: "openclaw.json mcpServers entry",
      command: JSON.stringify(
        {
          mcpServers: {
            "ai-launchpad-browser": {
              url: endpointUrl
            }
          }
        },
        null,
        2
      )
    },
    {
      id: "claude-desktop",
      label: "Claude Desktop",
      description: "Claude Desktop mcp-remote bridge",
      command: JSON.stringify(
        {
          mcpServers: {
            "ai-launchpad-browser": {
              command: "npx",
              args: ["mcp-remote", endpointUrl]
            }
          }
        },
        null,
        2
      )
    }
  ];
}

export function createBrowserMcpClientOnboardingPreview(
  state: BrowserMcpEndpointState
): BrowserMcpClientOnboardingPreview {
  const endpointUrl = getBrowserMcpEndpointDisplayUrl(state);
  const endpointReady = state.status === "running";
  const clients = createBrowserMcpClientCommands(endpointUrl).map((command): BrowserMcpClientOnboardingClient => {
    const status: BrowserMcpClientOnboardingStatus = endpointReady
      ? command.id === "openclaw" || command.id === "claude-desktop"
        ? "copy_required"
        : "ready"
      : "endpoint_stopped";

    return {
      ...command,
      transportLabel: command.id === "claude-desktop" ? "mcp-remote" : command.id === "openclaw" ? "json config" : "http",
      status,
      verificationPrompt: createVerificationPrompt(command.id),
      riskLabel: command.id === "claude-code" ? "confirmation prompts recommended" : "review browser actions"
    };
  });
  const toolCategories = createToolCategories();
  const externalAppGroups = createExternalAppGroups();

  return {
    id: `mcp-client-onboarding-${hashSeed(`${endpointUrl}:${state.status}`)}`,
    title: "MCP Client Onboarding Preview",
    endpointUrl,
    endpointStatus: state.status,
    localOnlyNotice:
      "MCP client onboarding は local endpoint URL、client command、tool category、OAuth boundary を表示する preview です。外部 client config は自動変更しません。",
    clients,
    setupSteps: [
      {
        id: "open-settings",
        title: "Open MCP settings",
        detail: "BrowserOS-like MCP settings で endpoint URL と health status を確認します。",
        status: "ready"
      },
      {
        id: "copy-url",
        title: "Copy server URL",
        detail: endpointUrl,
        status: endpointReady ? "ready" : "endpoint_stopped"
      },
      {
        id: "add-client",
        title: "Add client command",
        detail: "Codex、Claude Code、Gemini CLI、OpenClaw、Claude Desktop のいずれかに HTTP MCP endpoint を登録します。",
        status: endpointReady ? "copy_required" : "endpoint_stopped"
      },
      {
        id: "test-prompt",
        title: "Run test prompt",
        detail: "現在ページの取得、screenshot、navigation preview から始め、write action は approval gate に残します。",
        status: endpointReady ? "review_required" : "endpoint_stopped"
      }
    ],
    toolCategories,
    externalAppGroups,
    customMcpServer: {
      title: "Custom MCP Server",
      sseUrlPlaceholder: "http://localhost:8000/sse",
      status: "review_required",
      guardrail: "SSE server URL は preview だけです。OAuth proxy、supergateway、remote MCP process は起動しません。"
    },
    stats: [
      { label: "Clients", value: String(clients.length) },
      { label: "Browser tools", value: String(toolCategories.reduce((sum, category) => sum + category.count, 0)) },
      { label: "App groups", value: String(externalAppGroups.length) },
      { label: "Endpoint", value: state.status }
    ],
    guardrails: [
      "client command は copy-only preview とし、外部 CLI、config file、Claude Desktop config は変更しない。",
      "browser write tools、history delete、file export、connected app write は approval gate で停止する。",
      "OAuth token、API key、cookie、wallet、private key は command、prompt、metadata に含めない。",
      "BrowserOS source / MCP implementation / UI implementation reuse なし。"
    ]
  };
}

function createVerificationPrompt(clientId: BrowserMcpClientCommandId): string {
  const target = clientId === "claude-code" ? "Claude Code" : clientId === "gemini-cli" ? "Gemini CLI" : clientId === "openclaw" ? "OpenClaw" : clientId === "claude-desktop" ? "Claude Desktop" : "Codex";
  return `${target} から AI Launchpad Browser の現在ページを取得し、title、URL、screenshot readiness を確認してください。`;
}

function createToolCategories(): BrowserMcpClientOnboardingPreview["toolCategories"] {
  return [
    { label: "Navigation & Tabs", count: 8, scope: "review" },
    { label: "Content & Observation", count: 8, scope: "read" },
    { label: "Interaction & Input", count: 14, scope: "review" },
    { label: "File & Export", count: 3, scope: "review" },
    { label: "Window Management", count: 5, scope: "review" },
    { label: "Tab Groups", count: 5, scope: "review" },
    { label: "Bookmarks", count: 6, scope: "review" },
    { label: "History", count: 4, scope: "blocked" }
  ];
}

function createExternalAppGroups(): BrowserMcpClientOnboardingPreview["externalAppGroups"] {
  return [
    { label: "Email", examples: ["Gmail", "Outlook Mail"], authBoundary: "oauth_required" },
    { label: "Calendar", examples: ["Google Calendar", "Outlook Calendar"], authBoundary: "oauth_required" },
    { label: "Messaging", examples: ["Slack", "Microsoft Teams"], authBoundary: "oauth_required" },
    { label: "Development", examples: ["GitHub", "Linear"], authBoundary: "oauth_required" },
    { label: "Oracle Enterprise", examples: ["OCI GenAI Project", "Oracle AI Database"], authBoundary: "connected" },
    { label: "Manual fallback", examples: ["Browser automation", "Web app sign-in"], authBoundary: "manual_fallback" }
  ];
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 37 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
