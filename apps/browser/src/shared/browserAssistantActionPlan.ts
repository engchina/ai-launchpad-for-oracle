import type { BrowserAssistantPromptTemplateId } from "./browserAssistantPromptLauncher";
import type { BrowserAgentActionKind, BrowserAgentActionRisk } from "./agentActions";
import type {
  BrowserAgentRun,
  BrowserAgentRunEventLevel,
  BrowserAgentRunStatus,
  BrowserAgentRunStepStatus
} from "./agentRuns";

export type BrowserAssistantActionPlanStageId = "observe" | "plan" | "approve" | "act" | "record";
export type BrowserAssistantActionPlanStatus = "ready" | "needs_review" | "blocked";
export type BrowserAssistantActionToolCategory = "navigation" | "content" | "interaction" | "file" | "history";

export type BrowserAssistantActionPlanStage = {
  id: BrowserAssistantActionPlanStageId;
  label: string;
  detail: string;
  status: BrowserAssistantActionPlanStatus;
  evidenceLabel: string;
};

export type BrowserAssistantActionTool = {
  label: string;
  category: BrowserAssistantActionToolCategory;
  decision: BrowserAssistantActionPlanStatus;
  detail: string;
};

export type BrowserAssistantActionPlanMetric = {
  label: string;
  value: string;
};

export type BrowserAssistantActionRunStep = {
  id: string;
  label: string;
  status: BrowserAssistantActionPlanStatus;
  evidenceLabel: string;
  detail: string;
};

export type BrowserAssistantActionRunPreview = {
  title: string;
  status: BrowserAssistantActionPlanStatus;
  outputLabel: string;
  policyReason: string;
  steps: BrowserAssistantActionRunStep[];
  metrics: BrowserAssistantActionPlanMetric[];
};

export type BrowserAssistantActionApprovalPreview = {
  label: string;
  detail: string;
  status: BrowserAssistantActionPlanStatus;
  evidenceLabel: string;
  actionLabel: string;
  resetLabel: string;
  actionEnabled: boolean;
  granted: boolean;
};

export type BrowserAssistantActionPlanPreview = {
  title: string;
  subtitle: string;
  promptTitle: string;
  providerLabel: string;
  approval: BrowserAssistantActionApprovalPreview;
  run: BrowserAssistantActionRunPreview;
  stages: BrowserAssistantActionPlanStage[];
  tools: BrowserAssistantActionTool[];
  metrics: BrowserAssistantActionPlanMetric[];
  guardrails: string[];
};

export type BrowserAssistantActionRunHistoryContext = {
  workspaceName?: string;
};

export type BrowserAssistantActionRunHistoryCandidate = {
  title: string;
  status: BrowserAgentRunStatus;
  canRecord: boolean;
  reason: string;
  localOnlyNotice: string;
  run: BrowserAgentRun;
  metrics: BrowserAssistantActionPlanMetric[];
  guardrails: string[];
};

export type BrowserAssistantActionRunHistoryPreview = {
  title: string;
  active: boolean;
  statusLabel: string;
  message: string;
  localOnlyNotice: string;
  runs: BrowserAgentRun[];
  metrics: BrowserAssistantActionPlanMetric[];
};

export type BrowserAssistantActionRunHistoryApplyResult = {
  id: string;
  applied: boolean;
  reason: string;
  history: BrowserAgentRun[];
  sourceCandidateId?: string;
  appendedRunId?: string;
  runHistoryCount?: number;
};

type BrowserAssistantActionPlanInput = {
  templateId?: BrowserAssistantPromptTemplateId;
  providerLabel?: string;
  pageContextReady?: boolean;
  approvalGranted?: boolean;
};

type BrowserAssistantPromptPlan = {
  promptTitle: string;
  browserWrite: boolean;
  fileWrite: boolean;
  tools: BrowserAssistantActionTool[];
};

const maxAssistantActionRunHistory = 5;

