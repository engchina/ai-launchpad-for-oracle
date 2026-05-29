export type BrowserAppConnectorCategory = "ai" | "database" | "storage" | "browser" | "business";

export type BrowserAppConnectorStatus = "connected" | "needs_auth" | "manual_fallback" | "blocked";

export type BrowserAppConnectorScopeDecision = "allowed" | "review_required" | "blocked";

export type BrowserAppConnectorScope = {
  id: string;
  label: string;
  decision: BrowserAppConnectorScopeDecision;
  reason: string;
};

export type BrowserAppConnectorAction = {
  id: "connect" | "disconnect" | "manual" | "review";
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserAppConnector = {
  id: string;
  name: string;
  category: BrowserAppConnectorCategory;
  description: string;
  status: BrowserAppConnectorStatus;
  statusLabel: string;
  lastCheckedLabel: string;
  scopes: BrowserAppConnectorScope[];
  actions: BrowserAppConnectorAction[];
  manualFallback: string;
  guardrails: string[];
  recommended: boolean;
};

export type BrowserAppConnectorsPreview = {
  id: string;
  title: string;
  workspaceName: string;
  localOnlyNotice: string;
  connectors: BrowserAppConnector[];
  recommendedConnectorIds: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
  guardrails: string[];
};

export type BrowserAppConnectorsPreviewPayload = {
  workspaceName: string;
  playbookTitle: string;
  connectedConnectorIds?: string[];
  blockedConnectorIds?: string[];
  manualFallbackConnectorIds?: string[];
  nowLabel?: string;
};

type ConnectorDefinition = {
  id: string;
  name: string;
  category: BrowserAppConnectorCategory;
  description: string;
  defaultStatus: BrowserAppConnectorStatus;
  recommended: boolean;
  scopes: Array<Pick<BrowserAppConnectorScope, "id" | "label" | "decision">>;
  manualFallback: string;
};

const connectorDefinitions: ConnectorDefinition[] = [
  {
    id: "oci_genai_project",
    name: "OCI Generative AI Project",
    category: "ai",
    description: "Chat、agent planning、RAG answer の既定 enterprise AI provider として使います。",
    defaultStatus: "connected",
    recommended: true,
    scopes: [
      { id: "chat", label: "chat / answer generation", decision: "allowed" },
      { id: "planning", label: "agent plan drafting", decision: "review_required" }
    ],
    manualFallback: "OCI GenAI が利用できない場合は local keyword baseline と Oracle Vector grounding preview に戻します。"
  },
  {
    id: "oracle_ai_database",
    name: "Oracle AI Database",
    category: "database",
    description: "Oracle Vector Search、Select AI、SQL preview の enterprise data grounding に使います。",
    defaultStatus: "connected",
    recommended: true,
    scopes: [
      { id: "vector", label: "vector search read", decision: "allowed" },
      { id: "sql_preview", label: "SQL preview only", decision: "review_required" }
    ],
    manualFallback: "wallet や接続情報が未準備の場合は document-only grounding で回答します。"
  },
  {
    id: "oci_object_storage",
    name: "OCI Object Storage",
    category: "storage",
    description: "提案資料、PDF、capture artifact の staging readiness を確認します。",
    defaultStatus: "needs_auth",
    recommended: true,
    scopes: [
      { id: "list_bucket", label: "bucket list / metadata read", decision: "review_required" },
      { id: "upload_preview", label: "upload preview", decision: "blocked" }
    ],
    manualFallback: "未接続時は local file と user-selected document だけを ingestion 候補にします。"
  },
  {
    id: "browser_control_mcp",
    name: "Browser Control MCP",
    category: "browser",
    description: "tabs、navigation、extract、screenshot などの browser action tool を公開します。",
    defaultStatus: "manual_fallback",
    recommended: true,
    scopes: [
      { id: "observe", label: "page observation", decision: "allowed" },
      { id: "mutate", label: "click / type / navigation", decision: "review_required" }
    ],
    manualFallback: "HTTP endpoint が停止中でも renderer preview と manual browser action で作業を継続します。"
  },
  {
    id: "business_email",
    name: "Business Email",
    category: "business",
    description: "メール検索、返信 draft、follow-up 送信前確認に使う business app connector です。",
    defaultStatus: "needs_auth",
    recommended: false,
    scopes: [
      { id: "read_mail", label: "read recent messages", decision: "review_required" },
      { id: "send_mail", label: "send messages", decision: "blocked" }
    ],
    manualFallback: "OAuth 未接続時は mail web app を開き、送信前に本文と宛先を人が確認します。"
  },
  {
    id: "business_calendar",
    name: "Business Calendar",
    category: "business",
    description: "予定確認、空き時間探索、meeting draft の確認に使う business app connector です。",
    defaultStatus: "needs_auth",
    recommended: false,
    scopes: [
      { id: "read_calendar", label: "read availability", decision: "review_required" },
      { id: "create_event", label: "create events", decision: "blocked" }
    ],
    manualFallback: "未接続時は calendar web app を開き、保存前に日時と参加者を確認します。"
  }
];

export function createBrowserAppConnectorsPreview(
  payload: BrowserAppConnectorsPreviewPayload
): BrowserAppConnectorsPreview {
  const connectedConnectorIds = new Set(payload.connectedConnectorIds ?? []);
  const blockedConnectorIds = new Set(payload.blockedConnectorIds ?? []);
  const manualFallbackConnectorIds = new Set(payload.manualFallbackConnectorIds ?? []);
  const connectors = connectorDefinitions.map((definition) =>
    createConnector(definition, {
      connectedConnectorIds,
      blockedConnectorIds,
      manualFallbackConnectorIds,
      nowLabel: payload.nowLabel ?? "preview now"
    })
  );
  const recommendedConnectorIds = connectors.filter((connector) => connector.recommended).map((connector) => connector.id);

  return {
    id: `connect-apps-preview-${hashSeed(`${payload.workspaceName}:${payload.playbookTitle}:${connectors.map((connector) => connector.status).join(":")}`)}`,
    title: "Connect Apps Preview",
    workspaceName: payload.workspaceName,
    localOnlyNotice:
      "Connect Apps preview は MCP / OAuth / manual fallback の状態だけを表示します。認可 token、password、secret は prompt に含めません。",
    connectors,
    recommendedConnectorIds,
    stats: [
      { label: "Connected", value: String(connectors.filter((connector) => connector.status === "connected").length) },
      { label: "Needs auth", value: String(connectors.filter((connector) => connector.status === "needs_auth").length) },
      { label: "Fallback", value: String(connectors.filter((connector) => connector.status === "manual_fallback").length) },
      { label: "Blocked", value: String(connectors.filter((connector) => connector.status === "blocked").length) }
    ],
    guardrails: [
      "認可は connector 側で完了させ、LLM prompt へ credential を渡さない。",
      "send、create、delete、権限変更は connector が connected でも approval gate で停止する。",
      "未接続 app は Connect / Do manually の選択を表示し、decline は local state として扱う。"
    ]
  };
}

function createConnector(
  definition: ConnectorDefinition,
  state: {
    connectedConnectorIds: Set<string>;
    blockedConnectorIds: Set<string>;
    manualFallbackConnectorIds: Set<string>;
    nowLabel: string;
  }
): BrowserAppConnector {
  const status = resolveStatus(definition, state);
  const scopes = definition.scopes.map((scope) => ({
    ...scope,
    decision: status === "blocked" ? "blocked" : scope.decision,
    reason: createScopeReason(scope.decision, status)
  }));

  return {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    description: definition.description,
    status,
    statusLabel: statusLabels[status],
    lastCheckedLabel: state.nowLabel,
    scopes,
    actions: createActions(status),
    manualFallback: definition.manualFallback,
    guardrails: createConnectorGuardrails(status),
    recommended: definition.recommended
  };
}

function resolveStatus(
  definition: ConnectorDefinition,
  state: {
    connectedConnectorIds: Set<string>;
    blockedConnectorIds: Set<string>;
    manualFallbackConnectorIds: Set<string>;
  }
): BrowserAppConnectorStatus {
  if (state.blockedConnectorIds.has(definition.id)) {
    return "blocked";
  }

  if (state.connectedConnectorIds.has(definition.id)) {
    return "connected";
  }

  if (state.manualFallbackConnectorIds.has(definition.id)) {
    return "manual_fallback";
  }

  return definition.defaultStatus;
}

const statusLabels: Record<BrowserAppConnectorStatus, string> = {
  connected: "connected",
  needs_auth: "needs OAuth",
  manual_fallback: "manual fallback",
  blocked: "blocked"
};

function createActions(status: BrowserAppConnectorStatus): BrowserAppConnectorAction[] {
  if (status === "connected") {
    return [
      {
        id: "review",
        label: "Review scopes",
        enabled: true,
        reason: "connector の scope と approval policy を確認します。"
      },
      {
        id: "disconnect",
        label: "Disconnect later",
        enabled: false,
        reason: "preview では実 connector を切断しません。"
      }
    ];
  }

  if (status === "blocked") {
    return [
      {
        id: "review",
        label: "Review blocker",
        enabled: true,
        reason: "workspace policy により blocked になっている理由を確認します。"
      },
      {
        id: "manual",
        label: "Manual only",
        enabled: false,
        reason: "blocked connector は manual fallback のみを表示します。"
      }
    ];
  }

  return [
    {
      id: "connect",
      label: "Connect",
      enabled: status === "needs_auth",
      reason: status === "needs_auth" ? "OAuth / MCP 認可を開始する preview です。" : "manual fallback が選択済みです。"
    },
    {
      id: "manual",
      label: "Do manually",
      enabled: true,
      reason: "integration を使わず browser automation fallback で進めます。"
    }
  ];
}

function createScopeReason(decision: BrowserAppConnectorScopeDecision, status: BrowserAppConnectorStatus): string {
  if (status === "blocked") {
    return "workspace policy により、この connector scope は実行しません。";
  }

  if (decision === "allowed") {
    return "read-only または observation scope として許可できます。";
  }

  if (decision === "review_required") {
    return "実行前にユーザー確認と audit log が必要です。";
  }

  return "write / send / upload 系のため preview では blocked として扱います。";
}

function createConnectorGuardrails(status: BrowserAppConnectorStatus): string[] {
  const guardrails = [
    "credential は OS / connector storage に限定する。",
    "tool call と result は audit preview に残す。"
  ];

  if (status !== "connected") {
    guardrails.push("未接続時は browser automation fallback を先に提示する。");
  }

  if (status === "blocked") {
    guardrails.push("blocked connector は再認可ではなく workspace policy review に回す。");
  }

  return guardrails;
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
