import type { PageSourceType } from "./api";

export type BrowserChatProviderId = "oci_genai_enterprise" | "oracle_vector_grounding" | "local_keyword_baseline";
export type BrowserChatContextState = "included" | "available" | "missing";
export type BrowserChatToolbarActionId = "copy_context" | "attach_screenshot" | "reset_chat" | "open_external" | "open_hub";

export type BrowserChatProvider = {
  id: BrowserChatProviderId;
  label: string;
  role: string;
  status: "default" | "grounding" | "fallback";
  description: string;
};

export type BrowserChatContextItem = {
  id: string;
  label: string;
  value: string;
  state: BrowserChatContextState;
  description: string;
};

export type BrowserChatToolbarAction = {
  id: BrowserChatToolbarActionId;
  label: string;
  enabled: boolean;
  shortcut?: string;
  reason: string;
};

export type BrowserChatAttachment = {
  id: string;
  kind: "page_context" | "selection" | "screenshot" | "knowledge";
  label: string;
  status: BrowserChatContextState;
  description: string;
};

export type BrowserChatPanelPreview = {
  id: string;
  title: string;
  activeProviderId: BrowserChatProviderId;
  activeProviderLabel: string;
  shortcutLabel: string;
  providerCycleShortcutLabel: string;
  contextSummary: string;
  promptPlaceholder: string;
  tokenBudgetLabel: string;
  localOnlyNotice: string;
  providers: BrowserChatProvider[];
  contextItems: BrowserChatContextItem[];
  toolbarActions: BrowserChatToolbarAction[];
  attachments: BrowserChatAttachment[];
  guardrails: string[];
};

export type BrowserChatPanelPreviewPayload = {
  workspaceName: string;
  url: string;
  title: string;
  sourceType: PageSourceType;
  selectedText?: string;
  captureCount?: number;
  knowledgeChunkCount?: number;
  screenshotAttached?: boolean;
  activeProviderId?: BrowserChatProviderId;
};

export type BrowserHubPaneCount = 1 | 2 | 3;
export type BrowserHubResponseState = "preview_ready" | "needs_evidence" | "local_only";

export type BrowserHubPanePreview = {
  id: string;
  paneIndex: number;
  providerId: BrowserChatProviderId;
  providerLabel: string;
  status: "ready" | "grounded" | "local_only";
  selected: boolean;
  title: string;
  summary: string;
  contextRoute: string;
  responseState: BrowserHubResponseState;
  responseTitle: string;
  responsePreview: string;
  evidenceLabel: string;
  privacyLabel: string;
  executionLabel: string;
  actionLabel: string;
  sendEnabled: boolean;
};

export type BrowserHubComparisonPreview = {
  id: string;
  title: string;
  paneCount: BrowserHubPaneCount;
  panelSelector: BrowserHubPaneCount[];
  activeProviderId: BrowserChatProviderId;
  promptMirrorLabel: string;
  panes: BrowserHubPanePreview[];
  comparisonChecks: string[];
  guardrails: string[];
};

const browserChatProviders: BrowserChatProvider[] = [
  {
    id: "oci_genai_enterprise",
    label: "OCI GenAI Project",
    role: "Default answer lane",
    status: "default",
    description: "Enterprise AI Project を既定 provider とし、page context と Knowledge を送信前 preview にまとめます。"
  },
  {
    id: "oracle_vector_grounding",
    label: "Oracle Vector Grounding",
    role: "Grounded lane",
    status: "grounding",
    description: "Oracle Vector Search の検索候補を context として比較し、引用付き回答の材料にします。"
  },
  {
    id: "local_keyword_baseline",
    label: "Local Keyword Baseline",
    role: "Local fallback lane",
    status: "fallback",
    description: "外部送信なしで page / capture / Knowledge の keyword baseline を作る preview です。"
  }
];

export function getBrowserChatProviders(): BrowserChatProvider[] {
  return browserChatProviders.map((provider) => ({ ...provider }));
}

export function getNextBrowserChatProviderId(activeProviderId: BrowserChatProviderId): BrowserChatProviderId {
  const providers = getBrowserChatProviders();
  const activeIndex = providers.findIndex((provider) => provider.id === activeProviderId);
  const nextIndex = activeIndex >= 0 ? (activeIndex + 1) % providers.length : 0;

  return providers[nextIndex].id;
}