export function createBrowserAssistantActionPlanPreview(input: BrowserAssistantActionPlanInput = {}): BrowserAssistantActionPlanPreview {
  const templateId = input.templateId ?? "fill_form_guarded";
  const providerLabel = redactSecrets(input.providerLabel ?? "OCI GenAI Enterprise AI Project");
  const pageContextReady = input.pageContextReady ?? true;
  const approvalGranted = input.approvalGranted ?? false;
  const promptPlan = createPromptPlan(templateId, approvalGranted);
  const requiresReview = promptPlan.browserWrite || promptPlan.fileWrite;
  const approval = createApprovalPreview(promptPlan, approvalGranted);
  const actStatus = resolveActStatus(promptPlan, pageContextReady, approvalGranted);
  const recordStatus: BrowserAssistantActionPlanStatus = !pageContextReady
    ? "needs_review"
    : requiresReview && !approvalGranted
      ? "needs_review"
      : "ready";
  const stages: BrowserAssistantActionPlanStage[] = [
    {
      id: "observe",
      label: "Observe",
      detail: "現在 tab の title、URL、selection、capture candidate を読み取り、送信範囲を分離します。",
      status: pageContextReady ? "ready" : "needs_review",
      evidenceLabel: pageContextReady ? "page context ready" : "context required"
    },
    {
      id: "plan",
      label: "Plan",
      detail: `${promptPlan.promptTitle} を browser tool route と risk gate に変換します。`,
      status: "ready",
      evidenceLabel: "tool route draft"
    },
    {
      id: "approve",
      label: "Approve",
      detail: requiresReview ? "browser write、file write、submit は approval gate で停止します。" : "read-only / response draft のため追加 approval は不要です。",
      status: requiresReview ? (approvalGranted ? "ready" : "needs_review") : "ready",
      evidenceLabel: requiresReview ? (approvalGranted ? "approval granted" : "approval pending") : "read-only route"
    },
    {
      id: "act",
      label: "Act",
      detail: "承認済み tool だけを dry-run candidate とし、blocked tool は実行候補から外します。",
      status: actStatus,
      evidenceLabel: actStatus === "blocked" ? "automation blocked" : actStatus === "needs_review" ? "review required" : "dry-run ready"
    },
    {
      id: "record",
      label: "Record",
      detail: "run summary、tool route、policy reason を local history preview として残す準備をします。",
      status: recordStatus,
      evidenceLabel: recordStatus === "ready" ? "local preview ready" : "record after review"
    }
  ];
  const run = createRunPreview(promptPlan, approval, stages);

  return {
    title: "Assistant Action Plan",
    subtitle: "自然言語 prompt を observe / plan / approve / act / record の clean-room agent loop に変換する preview。",
    promptTitle: promptPlan.promptTitle,
    providerLabel,
    approval,
    run,
    stages,
    tools: promptPlan.tools,
    metrics: [
      { label: "stages", value: String(stages.length) },
      { label: "ready", value: String(stages.filter((stage) => stage.status === "ready").length) },
      { label: "review", value: String(stages.filter((stage) => stage.status === "needs_review").length) },
      { label: "blocked", value: String(stages.filter((stage) => stage.status === "blocked").length) }
    ],
    guardrails: [
      "BrowserOS source、agent loop implementation、tool implementation は使用しない。",
      "OCI GenAI Enterprise AI Project への送信は preview では開始しない。",
      "click、type、submit、file write、scheduler 登録は approval なしに実行しない。",
      "password、token、cookie、wallet、private key は stage、tool、history に含めない。"
    ]
  };
}

