export type BrowserFormAutofillSourceType = "oracle_docs" | "oci_console" | "livelabs" | "github" | "other";

export type BrowserFormAutofillFieldKind = "text" | "email" | "textarea" | "select" | "credential" | "payment";

export type BrowserFormAutofillDecision = "ready" | "review" | "blocked";

export type BrowserFormAutofillActionId = "copy_plan" | "attach_agent" | "request_review" | "fill_now";

export type BrowserFormAutofillField = {
  id: string;
  label: string;
  fieldName: string;
  kind: BrowserFormAutofillFieldKind;
  decision: BrowserFormAutofillDecision;
  suggestedValue: string;
  evidenceLabel: string;
  reason: string;
  guardrails: string[];
};

export type BrowserFormAutofillAction = {
  id: BrowserFormAutofillActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserFormAutofillPreview = {
  id: string;
  title: string;
  workspaceName: string;
  currentTitle: string;
  hostname: string;
  sourceType: BrowserFormAutofillSourceType;
  providerLabel: string;
  fields: BrowserFormAutofillField[];
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  stats: Array<{
    label: string;
    value: string;
  }>;
  actions: BrowserFormAutofillAction[];
  guardrails: string[];
  localOnlyNotice: string;
};

export type BrowserFormAutofillPreviewOptions = {
  currentUrl: string;
  currentTitle: string;
  workspaceName: string;
  sourceType: BrowserFormAutofillSourceType;
  summary?: string;
  selectionText?: string;
  knowledgeChunkCount?: number;
  captureCount?: number;
  providerLabel?: string;
};

const redactedValue = "[redacted]";

export function createBrowserFormAutofillPreview(options: BrowserFormAutofillPreviewOptions): BrowserFormAutofillPreview {
  const contextText = [options.currentTitle, options.summary, options.selectionText].filter(Boolean).join(" ");
  const fields = createFormFields(options, contextText);
  const readyCount = fields.filter((field) => field.decision === "ready").length;
  const reviewCount = fields.filter((field) => field.decision === "review").length;
  const blockedCount = fields.filter((field) => field.decision === "blocked").length;

  return {
    id: `form-autofill-${hashSeed(`${options.workspaceName}:${options.currentUrl}:${contextText}`)}`,
    title: "Form Autofill Guard Preview",
    workspaceName: options.workspaceName,
    currentTitle: options.currentTitle,
    hostname: extractHostname(options.currentUrl),
    sourceType: options.sourceType,
    providerLabel: options.providerLabel ?? "OCI GenAI Enterprise AI Project",
    fields,
    readyCount,
    reviewCount,
    blockedCount,
    stats: [
      { label: "Ready", value: String(readyCount) },
      { label: "Review", value: String(reviewCount) },
      { label: "Blocked", value: String(blockedCount) }
    ],
    actions: createActions(blockedCount),
    guardrails: [
      "Form Autofill は preview だけを生成し、DOM input へ値を書き込みません。",
      "password、token、wallet、payment、private key は常に redaction / blocked として扱います。",
      "実行する場合は Agent approval gate で field-by-field review を行います。",
      "BrowserOS source / autofill implementation / asset reuse なし。"
    ],
    localOnlyNotice: "Autofill preview は current page context と local evidence だけを使います。送信、保存、外部 provider 実行は開始しません。"
  };
}

function createFormFields(options: BrowserFormAutofillPreviewOptions, contextText: string): BrowserFormAutofillField[] {
  const baseFields: BrowserFormAutofillField[] = [
    {
      id: "autofill-field-workspace",
      label: "Workspace / account",
      fieldName: "workspaceName",
      kind: "text",
      decision: "ready",
      suggestedValue: sanitizeValue(options.workspaceName),
      evidenceLabel: "workspace",
      reason: "現在の workspace 名から確定できる値です。",
      guardrails: ["ユーザーが review するまで form へ書き込みません。"]
    },
    {
      id: "autofill-field-use-case",
      label: "Use case summary",
      fieldName: "useCase",
      kind: "textarea",
      decision: contextText.length > 0 ? "review" : "blocked",
      suggestedValue: contextText.length > 0 ? sanitizeValue(trimForPreview(contextText, 120)) : redactedValue,
      evidenceLabel: `${options.captureCount ?? 0} captures / ${options.knowledgeChunkCount ?? 0} chunks`,
      reason:
        contextText.length > 0
          ? "page title、selection、summary から候補を作成します。"
          : "page context がないため自動補完候補を生成しません。",
      guardrails: ["長文 field は hallucination を避けるため review 必須です。"]
    },
    {
      id: "autofill-field-region",
      label: "OCI region",
      fieldName: "ociRegion",
      kind: "select",
      decision: "review",
      suggestedValue: "ap-tokyo-1",
      evidenceLabel: "project default",
      reason: "Oracle enterprise demo の既定 region 候補です。実環境では確認が必要です。",
      guardrails: ["region / compartment は実 tenant と照合してから使います。"]
    }
  ];

  if (options.sourceType === "oci_console") {
    baseFields.push({
      id: "autofill-field-compartment",
      label: "Compartment",
      fieldName: "compartment",
      kind: "text",
      decision: "review",
      suggestedValue: "PoC compartment candidate",
      evidenceLabel: "OCI Console page",
      reason: "OCI Console 由来の form は tenant / compartment の誤操作を避けるため review 必須です。",
      guardrails: ["OCI Console の変更操作は explicit approval まで停止します。"]
    });
  }

  if (containsSensitiveFormSignal(contextText) || options.sourceType === "oci_console") {
    baseFields.push({
      id: "autofill-field-credential",
      label: "Credential / wallet",
      fieldName: "credential",
      kind: "credential",
      decision: "blocked",
      suggestedValue: redactedValue,
      evidenceLabel: "sensitive field",
      reason: "credential-like field は AI autofill から除外します。",
      guardrails: ["password、API key、wallet、token、private key は form preview に保持しません。"]
    });
  }

  if (containsPaymentSignal(contextText)) {
    baseFields.push({
      id: "autofill-field-payment",
      label: "Payment info",
      fieldName: "payment",
      kind: "payment",
      decision: "blocked",
      suggestedValue: redactedValue,
      evidenceLabel: "payment field",
      reason: "payment field は browser agent autofill では扱いません。",
      guardrails: ["payment data は prompt、memory、artifact、form preview に保存しません。"]
    });
  }

  return baseFields;
}

function createActions(blockedCount: number): BrowserFormAutofillAction[] {
  return [
    {
      id: "copy_plan",
      label: "Copy plan",
      enabled: true,
      reason: "field mapping の preview を clipboard 用に整形できます。"
    },
    {
      id: "attach_agent",
      label: "Attach to Agent",
      enabled: true,
      reason: "Agent panel に review draft として渡す preview です。"
    },
    {
      id: "request_review",
      label: "Request review",
      enabled: blockedCount > 0,
      reason: blockedCount > 0 ? "blocked field を人間が確認するための review entry です。" : "blocked field がないため追加 review は不要です。"
    },
    {
      id: "fill_now",
      label: "Fill now",
      enabled: false,
      reason: "この切片では DOM への入力、submit、外部送信を行いません。"
    }
  ];
}

function containsSensitiveFormSignal(value: string): boolean {
  return /(api[-_ ]?key|auth|credential|key[-_ ]?file|password|private[-_ ]?key|secret|signature|token|wallet|cookie|passkey)/iu.test(value);
}

function containsPaymentSignal(value: string): boolean {
  return /(credit card|card number|cvv|payment|billing|請求|支払い|カード)/iu.test(value);
}

function sanitizeValue(value: string): string {
  return value
    .replace(
      /(api[-_ ]?key|auth|credential|key[-_ ]?file|password|private[-_ ]?key|secret|signature|token|wallet|cookie|passkey)\s*[:=]\s*("[^"]+"|'[^']+'|\S+)/giu,
      "$1: [redacted]"
    )
    .replace(/\s+/g, " ")
    .trim();
}

function trimForPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "local";
  }
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
