export type BrowserProviderSettingKind = "primary_provider" | "agent_routing" | "grounding" | "local_fallback" | "external_byok" | "secrets";
export type BrowserProviderSettingDecision = "ready" | "review" | "blocked";
export type BrowserProviderSettingActionId = "review_provider_settings" | "save_provider_settings" | "test_provider";

export type BrowserProviderSettingItem = {
  id: string;
  kind: BrowserProviderSettingKind;
  label: string;
  detail: string;
  decision: BrowserProviderSettingDecision;
  valueLabel: string;
  riskLabel: string;
};

export type BrowserProviderSettingAction = {
  id: BrowserProviderSettingActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserProviderSettingsPreview = {
  id: string;
  title: string;
  workspaceName: string;
  activeProviderLabel: string;
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  items: BrowserProviderSettingItem[];
  actions: BrowserProviderSettingAction[];
  guardrails: string[];
};

export type BrowserProviderSettingsPreviewOptions = {
  workspaceName: string;
  activeProviderLabel?: string;
  connectorStatus?: string;
  knowledgeChunkCount?: number;
  captureCount?: number;
  activeModeLabel?: string;
};

export function createBrowserProviderSettingsPreview(
  options: BrowserProviderSettingsPreviewOptions
): BrowserProviderSettingsPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const activeProviderLabel = normalizeText(options.activeProviderLabel ?? "OCI GenAI Enterprise AI Project", "OCI GenAI Enterprise AI Project");
  const connectorStatus = normalizeText(options.connectorStatus ?? "preview", "preview");
  const knowledgeChunkCount = clampCount(options.knowledgeChunkCount);
  const captureCount = clampCount(options.captureCount);
  const activeModeLabel = normalizeText(options.activeModeLabel ?? "Agent", "Agent");
  const ociDecision: BrowserProviderSettingDecision = /ok|ready|healthy|connected/i.test(connectorStatus) ? "ready" : "review";
  const groundingDecision: BrowserProviderSettingDecision = knowledgeChunkCount > 0 || captureCount > 0 ? "ready" : "review";
  const items: BrowserProviderSettingItem[] = [
    {
      id: "provider-settings-oci-genai",
      kind: "primary_provider",
      label: "OCI GenAI Enterprise AI Project",
      detail: "Chat、Agent、Workflow の既定 provider として OCI Generative AI / Enterprise AI Project を使います。",
      decision: ociDecision,
      valueLabel: connectorStatus,
      riskLabel: ociDecision === "ready" ? "connector ready" : "config review"
    },
    {
      id: "provider-settings-agent-routing",
      kind: "agent_routing",
      label: "Agent model routing",
      detail: "Chat / Agent / Council / Schedule の routing を OCI provider 前提の review draft として扱います。",
      decision: "review",
      valueLabel: activeModeLabel,
      riskLabel: "routing draft"
    },
    {
      id: "provider-settings-grounding",
      kind: "grounding",
      label: "Oracle grounding",
      detail: "Knowledge chunks と page captures を OCI GenAI 送信前の local evidence として確認します。",
      decision: groundingDecision,
      valueLabel: `${knowledgeChunkCount} chunks / ${captureCount} captures`,
      riskLabel: groundingDecision === "ready" ? "local evidence ready" : "needs evidence"
    },
    {
      id: "provider-settings-local-baseline",
      kind: "local_fallback",
      label: "Local keyword baseline",
      detail: "OCI GenAI が未接続でも回答 preview と evidence search を local keyword baseline で維持します。",
      decision: "ready",
      valueLabel: "offline preview",
      riskLabel: "no model call"
    },
    {
      id: "provider-settings-external-byok",
      kind: "external_byok",
      label: "External BYOK providers",
      detail: "Gemini、Claude、OpenAI、OpenRouter、Ollama などの BrowserOS provider 実装はこの project では使いません。",
      decision: "blocked",
      valueLabel: "OCI only",
      riskLabel: "out of scope"
    },
    {
      id: "provider-settings-secrets",
      kind: "secrets",
      label: "Secrets and API keys",
      detail: "API key、token、wallet、private key は renderer provider settings に保存しません。",
      decision: "blocked",
      valueLabel: "0 secrets stored",
      riskLabel: "secrets excluded"
    }
  ];
  const readyCount = items.filter((item) => item.decision === "ready").length;
  const reviewCount = items.filter((item) => item.decision === "review").length;
  const blockedCount = items.filter((item) => item.decision === "blocked").length;

  return {
    id: `provider-settings-${hashSeed(`${workspaceName}:${activeProviderLabel}:${connectorStatus}`)}`,
    title: "AI Provider Settings Preview",
    workspaceName,
    activeProviderLabel,
    readyCount,
    reviewCount,
    blockedCount,
    items,
    actions: [
      {
        id: "review_provider_settings",
        label: "Review settings",
        enabled: true,
        reason: "OCI provider routing と local fallback scope を確認します。"
      },
      {
        id: "save_provider_settings",
        label: "Save settings",
        enabled: false,
        reason: "この切片では provider settings store や cloud sync を更新しません。"
      },
      {
        id: "test_provider",
        label: "Test provider",
        enabled: false,
        reason: "OCI GenAI call、external provider call、local model 起動は開始しません。"
      }
    ],
    guardrails: [
      "BrowserOS source / provider implementation reuse なし",
      "既定 provider は OCI GenAI Enterprise AI Project に固定する",
      "Gemini、Claude、OpenAI、OpenRouter、Ollama の BYOK 設定を renderer に保存しない",
      "API key、token、wallet、private key、cookie、credential は provider settings に含めない",
      "OCI GenAI call、external provider call、local model process、cloud sync は開始しない"
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