export function createBrowserAssistantActionRunHistoryPreview(
  history: BrowserAgentRun[] = [],
  message = "local run history preview はまだありません。"
): BrowserAssistantActionRunHistoryPreview {
  const latestRun = history[0];

  return {
    title: "Local Run History Preview",
    active: history.length > 0,
    statusLabel: latestRun ? latestRun.status : "empty",
    message,
    localOnlyNotice: "この一覧は renderer state の preview だけで、disk store、cloud sync、browser profile には保存しません。",
    runs: history.slice(0, maxAssistantActionRunHistory),
    metrics: [
      { label: "runs", value: String(history.length) },
      { label: "completed", value: String(history.filter((run) => run.status === "completed").length) },
      { label: "approval", value: String(history.filter((run) => run.status === "needs_approval").length) },
      { label: "blocked", value: String(history.filter((run) => run.status === "blocked").length) }
    ]
  };
}

export function applyBrowserAssistantActionRunHistoryCandidatePreview(
  history: BrowserAgentRun[],
  candidate: BrowserAssistantActionRunHistoryCandidate | null
): BrowserAssistantActionRunHistoryApplyResult {
  const resultId = `assistant-history-preview-${hashSeed(`${candidate?.run.id ?? "empty"}:${history.length}`)}`;

  if (!candidate) {
    return {
      id: resultId,
      applied: false,
      reason: "追加できる assistant run history candidate はありません。",
      history
    };
  }

  if (!candidate.canRecord) {
    return {
      id: resultId,
      sourceCandidateId: candidate.run.id,
      applied: false,
      reason: "policy により blocked candidate は local run history preview に追加しません。",
      history
    };
  }

  if (history.some((run) => run.id === candidate.run.id)) {
    return {
      id: resultId,
      sourceCandidateId: candidate.run.id,
      appendedRunId: candidate.run.id,
      applied: false,
      reason: "同じ assistant run history candidate はすでに local preview に追加されています。",
      runHistoryCount: history.length,
      history
    };
  }

  const updatedHistory = [candidate.run, ...history].slice(0, maxAssistantActionRunHistory);

  return {
    id: resultId,
    sourceCandidateId: candidate.run.id,
    appendedRunId: candidate.run.id,
    applied: true,
    reason: "assistant run history candidate を renderer の local preview に追加しました。永続化と実行は行いません。",
    runHistoryCount: updatedHistory.length,
    history: updatedHistory
  };
}

export function createBrowserAssistantActionRunHistoryCandidate(
  preview: BrowserAssistantActionPlanPreview,
  context: BrowserAssistantActionRunHistoryContext = {},
  startedAt = new Date().toISOString()
): BrowserAssistantActionRunHistoryCandidate {
  const status = mapAssistantRunStatus(preview.run.status);
  const steps = preview.run.steps.map((step, index) => ({
    stepId: step.id,
    order: index + 1,
    title: step.label,
    actionLabel: step.label,
    actionKind: mapAssistantRunActionKind(step),
    risk: mapAssistantRunRisk(step.status),
    status: mapAssistantRunStepStatus(step.status),
    message: createAssistantRunStepMessage(step.status)
  }));
  const run: BrowserAgentRun = {
    id: createAssistantRunHistoryId(preview.promptTitle, startedAt),
    task: `${preview.promptTitle} / ${preview.providerLabel}`,
    status,
    startedAt,
    completedAt: startedAt,
    planSummary: `${preview.title} の ${preview.run.title} を BrowserAgentRun 互換の local history candidate に変換しました。`,
    workspaceName: context.workspaceName ?? "AI Launchpad Browser Preview",
    steps,
    events: steps.map((step) => ({
      id: `${step.stepId}-${step.status}`,
      stepId: step.stepId,
      level: mapAssistantRunEventLevel(step.status),
      message: `${step.actionLabel}: ${step.message}`,
      createdAt: startedAt
    }))
  };
  const canRecord = status !== "blocked";

  return {
    title: "Run History Candidate",
    status,
    canRecord,
    reason: createAssistantRunHistoryReason(status),
    localOnlyNotice: "外部 provider call、DOM mutation、file write、scheduler 登録は実行していません。",
    run,
    metrics: [
      { label: "steps", value: String(run.steps.length) },
      { label: "events", value: String(run.events.length) },
      { label: "blocked", value: String(run.steps.filter((step) => step.status === "blocked").length) },
      { label: "record", value: canRecord ? "enabled" : "disabled" }
    ],
    guardrails: [
      "BrowserOS source、UI asset、implementation は history candidate に含めない。",
      "この candidate は local preview の監査表示だけで、実 browser tool call は開始しない。",
      "secret、cookie、token、password は task、step、event に保存しない。"
    ]
  };
}