export function createBrowserChatPanelPreview(payload: BrowserChatPanelPreviewPayload): BrowserChatPanelPreview {
  const providers = getBrowserChatProviders();
  const activeProvider = providers.find((provider) => provider.id === payload.activeProviderId) ?? providers[0];
  const selectedText = payload.selectedText?.trim() ?? "";
  const captureCount = Math.max(0, Math.floor(payload.captureCount ?? 0));
  const knowledgeChunkCount = Math.max(0, Math.floor(payload.knowledgeChunkCount ?? 0));
  const screenshotAttached = Boolean(payload.screenshotAttached);
  const contextItems: BrowserChatContextItem[] = [
    {
      id: "page",
      label: "Page",
      value: trimForPreview(payload.title || payload.url, 80),
      state: "included",
      description: `${payload.sourceType} / ${payload.url}`
    },
    {
      id: "selection",
      label: "Selection",
      value: selectedText.length > 0 ? trimForPreview(selectedText, 80) : "not selected",
      state: selectedText.length > 0 ? "included" : "missing",
      description: "選択テキストがある場合だけ prompt context に含めます。"
    },
    {
      id: "screenshot",
      label: "Screenshot",
      value: screenshotAttached ? "attached" : "available on demand",
      state: screenshotAttached ? "included" : "available",
      description: "visible page screenshot は明示 action の後だけ添付します。"
    },
    {
      id: "knowledge",
      label: "Knowledge",
      value: `${knowledgeChunkCount} chunks / ${captureCount} captures`,
      state: knowledgeChunkCount > 0 || captureCount > 0 ? "included" : "available",
      description: "local captures と Knowledge chunk を必要範囲だけ渡します。"
    }
  ];
  const includedCount = contextItems.filter((item) => item.state === "included").length;
  const tokenBudgetEstimate = estimateTokenBudget(payload.title, selectedText, knowledgeChunkCount, screenshotAttached);

  return {
    id: `browser-chat-panel-${hashSeed(`${payload.workspaceName}:${payload.url}:${activeProvider.id}`)}`,
    title: `${payload.workspaceName} Chat`,
    activeProviderId: activeProvider.id,
    activeProviderLabel: activeProvider.label,
    shortcutLabel: "Option+K 相当",
    providerCycleShortcutLabel: "Option+L 相当",
    contextSummary: `${includedCount}/${contextItems.length} context sources included`,
    promptPlaceholder: "現在ページについて OCI GenAI に質問する...",
    tokenBudgetLabel: `context budget ${tokenBudgetEstimate} tokens preview`,
    localOnlyNotice: "Chat context preview は送信前確認用です。secret、wallet、private key は prompt に含めません。",
    providers,
    contextItems,
    toolbarActions: [
      {
        id: "copy_context",
        label: "Copy page context",
        enabled: true,
        reason: "現在ページの title、URL、source type を clipboard 用 context にまとめます。"
      },
      {
        id: "attach_screenshot",
        label: screenshotAttached ? "Screenshot attached" : "Attach screenshot",
        enabled: !screenshotAttached,
        reason: screenshotAttached ? "visible page screenshot は既に preview に添付されています。" : "visible page screenshot を視覚質問用に追加します。"
      },
      {
        id: "reset_chat",
        label: "Reset chat",
        enabled: true,
        reason: "local chat draft と添付候補をリセットします。"
      },
      {
        id: "open_external",
        label: "Open provider",
        enabled: activeProvider.id === "oci_genai_enterprise",
        reason: activeProvider.id === "oci_genai_enterprise" ? "OCI GenAI Project context を新しい provider view で開く候補です。" : "fallback lane は外部 provider を開きません。"
      },
      {
        id: "open_hub",
        label: "Popout Hub",
        enabled: true,
        shortcut: "Cmd+Shift+U 相当",
        reason: "同じ prompt を最大3 pane の comparison hub に展開します。"
      }
    ],
    attachments: [
      {
        id: "attachment-page",
        kind: "page_context",
        label: "Current page",
        status: "included",
        description: trimForPreview(payload.url, 90)
      },
      {
        id: "attachment-selection",
        kind: "selection",
        label: "Selected text",
        status: selectedText.length > 0 ? "included" : "missing",
        description: selectedText.length > 0 ? trimForPreview(selectedText, 90) : "selection はまだありません。"
      },
      {
        id: "attachment-screenshot",
        kind: "screenshot",
        label: "Visible screenshot",
        status: screenshotAttached ? "included" : "available",
        description: screenshotAttached ? "screenshot attachment preview ready" : "toolbar action で追加できます。"
      },
      {
        id: "attachment-knowledge",
        kind: "knowledge",
        label: "Knowledge context",
        status: knowledgeChunkCount > 0 || captureCount > 0 ? "included" : "available",
        description: `${knowledgeChunkCount} chunks / ${captureCount} captures`
      }
    ],
    guardrails: [
      "OCI GenAI へ送る前に context sources と添付を UI で確認する。",
      "secret、wallet、private key、private token は context preview から除外する。",
      "screenshot と外部 provider view は user action 後だけ有効化する。"
    ]
  };
}

