export type BrowserWorkflowRecorderSourceType = "oracle_docs" | "oci_console" | "livelabs" | "github" | "other";

export type BrowserWorkflowRecorderStepKind = "observe" | "extract" | "loop" | "fill" | "approval" | "record";

export type BrowserWorkflowRecorderStepStatus = "captured" | "suggested" | "needs_review" | "blocked";

export type BrowserWorkflowRecorderActionId = "start_preview" | "export_graph" | "test_workflow" | "save_workflow";

export type BrowserWorkflowRecorderStep = {
  id: string;
  kind: BrowserWorkflowRecorderStepKind;
  title: string;
  detail: string;
  targetLabel: string;
  evidenceLabel: string;
  status: BrowserWorkflowRecorderStepStatus;
  approvalRequired: boolean;
  guardrails: string[];
};

export type BrowserWorkflowRecorderAction = {
  id: BrowserWorkflowRecorderActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserWorkflowRecorderPreview = {
  id: string;
  title: string;
  workspaceName: string;
  currentTitle: string;
  hostname: string;
  sourceType: BrowserWorkflowRecorderSourceType;
  providerLabel: string;
  steps: BrowserWorkflowRecorderStep[];
  capturedCount: number;
  suggestedCount: number;
  reviewCount: number;
  blockedCount: number;
  approvalGateCount: number;
  stats: Array<{
    label: string;
    value: string;
  }>;
  actions: BrowserWorkflowRecorderAction[];
  graphSummary: string;
  guardrails: string[];
  localOnlyNotice: string;
};

export type BrowserWorkflowRecorderPreviewOptions = {
  currentUrl: string;
  currentTitle: string;
  workspaceName: string;
  sourceType: BrowserWorkflowRecorderSourceType;
  playbookTitle?: string;
  prompt?: string;
  summary?: string;
  captureCount?: number;
  knowledgeChunkCount?: number;
  providerLabel?: string;
};

export function createBrowserWorkflowRecorderPreview(options: BrowserWorkflowRecorderPreviewOptions): BrowserWorkflowRecorderPreview {
  const contextText = [options.playbookTitle, options.prompt, options.summary, options.currentTitle].filter(Boolean).join(" ");
  const steps = createRecorderSteps(options, contextText);
  const capturedCount = steps.filter((step) => step.status === "captured").length;
  const suggestedCount = steps.filter((step) => step.status === "suggested").length;
  const reviewCount = steps.filter((step) => step.status === "needs_review").length;
  const blockedCount = steps.filter((step) => step.status === "blocked").length;
  const approvalGateCount = steps.filter((step) => step.approvalRequired).length;

  return {
    id: `workflow-recorder-${hashSeed(`${options.workspaceName}:${options.currentUrl}:${contextText}`)}`,
    title: "Workflow Recorder Preview",
    workspaceName: sanitizeLabel(options.workspaceName, "Workspace"),
    currentTitle: sanitizeLabel(options.currentTitle, "Current page"),
    hostname: extractHostname(options.currentUrl),
    sourceType: options.sourceType,
    providerLabel: options.providerLabel ?? "OCI GenAI Enterprise AI Project",
    steps,
    capturedCount,
    suggestedCount,
    reviewCount,
    blockedCount,
    approvalGateCount,
    stats: [
      { label: "Captured", value: String(capturedCount) },
      { label: "Review", value: String(reviewCount) },
      { label: "Blocked", value: String(blockedCount) }
    ],
    actions: createActions(blockedCount),
    graphSummary: `${steps.length} steps / ${Math.max(0, steps.length - 1)} edges / ${approvalGateCount} approval gates`,
    guardrails: [
      "Workflow Recorder は preview graph だけを生成し、browser action、DOM event listener、recording session は開始しません。",
      "OCI Console 変更、form submit、external send、credential 参照は approval gate で停止します。",
      "BrowserOS source / workflow implementation / asset reuse なし。",
      "保存、実行、schedule 化は後続の review flow に渡すまで disabled です。"
    ],
    localOnlyNotice: "Recorder preview は現在の tab context、captures、knowledge count だけを参照します。local store、OCI GenAI、external MCP は更新しません。"
  };
}

function createRecorderSteps(
  options: BrowserWorkflowRecorderPreviewOptions,
  contextText: string
): BrowserWorkflowRecorderStep[] {
  const steps: BrowserWorkflowRecorderStep[] = [
    {
      id: "workflow-recorder-step-observe",
      kind: "observe",
      title: "Capture current page",
      detail: `${sanitizeLabel(options.currentTitle, "Current page")} と URL を workflow start node として記録候補にします。`,
      targetLabel: extractHostname(options.currentUrl),
      evidenceLabel: `${options.captureCount ?? 0} captures`,
      status: "captured",
      approvalRequired: false,
      guardrails: ["page title と URL だけを読み取り、browser history DB は参照しません。"]
    },
    {
      id: "workflow-recorder-step-extract",
      kind: "extract",
      title: "Extract local evidence",
      detail: "保存済み capture、Knowledge chunk、page summary を workflow input として束ねます。",
      targetLabel: "local evidence",
      evidenceLabel: `${options.knowledgeChunkCount ?? 0} chunks`,
      status: (options.captureCount ?? 0) + (options.knowledgeChunkCount ?? 0) > 0 ? "captured" : "suggested",
      approvalRequired: false,
      guardrails: ["external search、OCI call、embedding 実行は開始しません。"]
    }
  ];

  if (looksLikeRepeatableWorkflow(contextText)) {
    steps.push({
      id: "workflow-recorder-step-loop",
      kind: "loop",
      title: "Detect repeatable loop",
      detail: "spreadsheet、list、daily task など繰り返し処理の候補を visual graph の loop node として提案します。",
      targetLabel: "loop candidate",
      evidenceLabel: "repeatable task",
      status: "needs_review",
      approvalRequired: true,
      guardrails: ["loop count、parallel execution、rate limit は保存前に確認します。"]
    });
  }

  if (looksLikeFormWorkflow(contextText)) {
    steps.push({
      id: "workflow-recorder-step-fill",
      kind: "fill",
      title: "Draft form-fill node",
      detail: "form field mapping を workflow node として提案します。submit は含めません。",
      targetLabel: "form fields",
      evidenceLabel: "autofill preview",
      status: "needs_review",
      approvalRequired: true,
      guardrails: ["password、payment、credential field は blocked node に分離します。"]
    });
  }

  const blockedBySensitiveContext = containsSensitiveWorkflowSignal(contextText) || options.sourceType === "oci_console";

  steps.push({
    id: "workflow-recorder-step-approval",
    kind: "approval",
    title: "Insert approval gate",
    detail: blockedBySensitiveContext
      ? "OCI Console / credential-like context を検知したため、実行前に blocked review gate を置きます。"
      : "browser write、external send、schedule save の前に human review gate を置きます。",
    targetLabel: "human review",
    evidenceLabel: blockedBySensitiveContext ? "sensitive context" : "action boundary",
    status: blockedBySensitiveContext ? "blocked" : "needs_review",
    approvalRequired: true,
    guardrails: ["承認前に click、fill、submit、send、save は実行しません。"]
  });

  steps.push({
    id: "workflow-recorder-step-record",
    kind: "record",
    title: "Prepare graph draft",
    detail: "captured steps を Council / Graph mode に渡せる draft として整形します。",
    targetLabel: "workflow graph",
    evidenceLabel: "preview only",
    status: "suggested",
    approvalRequired: false,
    guardrails: ["local workflow store への保存はこの切片では行いません。"]
  });

  return steps;
}

function createActions(blockedCount: number): BrowserWorkflowRecorderAction[] {
  return [
    {
      id: "start_preview",
      label: "Start preview",
      enabled: true,
      reason: "現在の page context から recorder draft を作るだけです。"
    },
    {
      id: "export_graph",
      label: "Export graph",
      enabled: true,
      reason: "Council / Graph mode に渡す draft payload の preview です。"
    },
    {
      id: "test_workflow",
      label: "Test workflow",
      enabled: false,
      reason: "この切片では browser action、hidden window、external MCP を起動しません。"
    },
    {
      id: "save_workflow",
      label: "Save workflow",
      enabled: false,
      reason: blockedCount > 0 ? "blocked step が残っているため保存できません。" : "保存は後続の workflow review flow で扱います。"
    }
  ];
}

function looksLikeRepeatableWorkflow(value: string): boolean {
  return /(spreadsheet|sheet|list|each|loop|parallel|daily|weekly|repeat|contacts|rows|毎日|定期|一覧|各)/iu.test(value);
}

function looksLikeFormWorkflow(value: string): boolean {
  return /(form|fill|submit|field|intake|application|フォーム|入力|申請)/iu.test(value);
}

function containsSensitiveWorkflowSignal(value: string): boolean {
  return /(delete|payment|billing|password|api[-_ ]?key|token|wallet|private[-_ ]?key|secret|credential|oci console|支払い|削除|認証)/iu.test(value);
}

function sanitizeLabel(value: string | undefined, fallback: string): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return fallback;
  }

  return normalized.replace(
    /(api[-_ ]?key|auth|credential|password|private[-_ ]?key|secret|signature|token|wallet|cookie|passkey)\s*[:=]\s*("[^"]+"|'[^']+'|\S+)/giu,
    "$1: [redacted]"
  );
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