function createRunPreview(
  promptPlan: BrowserAssistantPromptPlan,
  approval: BrowserAssistantActionApprovalPreview,
  stages: BrowserAssistantActionPlanStage[]
): BrowserAssistantActionRunPreview {
  const stageSteps: BrowserAssistantActionRunStep[] = stages.map((stage) => ({
    id: `stage-${stage.id}`,
    label: stage.label,
    status: stage.status,
    evidenceLabel: stage.evidenceLabel,
    detail: stage.detail
  }));
  const toolSteps: BrowserAssistantActionRunStep[] = promptPlan.tools.map((tool, index) => ({
    id: `tool-${String(index + 1).padStart(2, "0")}-${tool.category}`,
    label: tool.label,
    status: tool.decision,
    evidenceLabel: tool.category,
    detail: tool.detail
  }));
  const steps = [...stageSteps.slice(0, 3), ...toolSteps, stageSteps[4]].filter(
    (step): step is BrowserAssistantActionRunStep => Boolean(step)
  );
  const status = summarizeRunStatus(steps);

  return {
    title: "Local Dry-run Timeline",
    status,
    outputLabel:
      status === "blocked"
        ? "dry-run stopped"
        : status === "needs_review"
          ? "confirmation required"
          : "dry-run ready",
    policyReason: createRunPolicyReason(status, approval),
    steps,
    metrics: [
      { label: "steps", value: String(steps.length) },
      { label: "ready", value: String(steps.filter((step) => step.status === "ready").length) },
      { label: "review", value: String(steps.filter((step) => step.status === "needs_review").length) },
      { label: "blocked", value: String(steps.filter((step) => step.status === "blocked").length) }
    ]
  };
}

function summarizeRunStatus(steps: BrowserAssistantActionRunStep[]): BrowserAssistantActionPlanStatus {
  if (steps.some((step) => step.status === "blocked")) {
    return "blocked";
  }

  if (steps.some((step) => step.status === "needs_review")) {
    return "needs_review";
  }

  return "ready";
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(6, "0").slice(0, 6);
}

function createAssistantRunHistoryId(promptTitle: string, startedAt: string): string {
  const timestamp = startedAt.replace(/[^0-9]/g, "").slice(0, 14) || "00000000000000";

  return `assistant-run-${timestamp}-${hashSeed(promptTitle)}`;
}

function mapAssistantRunStatus(status: BrowserAssistantActionPlanStatus): BrowserAgentRunStatus {
  if (status === "blocked") {
    return "blocked";
  }

  if (status === "needs_review") {
    return "needs_approval";
  }

  return "completed";
}

function mapAssistantRunStepStatus(status: BrowserAssistantActionPlanStatus): BrowserAgentRunStepStatus {
  if (status === "blocked") {
    return "blocked";
  }

  if (status === "needs_review") {
    return "skipped";
  }

  return "completed";
}

function mapAssistantRunRisk(status: BrowserAssistantActionPlanStatus): BrowserAgentActionRisk {
  if (status === "blocked") {
    return "blocked";
  }

  if (status === "needs_review") {
    return "review";
  }

  return "safe";
}

function mapAssistantRunEventLevel(status: BrowserAgentRunStepStatus): BrowserAgentRunEventLevel {
  if (status === "blocked") {
    return "blocked";
  }

  if (status === "skipped" || status === "approved") {
    return "approval";
  }

  return "info";
}