export function createBrowserHubComparisonPreview(
  panel: BrowserChatPanelPreview,
  requestedPaneCount: number
): BrowserHubComparisonPreview {
  const paneCount = clampPaneCount(requestedPaneCount);
  const knowledgeReady = panel.attachments.some((attachment) => attachment.kind === "knowledge" && attachment.status === "included");
  const orderedProviders = [
    ...panel.providers.filter((provider) => provider.id === panel.activeProviderId),
    ...panel.providers.filter((provider) => provider.id !== panel.activeProviderId)
  ].slice(0, paneCount);

  return {
    id: `browser-chat-hub-${hashSeed(`${panel.id}:${paneCount}`)}`,
    title: "LLM Hub Preview",
    paneCount,
    panelSelector: [1, 2, 3],
    activeProviderId: panel.activeProviderId,
    promptMirrorLabel: "same prompt mirrored to every pane before any provider call",
    panes: orderedProviders.map((provider, index) => ({
      id: `browser-chat-hub-pane-${index + 1}-${provider.id}`,
      paneIndex: index + 1,
      providerId: provider.id,
      providerLabel: provider.label,
      status:
        provider.id === "oci_genai_enterprise"
          ? "ready"
          : provider.id === "oracle_vector_grounding"
            ? "grounded"
            : "local_only",
      selected: provider.id === panel.activeProviderId,
      title: `Pane ${index + 1}: ${provider.role}`,
      summary: provider.description,
      contextRoute:
        provider.id === "oci_genai_enterprise"
          ? "page context + attachments -> OCI GenAI Project"
          : provider.id === "oracle_vector_grounding"
            ? "page context -> Oracle Vector Search grounding"
            : "page context -> local keyword baseline",
      ...createHubPaneResponse(provider.id, panel, knowledgeReady)
    })),
    comparisonChecks: [
      "同じ prompt と同じ page context を各 pane に mirror する。",
      "OCI lane、Oracle Vector lane、local baseline lane の差分を送信前に比較する。",
      "回答 draft は preview だけで、provider call や external BYOK call は開始しない。"
    ],
    guardrails: [
      "BrowserOS LLM Hub source / UI implementation reuse なし",
      "Claude、ChatGPT、Gemini などの external BYOK provider lane はこの project では使わない",
      "既定 lane は OCI GenAI Enterprise AI Project とし、send action は disabled のままにする"
    ]
  };
}

function createHubPaneResponse(
  providerId: BrowserChatProviderId,
  panel: BrowserChatPanelPreview,
  knowledgeReady: boolean
): Pick<
  BrowserHubPanePreview,
  "responseState" | "responseTitle" | "responsePreview" | "evidenceLabel" | "privacyLabel" | "executionLabel" | "actionLabel" | "sendEnabled"
> {
  if (providerId === "oci_genai_enterprise") {
    return {
      responseState: "preview_ready",
      responseTitle: "OCI answer draft",
      responsePreview: `${panel.contextSummary} を使い、OCI GenAI Enterprise AI Project に送信する前の回答構成を確認します。`,
      evidenceLabel: panel.tokenBudgetLabel,
      privacyLabel: "enterprise provider / secrets excluded",
      executionLabel: "provider call disabled",
      actionLabel: "Review OCI draft",
      sendEnabled: false
    };
  }

  if (providerId === "oracle_vector_grounding") {
    return {
      responseState: knowledgeReady ? "preview_ready" : "needs_evidence",
      responseTitle: knowledgeReady ? "Grounded answer draft" : "Grounding needs evidence",
      responsePreview: knowledgeReady
        ? "Knowledge と capture evidence を引用候補として並べ、OCI answer lane に渡す grounding summary を確認します。"
        : "Knowledge chunk または capture を追加すると、Oracle Vector grounding lane の比較精度を上げられます。",
      evidenceLabel: knowledgeReady ? "knowledge evidence included" : "knowledge evidence missing",
      privacyLabel: "local evidence review",
      executionLabel: "vector query disabled",
      actionLabel: "Review grounding",
      sendEnabled: false
    };
  }

  return {
    responseState: "local_only",
    responseTitle: "Local baseline draft",
    responsePreview: "page title、URL、selection、capture text の keyword baseline だけで、provider 非依存の回答骨子を作ります。",
    evidenceLabel: "local keyword context",
    privacyLabel: "offline / no provider call",
    executionLabel: "local preview only",
    actionLabel: "Review baseline",
    sendEnabled: false
  };
}

function trimForPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function estimateTokenBudget(title: string, selectedText: string, knowledgeChunkCount: number, screenshotAttached: boolean): number {
  const base = 900;
  const titleBudget = Math.ceil(title.length / 4);
  const selectionBudget = Math.min(800, Math.ceil(selectedText.length / 4));
  const knowledgeBudget = Math.min(1800, knowledgeChunkCount * 300);
  const screenshotBudget = screenshotAttached ? 600 : 0;

  return base + titleBudget + selectionBudget + knowledgeBudget + screenshotBudget;
}

function clampPaneCount(value: number): BrowserHubPaneCount {
  if (value <= 1) {
    return 1;
  }

  if (value >= 3) {
    return 3;
  }

  return 2;
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