function mapAssistantRunActionKind(step: BrowserAssistantActionRunStep): BrowserAgentActionKind {
  const evidenceLabel = step.evidenceLabel.toLowerCase();
  const label = step.label.toLowerCase();

  if (step.id === "stage-observe") {
    return "observe_page";
  }

  if (evidenceLabel === "content") {
    return "extract_page";
  }

  if (evidenceLabel === "file") {
    return "generate_poc_assets";
  }

  if (evidenceLabel === "history" || label.includes("schedule")) {
    return "schedule_task";
  }

  if (evidenceLabel === "navigation" || label.includes("submit")) {
    return "destructive_browser_action";
  }

  if (step.id === "stage-record") {
    return "save_capture";
  }

  return "prepare_mcp_scope";
}

function createAssistantRunStepMessage(status: BrowserAssistantActionPlanStatus): string {
  if (status === "blocked") {
    return "policy により実行せず blocked event として残します。";
  }

  if (status === "needs_review") {
    return "追加 confirmation が必要なため実行せず review event として残します。";
  }

  return "local preview を history candidate に記録できる状態です。";
}

function createAssistantRunHistoryReason(status: BrowserAgentRunStatus): string {
  if (status === "blocked") {
    return "blocked step があるため、history には候補だけ表示し、record action は無効です。";
  }

  if (status === "needs_approval") {
    return "追加 confirmation が残るため、実行せず approval 待ちの history candidate として扱います。";
  }

  return "read-only または承認済み local preview のため、history candidate に記録できます。";
}

function createRunPolicyReason(
  status: BrowserAssistantActionPlanStatus,
  approval: BrowserAssistantActionApprovalPreview
): string {
  if (status === "blocked") {
    return approval.granted
      ? "承認後も blocked tool が残るため、実 DOM 書き込みや submit は開始しません。"
      : "approval が未付与の write-capable tool があるため、dry-run は停止します。";
  }

  if (status === "needs_review") {
    return "final submit、scheduler 登録、file write など別 confirmation が必要な route は review に残します。";
  }

  return "read-only または承認済み local preview だけで構成され、外部 provider call や browser mutation は開始しません。";
}

function createApprovalPreview(promptPlan: BrowserAssistantPromptPlan, approvalGranted: boolean): BrowserAssistantActionApprovalPreview {
  const approvalRequired = promptPlan.browserWrite || promptPlan.fileWrite;

  if (!approvalRequired) {
    return {
      label: "Approval gate",
      detail: "read-only prompt のため追加 approval は不要です。書き込み候補は生成しません。",
      status: "ready",
      evidenceLabel: "read-only route",
      actionLabel: "Approval 不要",
      resetLabel: "Reset approval",
      actionEnabled: false,
      granted: false
    };
  }

  return {
    label: approvalGranted ? "Preview approval granted" : "Approval required",
    detail: approvalGranted
      ? "local preview 内で write-capable tool を dry-run 候補に昇格します。submit / schedule は別確認のままです。"
      : "browser write、file write、submit、scheduler 登録は local approval なしでは実行候補にしません。",
    status: approvalGranted ? "ready" : "needs_review",
    evidenceLabel: approvalGranted ? "approval granted" : "approval pending",
    actionLabel: approvalGranted ? "承認を戻す" : "Preview 承認",
    resetLabel: "承認を戻す",
    actionEnabled: true,
    granted: approvalGranted
  };
}

function resolveActStatus(promptPlan: BrowserAssistantPromptPlan, pageContextReady: boolean, approvalGranted: boolean): BrowserAssistantActionPlanStatus {
  if (!pageContextReady) {
    return "needs_review";
  }

  if (promptPlan.browserWrite && !approvalGranted) {
    return "blocked";
  }

  if (promptPlan.fileWrite && !approvalGranted) {
    return "needs_review";
  }

  return "ready";
}

function createPromptPlan(templateId: BrowserAssistantPromptTemplateId, approvalGranted: boolean): BrowserAssistantPromptPlan {
  if (templateId === "summarize_page") {
    return {
      promptTitle: "Summarize page",
      browserWrite: false,
      fileWrite: false,
      tools: [
        createTool("Read current page", "content", "ready", "title、URL、visible text を read-only context として参照します。"),
        createTool("Extract citations", "content", "ready", "answer に必要な source candidate だけを抽出します。"),
        createTool("Draft answer", "history", "ready", "response draft と evidence label を local preview に残します。")
      ]
    };
  }

  if (templateId === "extract_table") {
    return {
      promptTitle: "Extract data",
      browserWrite: false,
      fileWrite: false,
      tools: [
        createTool("Read selected region", "content", "ready", "user-selected region と capture candidate だけを対象にします。"),
        createTool("Parse table", "content", "ready", "key metric、owner、date を structured preview に変換します。"),
        createTool("CSV preview", "file", "needs_review", "download / file write は行わず、CSV text preview だけを生成します。")
      ]
    };
  }

  if (templateId === "translate_selection") {
    return {
      promptTitle: "Translate selection",
      browserWrite: false,
      fileWrite: false,
      tools: [
        createTool("Read selection", "content", "ready", "selection が空なら実行候補にしません。"),
        createTool("Translate text", "content", "ready", "固有名詞、API 名、file name は原文表記を残します。"),
        createTool("Draft replacement", "interaction", "needs_review", "DOM への書き戻しは行わず copy-ready text に限定します。")
      ]
    };
  }

  if (templateId === "save_report") {
    return {
      promptTitle: "Save repeatable report",
      browserWrite: false,
      fileWrite: true,
      tools: [
        createTool("Read page context", "content", "ready", "report source と capture evidence を review します。"),
        createTool(
          "Build workflow graph",
          "interaction",
          approvalGranted ? "ready" : "needs_review",
          approvalGranted ? "repeatable graph を dry-run 候補として preview します。" : "repeatable graph は draft のみで保存しません。"
        ),
        createTool(
          "Prepare report file",
          "file",
          approvalGranted ? "ready" : "needs_review",
          approvalGranted ? "file write は local approval 済みの dry-run 候補として表示します。" : "file write は approval 後の候補として表示します。"
        ),
        createTool(
          "Register schedule",
          "history",
          approvalGranted ? "needs_review" : "blocked",
          approvalGranted ? "scheduler 登録は別 confirmation が必要です。" : "scheduler 登録はこの preview では開始しません。"
        )
      ]
    };
  }

  return {
    promptTitle: "Fill form with approval",
    browserWrite: true,
    fileWrite: false,
    tools: [
      createTool("Read form fields", "content", "ready", "label、required state、visible validation だけを読み取ります。"),
      createTool(
        "Draft values",
        "interaction",
        approvalGranted ? "ready" : "needs_review",
        approvalGranted ? "入力案と risk diff を dry-run 候補として確定します。" : "入力案と risk diff を作るだけで DOM には書き込みません。"
      ),
      createTool(
        "Type fields",
        "interaction",
        approvalGranted ? "ready" : "blocked",
        approvalGranted ? "type route は承認済み dry-run 候補です。実 DOM 書き込みはまだ行いません。" : "approval なしの type は blocked です。"
      ),
      createTool(
        "Submit form",
        "navigation",
        approvalGranted ? "needs_review" : "blocked",
        "submit / navigation mutation は常に最終確認を要求します。"
      )
    ]
  };
}

function createTool(
  label: string,
  category: BrowserAssistantActionToolCategory,
  decision: BrowserAssistantActionPlanStatus,
  detail: string
): BrowserAssistantActionTool {
  return {
    label,
    category,
    decision,
    detail
  };
}

function redactSecrets(value: string): string {
  const trimmed = value.trim() || "OCI GenAI Enterprise AI Project";

  return trimmed.replace(/(api[_-]?key|token|password|secret|cookie)=\S+/gi, "$1=REDACTED");
}
