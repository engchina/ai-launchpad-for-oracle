import type { BrowserAgentRun, BrowserAgentRunStatus } from "./agentRuns";
import type { BrowserMcpRunHistoryEntry } from "./browserMcpRunHistory";

export type BrowserScheduleCadence =
  | {
      type: "daily";
      timeOfDay: string;
      timezone: string;
    }
  | {
      type: "hourly";
      intervalHours: number;
    }
  | {
      type: "minutes";
      intervalMinutes: number;
    };

export type BrowserSchedulerApprovalPolicy = "manual_review_required" | "read_only_auto_preview";
export type BrowserSchedulerTaskSource = "mcp_run_history" | "assistant_context" | "assistant_run_history";
export type BrowserSchedulerTaskStatus = "ready" | "disabled" | "needs_approval" | "blocked";

export type BrowserSchedulerTaskDraft = {
  id: string;
  source: BrowserSchedulerTaskSource;
  sourceRunHistoryId: string;
  name: string;
  prompt: string;
  workspaceName: string;
  cadence: BrowserScheduleCadence;
  cadenceLabel: string;
  enabled: boolean;
  status: BrowserSchedulerTaskStatus;
  approvalPolicy: BrowserSchedulerApprovalPolicy;
  nextRunAt?: string;
  lastRunStatus: BrowserAgentRunStatus;
  runHistory: BrowserAgentRun[];
};

export type BrowserSchedulerTaskPayload = Omit<BrowserSchedulerTaskDraft, "id"> & {
  id?: string;
};

export type BrowserSchedulerRegistryPreview = {
  id: string;
  createdAt: string;
  taskCount: number;
  readyCount: number;
  approvalCount: number;
  blockedCount: number;
  maxRunsPerTask: number;
  tasks: BrowserSchedulerTaskDraft[];
};

export type BrowserScheduleSuggestionCard = {
  id: string;
  sourceTaskId: string;
  title: string;
  description: string;
  taskName: string;
  workspaceName: string;
  promptPreview: string;
  cadenceLabel: string;
  nextRunAt?: string;
  status: BrowserSchedulerTaskStatus;
  approvalPolicy: BrowserSchedulerApprovalPolicy;
  canConfirm: boolean;
  actionLabel: string;
  blockedReason?: string;
  details: string[];
};

export type BrowserScheduleHandoffReview = {
  id: string;
  sourceTaskId: string;
  title: string;
  status: "ready_to_review" | "ready_task" | "blocked" | "not_applicable";
  canSaveReviewDraft: boolean;
  primaryActionLabel: string;
  reason: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  checklist: string[];
};

export type BrowserScheduleReviewApprovalPreview = {
  id: string;
  sourceTaskId: string;
  title: string;
  status: "ready_to_approve" | "already_ready" | "blocked" | "not_applicable";
  canApprove: boolean;
  primaryActionLabel: string;
  reason: string;
  approvedStatus: BrowserSchedulerTaskStatus;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  checklist: string[];
};

export type BrowserSavedScheduleTaskDetail = {
  id: string;
  title: string;
  prompt: string;
  latestRunSummary?: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserScheduleCardEditDraft = {
  sourceTaskId: string;
  name: string;
  prompt: string;
  cadence: BrowserScheduleCadence;
  enabled: boolean;
  canEnable: boolean;
  disabledReason?: string;
};

export type BrowserScheduledTaskPreviewAction = {
  id: "test_preview" | "retry_preview" | "cancel_preview";
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserScheduledTaskManualRunPlanStep = {
  id: string;
  title: string;
  detail: string;
  risk: "safe" | "review" | "blocked";
};

export type BrowserScheduledTaskManualRunConfirmation = {
  id: string;
  sourceTaskId: string;
  actionId: BrowserScheduledTaskPreviewAction["id"];
  title: string;
  taskName: string;
  workspaceName: string;
  canConfirm: boolean;
  status: "ready_to_preview" | "blocked_by_policy" | "not_applicable";
  primaryActionLabel: string;
  policyReason: string;
  dryRunSummary: string;
  expectedRunStatus: BrowserAgentRunStatus;
  timeoutSeconds: number;
  guardrails: string[];
  steps: BrowserScheduledTaskManualRunPlanStep[];
};

export type BrowserScheduledTaskBackgroundRunStageStatus = "ready" | "waiting" | "needs_review" | "blocked";

export type BrowserScheduledTaskBackgroundRunStage = {
  id: "alarm_trigger" | "hidden_window" | "agent_execution" | "result_saved" | "timeout_guard";
  title: string;
  detail: string;
  status: BrowserScheduledTaskBackgroundRunStageStatus;
  artifactLabel: string;
  guardrail: string;
};

export type BrowserScheduledTaskBackgroundRunPreview = {
  id: string;
  sourceTaskId: string;
  title: string;
  taskName: string;
  workspaceName: string;
  cadenceLabel: string;
  nextRunAt?: string;
  timeoutSeconds: number;
  canOpenHiddenWindow: false;
  canExecuteAgent: false;
  canPersistResult: false;
  localOnlyNotice: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  stages: BrowserScheduledTaskBackgroundRunStage[];
  actions: Array<{
    id: "review_plan" | "open_hidden_window" | "execute_agent" | "save_result";
    label: string;
    enabled: boolean;
    reason: string;
  }>;
  guardrails: string[];
};

export type BrowserScheduledTaskDryRunHistoryCandidate = {
  id: string;
  sourceConfirmationId: string;
  sourceTaskId: string;
  actionId: BrowserScheduledTaskPreviewAction["id"];
  createdAt: string;
  canAppendToHistory: boolean;
  status: BrowserAgentRunStatus;
  summary: string;
  historyLabel: string;
  run: BrowserAgentRun;
  notes: string[];
};

export type BrowserScheduledTaskHistoryPreviewApplyResult = {
  id: string;
  sourceCandidateId?: string;
  sourceTaskId?: string;
  applied: boolean;
  reason: string;
  appendedRunId?: string;
  runHistoryCount?: number;
  tasks: BrowserSchedulerTaskDraft[];
};

export type BrowserScheduledTaskHistoryStoreCommitPreview = {
  id: string;
  sourceTaskId: string;
  title: string;
  status: "ready_to_save" | "no_preview" | "not_applicable";
  canPersist: boolean;
  primaryActionLabel: string;
  reason: string;
  task?: BrowserSchedulerTaskDraft;
  appendedRunIds: string[];
  metadata: Array<{
    label: string;
    value: string;
  }>;
  checklist: string[];
};

export type BrowserScheduledTaskRunOutputPreview = {
  id: string;
  taskId: string;
  runId: string;
  title: string;
  status: BrowserAgentRunStatus;
  startedAt: string;
  completedAt: string;
  workspaceName: string;
  summary: string;
  outputText: string;
  toolUsage: Array<{
    id: string;
    label: string;
    kind: BrowserAgentRun["steps"][number]["actionKind"];
    status: BrowserAgentRun["steps"][number]["status"];
    risk: BrowserAgentRun["steps"][number]["risk"];
    message: string;
  }>;
  findings: Array<{
    id: string;
    level: BrowserAgentRun["events"][number]["level"];
    message: string;
    createdAt: string;
  }>;
  metadata: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserScheduledTaskNewTabResultPreview = {
  id: string;
  sourceOutputId: string;
  taskId: string;
  runId: string;
  title: string;
  status: BrowserAgentRunStatus;
  summary: string;
  resultLocation: "new_tab_preview";
  runHistoryScope: "local_device_only";
  cloudSyncScope: "schedule_only";
  metadata: Array<{
    label: string;
    value: string;
  }>;
  highlights: string[];
  actions: Array<{
    id: "open_full_output" | "capture_result" | "add_to_knowledge";
    label: string;
    enabled: boolean;
    reason: string;
  }>;
};

export type BrowserScheduledTaskNewTabResultFilterPreview = {
  id: string;
  sourcePreviewId: string;
  query: string;
  normalizedQuery: string;
  visible: boolean;
  matchCount: number;
  matchedFields: Array<{
    label: string;
    value: string;
  }>;
  emptyStateMessage: string;
  searchScope: string[];
};

export type BrowserScheduledTaskNewTabTracePreview = {
  id: string;
  sourcePreviewId: string;
  summary: string;
  localOnlyNotice: string;
  nodes: Array<{
    id: "new_tab_result" | "run_history" | "full_output" | "capture" | "knowledge";
    label: string;
    description: string;
    status: "current" | "available" | "completed" | "locked";
    actionId?: BrowserScheduledTaskNewTabResultPreview["actions"][number]["id"];
  }>;
};

export type BrowserScheduledTaskNewTabResultStackPreview = {
  id: string;
  sourceTaskId: string;
  selectedRunId?: string;
  resultCount: number;
  maxVisibleResults: number;
  localOnlyNotice: string;
  items: Array<{
    id: string;
    runId: string;
    title: string;
    summary: string;
    status: BrowserAgentRunStatus;
    startedAt: string;
    selected: boolean;
    metadata: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

export type BrowserScheduledTaskNewTabInboxPreview = {
  id: string;
  selectedTaskId?: string;
  selectedRunId?: string;
  taskCount: number;
  resultCount: number;
  maxVisibleResults: number;
  localOnlyNotice: string;
  statusCounts: {
    completed: number;
    needsApproval: number;
    blocked: number;
  };
  items: Array<{
    id: string;
    taskId: string;
    runId: string;
    taskName: string;
    workspaceName: string;
    title: string;
    summary: string;
    status: BrowserAgentRunStatus;
    startedAt: string;
    selected: boolean;
    metadata: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

export type BrowserScheduledTaskNewTabInboxStatusFilter = "all" | BrowserAgentRunStatus;

export type BrowserScheduledTaskNewTabInboxFilterPreview = {
  id: string;
  sourcePreviewId: string;
  query: string;
  normalizedQuery: string;
  statusFilter: BrowserScheduledTaskNewTabInboxStatusFilter;
  visibleCount: number;
  totalCount: number;
  emptyStateMessage: string;
  searchScope: string[];
  statusOptions: Array<{
    id: BrowserScheduledTaskNewTabInboxStatusFilter;
    label: string;
    count: number;
    selected: boolean;
  }>;
  matchedFields: Array<{
    itemId: string;
    label: string;
    value: string;
  }>;
  items: BrowserScheduledTaskNewTabInboxPreview["items"];
};

export type BrowserScheduledTaskNewTabInboxTriagePreview = {
  id: string;
  sourceFilterPreviewId: string;
  statusFilter: BrowserScheduledTaskNewTabInboxStatusFilter;
  visibleCount: number;
  summary: string;
  guardrail: string;
  primaryItem?: BrowserScheduledTaskNewTabInboxPreview["items"][number];
  metrics: Array<{
    label: string;
    value: string;
  }>;
  primaryAction: {
    id: "open_result";
    label: string;
    enabled: boolean;
    reason: string;
    taskId?: string;
    runId?: string;
  };
};

export type BrowserScheduledTaskNewTabInboxActionQueuePreview = {
  id: string;
  sourceFilterPreviewId: string;
  visibleCount: number;
  actionCount: number;
  maxActions: number;
  emptyStateMessage: string;
  localOnlyNotice: string;
  actions: Array<{
    id: string;
    itemId: string;
    taskId: string;
    runId: string;
    label: string;
    title: string;
    summary: string;
    status: BrowserAgentRunStatus;
    priority: "review" | "blocked" | "done";
    selected: boolean;
    reason: string;
  }>;
};

export type BrowserScheduledTaskNewTabInboxActionHandoffPreview = {
  id: string;
  sourceActionQueueId: string;
  enabled: boolean;
  title: string;
  sourceAction?: {
    itemId: string;
    taskId: string;
    runId: string;
    label: string;
    title: string;
    status: BrowserAgentRunStatus;
    priority: "review" | "blocked" | "done";
  };
  prompt: string;
  promptPreview: string;
  handoffPacket: string;
  handoffPacketPreview: string;
  localOnlyNotice: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  reviewChecklist: Array<{
    id: "source_action" | "local_scope" | "execution_guard" | "clean_room";
    label: string;
    status: "passed" | "blocked";
    detail: string;
  }>;
  blockedOperations: string[];
  primaryAction: {
    id: "copy_prompt";
    label: string;
    enabled: boolean;
    reason: string;
  };
};

export type BrowserScheduledTaskNewTabInboxActionReviewDraftPreview = {
  id: string;
  sourceHandoffId: string;
  enabled: boolean;
  title: string;
  draft: string;
  draftPreview: string;
  localOnlyNotice: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  outputSections: Array<{
    id: "finding" | "risk" | "next_action" | "clean_room";
    label: string;
    detail: string;
  }>;
  primaryAction: {
    id: "copy_review_draft";
    label: string;
    enabled: boolean;
    reason: string;
  };
};

export type BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview = {
  id: string;
  sourceReviewDraftId: string;
  enabled: boolean;
  title: string;
  recommendedDecision: {
    id: "review_required" | "inspect_blocked" | "archive_done" | "unavailable";
    label: string;
    tone: "warning" | "danger" | "success" | "muted";
    reason: string;
  };
  decisionNote: string;
  decisionNotePreview: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  nextActions: Array<{
    id: "read_review" | "inspect_source" | "copy_note";
    label: string;
    detail: string;
  }>;
  localOnlyNotice: string;
  primaryAction: {
    id: "copy_decision_note";
    label: string;
    enabled: boolean;
    reason: string;
  };
};

export type BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview = {
  id: string;
  sourceHandoffId: string;
  sourceDecisionId: string;
  enabled: boolean;
  title: string;
  localOnlyNotice: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  routeCards: Array<{
    id: "open_source_result" | "read_review_draft" | "copy_decision_note";
    label: string;
    detail: string;
    enabled: boolean;
    taskId?: string;
    runId?: string;
  }>;
  primaryAction: {
    id: "open_source_result";
    label: string;
    enabled: boolean;
    reason: string;
    taskId?: string;
    runId?: string;
  };
};

export type BrowserScheduledTaskRunCapturePreview = {
  id: string;
  sourceOutputId: string;
  taskId: string;
  runId: string;
  title: string;
  kind: "scheduled_task_run_output";
  storageMode: "preview_only";
  canSaveToCaptureStore: false;
  markdown: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  warnings: string[];
};

export type BrowserScheduledTaskRunCaptureSaveConfirmation = {
  id: string;
  sourceCapturePreviewId: string;
  taskId: string;
  runId: string;
  title: string;
  status: "ready_to_review";
  canPersistToCaptureStore: false;
  primaryActionLabel: string;
  policyReason: string;
  proposedCapture: {
    title: string;
    kind: BrowserScheduledTaskRunCapturePreview["kind"];
    savedAt: string;
    bodyPreview: string;
    markdownCharacters: number;
  };
  checklist: string[];
  metadata: Array<{
    label: string;
    value: string;
  }>;
};

export type BrowserScheduledTaskCaptureSourceType = "oracle_docs" | "oci_console" | "livelabs" | "github" | "other";

export type BrowserScheduledTaskRunCaptureStoreContext = {
  workspaceId: string;
  url: string;
  sourceType: BrowserScheduledTaskCaptureSourceType;
};

export type BrowserScheduledTaskRunCaptureStoreDraft = {
  id: string;
  sourceConfirmationId: string;
  sourceCapturePreviewId: string;
  canPersistToCaptureStore: true;
  localCaptureKind: "selection";
  primaryActionLabel: string;
  payload: {
    workspaceId: string;
    url: string;
    title: string;
    sourceType: BrowserScheduledTaskCaptureSourceType;
    selectedText: string;
  };
  metadata: Array<{
    label: string;
    value: string;
  }>;
  checklist: string[];
};

export type BrowserScheduledTaskRunCaptureKnowledgeDraft = {
  id: string;
  sourceStoreDraftId: string;
  captureId: string;
  canAddToKnowledge: true;
  primaryActionLabel: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  checklist: string[];
};

export type BrowserScheduledTasksPageItem = {
  id: string;
  name: string;
  workspaceName: string;
  cadenceLabel: string;
  status: BrowserSchedulerTaskStatus;
  enabled: boolean;
  nextRunAt?: string;
  lastRunStatus: BrowserAgentRunStatus;
  runCount: number;
};

export type BrowserScheduledTasksPageDetail = {
  id: string;
  title: string;
  prompt: string;
  workspaceName: string;
  cadenceLabel: string;
  status: BrowserSchedulerTaskStatus;
  enabled: boolean;
  nextRunAt?: string;
  actions: BrowserScheduledTaskPreviewAction[];
  history: Array<{
    id: string;
    status: BrowserAgentRunStatus;
    startedAt: string;
    completedAt?: string;
    summary: string;
    stepCount: number;
  }>;
};

export type BrowserScheduledTasksPagePreview = {
  id: string;
  taskCount: number;
  enabledCount: number;
  disabledCount: number;
  needsReviewCount: number;
  blockedCount: number;
  selectedTaskId?: string;
  items: BrowserScheduledTasksPageItem[];
  selectedDetail: BrowserScheduledTasksPageDetail | null;
};

export type BrowserSchedulerTaskOptions = {
  name?: string;
  prompt?: string;
  cadence?: BrowserScheduleCadence;
  enabled?: boolean;
};

const maxRunsPerTask = 15;

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 41 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseTimeOfDay(value: string): { hour: number; minute: number } {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return { hour: 8, minute: 0 };
  }

  return {
    hour: clamp(Number.parseInt(match[1] ?? "8", 10), 0, 23),
    minute: clamp(Number.parseInt(match[2] ?? "0", 10), 0, 59)
  };
}

function addHours(date: Date, hours: number): Date {
  const next = new Date(date);
  next.setUTCHours(next.getUTCHours() + hours);
  return next;
}

function addMinutes(date: Date, minutes: number): Date {
  const next = new Date(date);
  next.setUTCMinutes(next.getUTCMinutes() + minutes);
  return next;
}

function createDefaultCadence(entry: BrowserMcpRunHistoryEntry): BrowserScheduleCadence {
  if (entry.stage === "recorded") {
    return {
      type: "hourly",
      intervalHours: 6
    };
  }

  return {
    type: "daily",
    timeOfDay: "08:00",
    timezone: "Asia/Tokyo"
  };
}

function createPreviewText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}...`;
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function canEnableSchedulerTask(task: BrowserSchedulerTaskDraft): boolean {
  return task.status === "ready" || task.status === "disabled";
}

function createReviewDraftTaskId(task: BrowserSchedulerTaskDraft): string {
  if (task.id.startsWith("browser-scheduler-review-")) {
    return task.id;
  }

  return `browser-scheduler-review-${hashSeed(`${task.id}:${task.sourceRunHistoryId}`)}`;
}

export function formatBrowserScheduleCadence(cadence: BrowserScheduleCadence): string {
  if (cadence.type === "daily") {
    return `毎日 ${cadence.timeOfDay} / ${cadence.timezone}`;
  }

  if (cadence.type === "hourly") {
    return `${clamp(cadence.intervalHours, 1, 24)}時間ごと`;
  }

  return `${clamp(cadence.intervalMinutes, 1, 60)}分ごと`;
}

export function calculateNextBrowserScheduleRunAt(cadence: BrowserScheduleCadence, from = new Date().toISOString()): string {
  const base = new Date(from);
  const safeBase = Number.isNaN(base.getTime()) ? new Date(0) : base;

  if (cadence.type === "daily") {
    const { hour, minute } = parseTimeOfDay(cadence.timeOfDay);
    const next = new Date(safeBase);
    next.setUTCHours(hour, minute, 0, 0);
    if (next <= safeBase) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next.toISOString();
  }

  if (cadence.type === "hourly") {
    return addHours(safeBase, clamp(cadence.intervalHours, 1, 24)).toISOString();
  }

  return addMinutes(safeBase, clamp(cadence.intervalMinutes, 1, 60)).toISOString();
}

function statusForRunHistory(entry: BrowserMcpRunHistoryEntry, enabled: boolean): BrowserSchedulerTaskStatus {
  if (entry.status === "blocked") {
    return "blocked";
  }

  if (entry.status === "needs_approval") {
    return "needs_approval";
  }

  return enabled ? "ready" : "disabled";
}

function approvalPolicyForRunHistory(entry: BrowserMcpRunHistoryEntry): BrowserSchedulerApprovalPolicy {
  return entry.approvalDecisionStatus === "approved_preview" ? "manual_review_required" : "read_only_auto_preview";
}

function statusForAssistantRunHistory(run: BrowserAgentRun, enabled: boolean): BrowserSchedulerTaskStatus {
  if (run.status === "blocked") {
    return "blocked";
  }

  if (run.status === "needs_approval") {
    return "needs_approval";
  }

  return enabled ? "ready" : "disabled";
}

function approvalPolicyForAssistantRunHistory(run: BrowserAgentRun): BrowserSchedulerApprovalPolicy {
  return run.status === "completed" ? "read_only_auto_preview" : "manual_review_required";
}

function createDefaultAssistantCadence(run: BrowserAgentRun): BrowserScheduleCadence {
  if (run.status === "completed") {
    return {
      type: "hourly",
      intervalHours: 12
    };
  }

  return {
    type: "daily",
    timeOfDay: "09:00",
    timezone: "Asia/Tokyo"
  };
}

export function createBrowserSchedulerTaskDraftFromRunHistory(
  entry: BrowserMcpRunHistoryEntry,
  options: BrowserSchedulerTaskOptions = {},
  createdAt = new Date().toISOString()
): BrowserSchedulerTaskDraft {
  const cadence = options.cadence ?? createDefaultCadence(entry);
  const requestedEnabled = options.enabled ?? entry.status === "completed";
  const status = statusForRunHistory(entry, requestedEnabled);
  const enabled = status === "ready";
  const id = `browser-scheduler-${hashSeed(`${entry.id}:${entry.toolId}:${entry.workspaceName}`)}`;

  return {
    id,
    source: "mcp_run_history",
    sourceRunHistoryId: entry.id,
    name: options.name ?? `${entry.toolId} 定期確認`,
    prompt:
      options.prompt ??
      `${entry.workspaceName} で ${entry.mcpMethod} / ${entry.toolId} を schedule preview として再実行し、結果を run history に記録する。`,
    workspaceName: entry.workspaceName,
    cadence,
    cadenceLabel: formatBrowserScheduleCadence(cadence),
    enabled,
    status,
    approvalPolicy: approvalPolicyForRunHistory(entry),
    nextRunAt: enabled ? calculateNextBrowserScheduleRunAt(cadence, createdAt) : undefined,
    lastRunStatus: entry.status,
    runHistory: [entry.run].slice(0, maxRunsPerTask)
  };
}

export function createBrowserSchedulerTaskDraftFromAssistantRunHistory(
  run: BrowserAgentRun | undefined,
  options: BrowserSchedulerTaskOptions = {},
  createdAt = new Date().toISOString()
): BrowserSchedulerTaskDraft | null {
  if (!run) {
    return null;
  }

  const cadence = options.cadence ?? createDefaultAssistantCadence(run);
  const requestedEnabled = options.enabled ?? run.status === "completed";
  const status = statusForAssistantRunHistory(run, requestedEnabled);
  const enabled = status === "ready";
  const id = `browser-scheduler-assistant-${hashSeed(`${run.id}:${run.workspaceName}`)}`;
  const taskLabel = normalizeText(run.task.split("/")[0] ?? run.task, "Assistant run");

  return {
    id,
    source: "assistant_run_history",
    sourceRunHistoryId: run.id,
    name: options.name ?? `${taskLabel} 定期確認`,
    prompt:
      options.prompt ??
      `${run.workspaceName} で ${run.task} を scheduled assistant preview として再実行し、結果を local run history に記録する。`,
    workspaceName: run.workspaceName,
    cadence,
    cadenceLabel: formatBrowserScheduleCadence(cadence),
    enabled,
    status,
    approvalPolicy: approvalPolicyForAssistantRunHistory(run),
    nextRunAt: enabled ? calculateNextBrowserScheduleRunAt(cadence, createdAt) : undefined,
    lastRunStatus: run.status,
    runHistory: [run].slice(0, maxRunsPerTask)
  };
}

export function appendBrowserSchedulerRunHistory(
  task: BrowserSchedulerTaskDraft,
  run: BrowserAgentRun
): BrowserSchedulerTaskDraft {
  return {
    ...task,
    lastRunStatus: run.status,
    runHistory: [run, ...task.runHistory].slice(0, maxRunsPerTask)
  };
}

export function mergeBrowserSchedulerTaskDrafts(
  primaryTask: BrowserSchedulerTaskDraft | null | undefined,
  tasks: BrowserSchedulerTaskDraft[]
): BrowserSchedulerTaskDraft[] {
  if (!primaryTask) {
    return tasks;
  }

  return [primaryTask, ...tasks.filter((task) => task.id !== primaryTask.id)];
}

export function selectBrowserScheduleEditorSource({
  selectedTaskId,
  assistantTask,
  tasks
}: {
  selectedTaskId?: string | null;
  assistantTask?: BrowserSchedulerTaskDraft | null;
  tasks: BrowserSchedulerTaskDraft[];
}): BrowserSchedulerTaskDraft | undefined {
  const selectedEditableTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId && canEnableSchedulerTask(task)) : undefined;

  return selectedEditableTask ?? assistantTask ?? tasks.find((task) => task.status === "ready") ?? tasks[0];
}

export function createBrowserScheduleHandoffReview(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserScheduleHandoffReview | null {
  if (!task) {
    return null;
  }

  const canSaveReviewDraft = task.source === "assistant_run_history" && task.status === "needs_approval";
  const status: BrowserScheduleHandoffReview["status"] = canSaveReviewDraft
    ? "ready_to_review"
    : task.status === "ready"
      ? "ready_task"
      : task.status === "blocked"
        ? "blocked"
        : "not_applicable";
  const reason = canSaveReviewDraft
    ? "assistant run history の追加確認を残したまま、local scheduler store の review draft として保存できます。"
    : task.status === "ready"
      ? "ready task は通常の Review and save flow で保存できます。"
      : task.status === "blocked"
        ? "blocked task は review draft としても保存しません。"
        : "この task draft は handoff review の対象ではありません。";

  return {
    id: `schedule-handoff-review-${hashSeed(`${task.id}:${task.sourceRunHistoryId}:${task.status}`)}`,
    sourceTaskId: task.id,
    title: `${task.name} の handoff review`,
    status,
    canSaveReviewDraft,
    primaryActionLabel: canSaveReviewDraft ? "Save review draft" : "Review unavailable",
    reason,
    metadata: [
      { label: "source", value: task.source },
      { label: "workspace", value: task.workspaceName },
      { label: "status", value: task.status },
      { label: "policy", value: task.approvalPolicy },
      { label: "next", value: task.nextRunAt ?? "review required" },
      { label: "runs", value: `${task.runHistory.length}/${maxRunsPerTask}` }
    ],
    checklist: [
      "保存対象は scheduler review draft だけです。",
      "needs_approval と manual_review_required を維持し、next run は作成しません。",
      "alarm、hidden window、browser automation、OCI GenAI、external MCP、cloud sync は開始しません。"
    ]
  };
}

export function createBrowserScheduleHandoffReviewDraft(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserSchedulerTaskDraft | null {
  const review = createBrowserScheduleHandoffReview(task);
  if (!task || !review?.canSaveReviewDraft) {
    return null;
  }

  return {
    ...task,
    id: createReviewDraftTaskId(task),
    enabled: false,
    status: "needs_approval",
    approvalPolicy: "manual_review_required",
    nextRunAt: undefined,
    runHistory: task.runHistory.slice(0, maxRunsPerTask)
  };
}

export function createBrowserScheduleReviewApprovalPreview(
  task: BrowserSchedulerTaskDraft | null | undefined
): BrowserScheduleReviewApprovalPreview | null {
  if (!task) {
    return null;
  }

  const canApprove = task.status === "needs_approval" && task.approvalPolicy === "manual_review_required";
  const status: BrowserScheduleReviewApprovalPreview["status"] = canApprove
    ? "ready_to_approve"
    : task.status === "ready" || task.status === "disabled"
      ? "already_ready"
      : task.status === "blocked"
        ? "blocked"
        : "not_applicable";
  const reason = canApprove
    ? "manual review 待ちの schedule draft を、明示承認済みの disabled draft として保存できます。"
    : task.status === "ready" || task.status === "disabled"
      ? "この schedule draft はすでに enable / edit flow に進めます。"
      : task.status === "blocked"
        ? "blocked task は approval preview から復帰しません。"
        : "この task draft は approval preview の対象ではありません。";

  return {
    id: `schedule-review-approval-${hashSeed(`${task.id}:${task.status}:${task.approvalPolicy}`)}`,
    sourceTaskId: task.id,
    title: `${task.name} の review approval`,
    status,
    canApprove,
    primaryActionLabel: canApprove ? "Approve as disabled draft" : "Approval unavailable",
    reason,
    approvedStatus: canApprove ? "disabled" : task.status,
    metadata: [
      { label: "source", value: task.source },
      { label: "workspace", value: task.workspaceName },
      { label: "current", value: task.status },
      { label: "approved", value: canApprove ? "disabled" : task.status },
      { label: "policy", value: task.approvalPolicy },
      { label: "next", value: "not scheduled" }
    ],
    checklist: [
      "承認後も enabled=false の disabled draft として保存します。",
      "manual_review_required は維持し、next run は作成しません。",
      "alarm、hidden window、agent execution、OCI GenAI、external MCP、cloud sync は開始しません。"
    ]
  };
}

export function createBrowserScheduleApprovedReviewDraft(
  task: BrowserSchedulerTaskDraft | null | undefined
): BrowserSchedulerTaskDraft | null {
  const approval = createBrowserScheduleReviewApprovalPreview(task);
  if (!task || !approval?.canApprove) {
    return null;
  }

  return {
    ...task,
    id: createReviewDraftTaskId(task),
    enabled: false,
    status: "disabled",
    approvalPolicy: "manual_review_required",
    nextRunAt: undefined,
    runHistory: task.runHistory.slice(0, maxRunsPerTask),
    lastRunStatus: task.lastRunStatus,
    cadenceLabel: formatBrowserScheduleCadence(task.cadence)
  };
}

export function createBrowserScheduleSuggestionCard(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserScheduleSuggestionCard | null {
  if (!task) {
    return null;
  }

  const canConfirm = task.status === "ready";
  const blockedReason = canConfirm
    ? undefined
    : task.status === "needs_approval"
      ? "approval queue の確認が完了していないため、自動実行候補として保存しません。"
      : task.status === "blocked"
        ? "blocked policy の run history は schedule card から保存できません。"
        : "disabled draft は有効化前の確認だけを表示します。";

  const sourceDescription =
    task.source === "assistant_context"
      ? "attached browser context から推定した schedule card です。保存しても alarm、hidden window、OCI 呼び出しは開始しません。"
      : task.source === "assistant_run_history"
        ? "assistant run history から推定した schedule card です。保存しても alarm、hidden window、OCI 呼び出しは開始しません。"
      : "会話と run history から推定した schedule card です。保存しても alarm、hidden window、OCI 呼び出しは開始しません。";

  return {
    id: `schedule-card-${hashSeed(`${task.id}:${task.sourceRunHistoryId}`)}`,
    sourceTaskId: task.id,
    title: `${task.name} を schedule card として確認`,
    description: sourceDescription,
    taskName: task.name,
    workspaceName: task.workspaceName,
    promptPreview: createPreviewText(task.prompt, 180),
    cadenceLabel: task.cadenceLabel,
    nextRunAt: task.nextRunAt,
    status: task.status,
    approvalPolicy: task.approvalPolicy,
    canConfirm,
    actionLabel: canConfirm ? "Review and save" : "Review required",
    blockedReason,
    details: [
      `source: ${task.source}`,
      `workspace: ${task.workspaceName}`,
      `cadence: ${task.cadenceLabel}`,
      `policy: ${task.approvalPolicy}`,
      `runs: ${task.runHistory.length}/${maxRunsPerTask}`
    ]
  };
}

export function createBrowserScheduleCardEditDraft(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserScheduleCardEditDraft | null {
  if (!task) {
    return null;
  }

  const canEnable = canEnableSchedulerTask(task);

  return {
    sourceTaskId: task.id,
    name: task.name,
    prompt: task.prompt,
    cadence: task.cadence,
    enabled: task.enabled,
    canEnable,
    disabledReason: canEnable ? undefined : "approval / blocked の task draft は有効化できません。"
  };
}

export function applyBrowserScheduleCardEdit(
  task: BrowserSchedulerTaskDraft,
  editDraft: BrowserScheduleCardEditDraft,
  updatedAt = new Date().toISOString()
): BrowserSchedulerTaskDraft {
  const canEnable = canEnableSchedulerTask(task);
  const enabled = canEnable && editDraft.enabled;
  const status: BrowserSchedulerTaskStatus = canEnable ? (enabled ? "ready" : "disabled") : task.status;

  return {
    ...task,
    name: normalizeText(editDraft.name, task.name),
    prompt: normalizeText(editDraft.prompt, task.prompt),
    cadence: editDraft.cadence,
    cadenceLabel: formatBrowserScheduleCadence(editDraft.cadence),
    enabled,
    status,
    nextRunAt: enabled ? calculateNextBrowserScheduleRunAt(editDraft.cadence, updatedAt) : undefined
  };
}

export function toggleBrowserSchedulerTaskEnabled(
  task: BrowserSchedulerTaskDraft,
  enabled: boolean,
  updatedAt = new Date().toISOString()
): BrowserSchedulerTaskDraft {
  const editDraft = createBrowserScheduleCardEditDraft(task);
  if (!editDraft) {
    return task;
  }

  return applyBrowserScheduleCardEdit(task, { ...editDraft, enabled }, updatedAt);
}

export function createBrowserSavedScheduleTaskDetail(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserSavedScheduleTaskDetail | null {
  if (!task) {
    return null;
  }

  const latestRun = task.runHistory[0];

  return {
    id: `saved-schedule-detail-${hashSeed(`${task.id}:${task.sourceRunHistoryId}`)}`,
    title: task.name,
    prompt: task.prompt,
    latestRunSummary: latestRun?.planSummary,
    metadata: [
      { label: "workspace", value: task.workspaceName },
      { label: "cadence", value: task.cadenceLabel },
      { label: "status", value: task.status },
      { label: "enabled", value: task.enabled ? "true" : "false" },
      { label: "policy", value: task.approvalPolicy },
      { label: "runs", value: `${task.runHistory.length}/${maxRunsPerTask}` }
    ]
  };
}

function createBrowserScheduledTaskPreviewActions(task: BrowserSchedulerTaskDraft): BrowserScheduledTaskPreviewAction[] {
  return [
    {
      id: "test_preview",
      label: "Test preview",
      enabled: task.status === "ready" && task.enabled,
      reason:
        task.status === "ready" && task.enabled
          ? "manual test preview の confirmation を作成できます。"
          : "enabled ready task だけが manual test preview の対象です。"
    },
    {
      id: "retry_preview",
      label: "Retry preview",
      enabled: task.lastRunStatus === "blocked",
      reason: task.lastRunStatus === "blocked" ? "失敗または blocked run の retry preview だけを表示します。" : "retry 対象の failed run はありません。"
    },
    {
      id: "cancel_preview",
      label: "Cancel preview",
      enabled: false,
      reason: "この切片では running task を作らないため cancel は preview のみです。"
    }
  ];
}

function findBrowserScheduledTaskPreviewAction(
  task: BrowserSchedulerTaskDraft,
  actionId: BrowserScheduledTaskPreviewAction["id"]
): BrowserScheduledTaskPreviewAction {
  return createBrowserScheduledTaskPreviewActions(task).find((action) => action.id === actionId) ?? createBrowserScheduledTaskPreviewActions(task)[0]!;
}

function createManualRunPlanSteps(
  task: BrowserSchedulerTaskDraft,
  action: BrowserScheduledTaskPreviewAction
): BrowserScheduledTaskManualRunPlanStep[] {
  const executionRisk: BrowserScheduledTaskManualRunPlanStep["risk"] = action.enabled ? "review" : "blocked";

  return [
    {
      id: "manual-run-load-task",
      title: "Load task draft",
      detail: `${task.workspaceName} の prompt、cadence、approval policy、直近 run history を確認します。`,
      risk: "safe"
    },
    {
      id: "manual-run-confirm-policy",
      title: "Confirm guardrails",
      detail: "hidden window、browser alarm、OCI 呼び出し、外部 MCP 実行を開始しない preview として扱います。",
      risk: executionRisk
    },
    {
      id: "manual-run-history-preview",
      title: "Prepare run history preview",
      detail: action.enabled
        ? "次の切片で guarded dry-run の結果を run history に追加できる状態にします。"
        : "policy 条件を満たさないため run history は更新しません。",
      risk: action.enabled ? "review" : "blocked"
    }
  ];
}

export function createBrowserScheduledTaskManualRunConfirmation(
  task: BrowserSchedulerTaskDraft | undefined,
  actionId: BrowserScheduledTaskPreviewAction["id"] = "test_preview"
): BrowserScheduledTaskManualRunConfirmation | null {
  if (!task) {
    return null;
  }

  const action = findBrowserScheduledTaskPreviewAction(task, actionId);
  const status: BrowserScheduledTaskManualRunConfirmation["status"] = action.enabled
    ? "ready_to_preview"
    : action.id === "cancel_preview"
      ? "not_applicable"
      : "blocked_by_policy";
  const policyReason = action.enabled
    ? `${action.label} は preview confirmation のみ作成します。実行には次の guarded dry-run 接続が必要です。`
    : action.reason;

  return {
    id: `scheduled-task-confirmation-${hashSeed(`${task.id}:${action.id}:${task.lastRunStatus}`)}`,
    sourceTaskId: task.id,
    actionId: action.id,
    title: `${action.label}: ${task.name}`,
    taskName: task.name,
    workspaceName: task.workspaceName,
    canConfirm: action.enabled,
    status,
    primaryActionLabel: action.enabled ? "Create dry-run preview" : "Preview unavailable",
    policyReason,
    dryRunSummary: `${task.prompt} / cadence ${task.cadenceLabel}`,
    expectedRunStatus: action.enabled ? "needs_approval" : "blocked",
    timeoutSeconds: 600,
    guardrails: [
      "manual confirmation なしで schedule task を実行しません。",
      "alarm と hidden browser window はこの preview では開始しません。",
      "OCI GenAI / external MCP には送信せず、local contract だけを作成します。"
    ],
    steps: createManualRunPlanSteps(task, action)
  };
}

function createBackgroundRunStageStatus(
  task: BrowserSchedulerTaskDraft,
  stage: BrowserScheduledTaskBackgroundRunStage["id"]
): BrowserScheduledTaskBackgroundRunStageStatus {
  if (task.status === "blocked" || task.status === "needs_approval") {
    return stage === "timeout_guard" ? "ready" : "blocked";
  }

  if (task.status === "disabled" || !task.enabled) {
    return stage === "timeout_guard" ? "ready" : "waiting";
  }

  if (stage === "alarm_trigger" || stage === "timeout_guard") {
    return "ready";
  }

  if (stage === "result_saved") {
    return "waiting";
  }

  return "needs_review";
}

export function createBrowserScheduledTaskBackgroundRunPreview(
  task: BrowserSchedulerTaskDraft | undefined
): BrowserScheduledTaskBackgroundRunPreview | null {
  if (!task) {
    return null;
  }

  const stages: BrowserScheduledTaskBackgroundRunStage[] = [
    {
      id: "alarm_trigger",
      title: "Schedule trigger",
      detail: task.enabled
        ? `${task.cadenceLabel} の next run を確認し、background run の起点にします。`
        : "task が disabled のため alarm trigger は待機状態です。",
      status: createBackgroundRunStageStatus(task, "alarm_trigger"),
      artifactLabel: task.nextRunAt ?? "not scheduled",
      guardrail: "この preview では browser alarm を登録しません。"
    },
    {
      id: "hidden_window",
      title: "Prepare hidden window",
      detail: "ユーザーの作業画面を中断しない background browser window の plan だけを作ります。",
      status: createBackgroundRunStageStatus(task, "hidden_window"),
      artifactLabel: "hidden window plan",
      guardrail: "BrowserWindow、WebContents、profile partition は作成しません。"
    },
    {
      id: "agent_execution",
      title: "Run agent prompt",
      detail: "OCI GenAI Enterprise AI Project 向け prompt と approved browser tool boundary を確認します。",
      status: createBackgroundRunStageStatus(task, "agent_execution"),
      artifactLabel: task.approvalPolicy,
      guardrail: "browser automation、OCI call、external MCP は開始しません。"
    },
    {
      id: "result_saved",
      title: "Save local result",
      detail: "結果は New Tab card と Scheduled Tasks run history の local-only 出力候補として扱います。",
      status: createBackgroundRunStageStatus(task, "result_saved"),
      artifactLabel: `${task.runHistory.length}/${maxRunsPerTask} runs`,
      guardrail: "run output は cloud sync 対象にせず、この端末の preview に残します。"
    },
    {
      id: "timeout_guard",
      title: "Apply timeout guard",
      detail: "10 分 timeout、manual retry、cancel preview の boundary を明示します。",
      status: createBackgroundRunStageStatus(task, "timeout_guard"),
      artifactLabel: "10 min",
      guardrail: "timeout は contract 表示のみで、実 timer や cancel signal は作成しません。"
    }
  ];

  const reviewGateCount = stages.filter((stage) => stage.status === "needs_review").length;
  const blockedCount = stages.filter((stage) => stage.status === "blocked").length;

  return {
    id: `scheduled-background-run-${hashSeed(`${task.id}:${task.nextRunAt ?? task.cadenceLabel}:${task.status}`)}`,
    sourceTaskId: task.id,
    title: "Background Run Preview",
    taskName: task.name,
    workspaceName: task.workspaceName,
    cadenceLabel: task.cadenceLabel,
    nextRunAt: task.nextRunAt,
    timeoutSeconds: 600,
    canOpenHiddenWindow: false,
    canExecuteAgent: false,
    canPersistResult: false,
    localOnlyNotice:
      "BrowserOS の公開 scheduled-task flow に合わせた preview です。alarm、hidden window、agent execution、result persistence は開始しません。",
    stats: [
      { label: "Stages", value: String(stages.length) },
      { label: "Review", value: String(reviewGateCount) },
      { label: "Blocked", value: String(blockedCount) },
      { label: "Timeout", value: "10m" }
    ],
    metadata: [
      { label: "workspace", value: task.workspaceName },
      { label: "cadence", value: task.cadenceLabel },
      { label: "next", value: task.nextRunAt ?? "not scheduled" },
      { label: "cloud sync", value: "schedule config only" },
      { label: "run result", value: "local device only" },
      { label: "policy", value: task.approvalPolicy }
    ],
    stages,
    actions: [
      {
        id: "review_plan",
        label: "Review plan",
        enabled: true,
        reason: "background run flow の contract を確認するだけです。"
      },
      {
        id: "open_hidden_window",
        label: "Open hidden window",
        enabled: false,
        reason: "この clean-room preview では hidden browser window を作成しません。"
      },
      {
        id: "execute_agent",
        label: "Execute agent",
        enabled: false,
        reason: "OCI GenAI、browser automation、external MCP は起動しません。"
      },
      {
        id: "save_result",
        label: "Save result",
        enabled: false,
        reason: "result persistence は New Tab / run history preview に限定します。"
      }
    ],
    guardrails: [
      "schedule setup は sync candidate でも、run result と output は local device only として扱います。",
      "hidden window、browser alarm、timer、browser action、profile write はこの切片では作成しません。",
      "credential、wallet、token、cookie、private key は background prompt と result metadata に含めません。",
      "BrowserOS source / asset / scheduled-task implementation reuse なし。"
    ]
  };
}

function createManualRunStepStatus(
  step: BrowserScheduledTaskManualRunPlanStep,
  confirmation: BrowserScheduledTaskManualRunConfirmation
): BrowserAgentRun["steps"][number]["status"] {
  if (step.risk === "blocked") {
    return "blocked";
  }

  if (step.risk === "review") {
    return confirmation.canConfirm ? "skipped" : "blocked";
  }

  return "completed";
}

function createManualRunStepMessage(
  status: BrowserAgentRun["steps"][number]["status"],
  confirmation: BrowserScheduledTaskManualRunConfirmation
): string {
  if (status === "completed") {
    return "local schedule draft の確認だけを完了扱いにしました。";
  }

  if (status === "skipped") {
    return `${confirmation.primaryActionLabel} は次の guarded dry-run 接続まで実行しません。`;
  }

  return "policy 条件を満たさないため history candidate だけを作成します。";
}

function createManualRunEventLevel(status: BrowserAgentRun["steps"][number]["status"]): BrowserAgentRun["events"][number]["level"] {
  if (status === "completed") {
    return "info";
  }

  if (status === "skipped" || status === "approved") {
    return "approval";
  }

  return "blocked";
}

export function createBrowserScheduledTaskDryRunHistoryCandidate(
  confirmation: BrowserScheduledTaskManualRunConfirmation | null,
  createdAt = new Date().toISOString()
): BrowserScheduledTaskDryRunHistoryCandidate | null {
  if (!confirmation) {
    return null;
  }

  const runId = `agent-run-schedule-${hashSeed(`${confirmation.id}:${createdAt}`)}`;
  const steps: BrowserAgentRun["steps"] = confirmation.steps.map((step, index) => {
    const status = createManualRunStepStatus(step, confirmation);

    return {
      stepId: step.id,
      order: index + 1,
      title: step.title,
      actionLabel: confirmation.actionId === "retry_preview" ? "Retry schedule" : "Test schedule",
      actionKind: "schedule_task",
      risk: step.risk,
      status,
      message: createManualRunStepMessage(status, confirmation)
    };
  });
  const run: BrowserAgentRun = {
    id: runId,
    task: confirmation.title,
    status: confirmation.expectedRunStatus,
    startedAt: createdAt,
    completedAt: createdAt,
    planSummary: confirmation.dryRunSummary,
    workspaceName: confirmation.workspaceName,
    steps,
    events: steps.map((step) => ({
      id: `${runId}-${step.stepId}-${step.status}`,
      stepId: step.stepId,
      level: createManualRunEventLevel(step.status),
      message: `${step.actionLabel}: ${step.message}`,
      createdAt
    }))
  };

  return {
    id: `scheduled-task-history-candidate-${hashSeed(`${confirmation.id}:${run.id}`)}`,
    sourceConfirmationId: confirmation.id,
    sourceTaskId: confirmation.sourceTaskId,
    actionId: confirmation.actionId,
    createdAt,
    canAppendToHistory: confirmation.canConfirm,
    status: run.status,
    summary: confirmation.canConfirm
      ? "guarded dry-run 接続後に run history へ追加できる候補です。"
      : "policy により run history へ追加しない blocked 候補です。",
    historyLabel: confirmation.canConfirm ? "candidate ready" : "candidate blocked",
    run,
    notes: [
      "この preview は BrowserAgentRun 互換 shape のみを生成します。",
      "schedule store、alarm、hidden window、OCI GenAI、external MCP は更新しません。",
      `timeout budget: ${confirmation.timeoutSeconds} seconds`
    ]
  };
}

export function applyBrowserScheduledTaskDryRunHistoryCandidatePreview(
  tasks: BrowserSchedulerTaskDraft[],
  candidate: BrowserScheduledTaskDryRunHistoryCandidate | null
): BrowserScheduledTaskHistoryPreviewApplyResult {
  const resultId = `scheduled-task-history-preview-${hashSeed(`${candidate?.id ?? "empty"}:${tasks.length}`)}`;

  if (!candidate) {
    return {
      id: resultId,
      applied: false,
      reason: "追加できる dry-run history candidate はありません。",
      tasks
    };
  }

  if (!candidate.canAppendToHistory) {
    return {
      id: resultId,
      sourceCandidateId: candidate.id,
      sourceTaskId: candidate.sourceTaskId,
      applied: false,
      reason: "policy により blocked candidate は local run history preview に追加しません。",
      tasks
    };
  }

  const targetIndex = tasks.findIndex((task) => task.id === candidate.sourceTaskId);
  if (targetIndex < 0) {
    return {
      id: resultId,
      sourceCandidateId: candidate.id,
      sourceTaskId: candidate.sourceTaskId,
      applied: false,
      reason: "対象の scheduled task が preview source に見つかりません。",
      tasks
    };
  }

  const targetTask = tasks[targetIndex]!;
  if (targetTask.runHistory.some((run) => run.id === candidate.run.id)) {
    return {
      id: resultId,
      sourceCandidateId: candidate.id,
      sourceTaskId: candidate.sourceTaskId,
      applied: false,
      reason: "同じ dry-run candidate はすでに local run history preview に追加されています。",
      appendedRunId: candidate.run.id,
      runHistoryCount: targetTask.runHistory.length,
      tasks
    };
  }

  const updatedTask = appendBrowserSchedulerRunHistory(targetTask, candidate.run);
  const updatedTasks = tasks.map((task, index) => (index === targetIndex ? updatedTask : task));

  return {
    id: resultId,
    sourceCandidateId: candidate.id,
    sourceTaskId: candidate.sourceTaskId,
    applied: true,
    reason: "dry-run candidate を renderer の local run history preview に追加しました。永続化と実行は行いません。",
    appendedRunId: candidate.run.id,
    runHistoryCount: updatedTask.runHistory.length,
    tasks: updatedTasks
  };
}

export function createBrowserScheduledTaskHistoryStoreCommitPreview({
  baseTasks,
  historyPreviewActive,
  previewTask
}: {
  baseTasks: BrowserSchedulerTaskDraft[];
  historyPreviewActive: boolean;
  previewTask: BrowserSchedulerTaskDraft | undefined;
}): BrowserScheduledTaskHistoryStoreCommitPreview | null {
  if (!previewTask) {
    return null;
  }

  const baseTask = baseTasks.find((task) => task.id === previewTask.id);
  const baseRunIds = new Set(baseTask?.runHistory.map((run) => run.id) ?? []);
  const appendedRunIds = previewTask.runHistory.map((run) => run.id).filter((runId) => !baseRunIds.has(runId));
  const canPersist = historyPreviewActive && Boolean(baseTask) && appendedRunIds.length > 0;
  const status: BrowserScheduledTaskHistoryStoreCommitPreview["status"] = canPersist
    ? "ready_to_save"
    : !historyPreviewActive || appendedRunIds.length === 0
      ? "no_preview"
      : "not_applicable";
  const reason = canPersist
    ? "local run history preview を同じ scheduled task draft として local scheduler store に保存できます。"
    : !historyPreviewActive
      ? "保存対象の local run history preview はまだありません。"
      : !baseTask
        ? "preview 元の scheduled task draft が base source に見つからないため保存しません。"
        : "base source との差分になる新しい run history はありません。";

  return {
    id: `scheduled-task-history-store-${hashSeed(`${previewTask.id}:${appendedRunIds.join(":") || "none"}`)}`,
    sourceTaskId: previewTask.id,
    title: `${previewTask.name} の local run history 保存`,
    status,
    canPersist,
    primaryActionLabel: canPersist ? "Save preview to scheduler store" : "Store save unavailable",
    reason,
    task: canPersist ? previewTask : undefined,
    appendedRunIds,
    metadata: [
      { label: "task", value: previewTask.name },
      { label: "appended runs", value: String(appendedRunIds.length) },
      { label: "base runs", value: String(baseTask?.runHistory.length ?? 0) },
      { label: "preview runs", value: String(previewTask.runHistory.length) },
      { label: "store", value: "local scheduler store" },
      { label: "sync", value: "local only" }
    ],
    checklist: [
      "保存対象は renderer で確認済みの local run history preview だけです。",
      "同じ task id / sourceRunHistoryId の scheduler draft として置き換え保存します。",
      "alarm、hidden window、browser automation、OCI GenAI、external MCP、cloud sync は開始しません。"
    ]
  };
}

export function createBrowserScheduledTaskRunOutputPreview(
  task: BrowserSchedulerTaskDraft | undefined,
  selectedRunId?: string
): BrowserScheduledTaskRunOutputPreview | null {
  if (!task || task.runHistory.length === 0) {
    return null;
  }

  const run = task.runHistory.find((candidate) => candidate.id === selectedRunId) ?? task.runHistory[0]!;
  const selectedIndex = task.runHistory.findIndex((candidate) => candidate.id === run.id);
  const toolUsage = run.steps.map((step) => ({
    id: step.stepId,
    label: step.actionLabel,
    kind: step.actionKind,
    status: step.status,
    risk: step.risk,
    message: step.message
  }));
  const findings = run.events.map((event) => ({
    id: event.id,
    level: event.level,
    message: event.message,
    createdAt: event.createdAt
  }));
  const outputText = [
    `task: ${task.name}`,
    `run: ${run.id}`,
    `status: ${run.status}`,
    `workspace: ${run.workspaceName}`,
    `summary: ${run.planSummary}`,
    "",
    "tools:",
    ...toolUsage.map((tool) => `- ${tool.label} / ${tool.kind} / ${tool.status}: ${tool.message}`),
    "",
    "findings:",
    ...(findings.length > 0 ? findings.map((finding) => `- ${finding.level}: ${finding.message}`) : ["- no findings recorded in this preview"])
  ].join("\n");

  return {
    id: `scheduled-task-run-output-${hashSeed(`${task.id}:${run.id}`)}`,
    taskId: task.id,
    runId: run.id,
    title: `${task.name} / ${run.startedAt}`,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    workspaceName: run.workspaceName,
    summary: run.planSummary,
    outputText,
    toolUsage,
    findings,
    metadata: [
      { label: "history position", value: `${Math.max(selectedIndex, 0) + 1}/${task.runHistory.length}` },
      { label: "tools", value: String(toolUsage.length) },
      { label: "findings", value: String(findings.length) },
      { label: "policy", value: task.approvalPolicy }
    ]
  };
}

export function createBrowserScheduledTaskNewTabResultPreview(
  output: BrowserScheduledTaskRunOutputPreview | null,
  state: {
    captureSaved?: boolean;
    knowledgeAdded?: boolean;
  } = {}
): BrowserScheduledTaskNewTabResultPreview | null {
  if (!output) {
    return null;
  }

  const completed = output.status === "completed";
  return {
    id: `scheduled-task-new-tab-${hashSeed(`${output.id}:${state.captureSaved ? "capture" : "none"}:${state.knowledgeAdded ? "knowledge" : "none"}`)}`,
    sourceOutputId: output.id,
    taskId: output.taskId,
    runId: output.runId,
    title: output.title,
    status: output.status,
    summary: output.summary,
    resultLocation: "new_tab_preview",
    runHistoryScope: "local_device_only",
    cloudSyncScope: "schedule_only",
    metadata: [
      { label: "workspace", value: output.workspaceName },
      { label: "tools", value: String(output.toolUsage.length) },
      { label: "findings", value: String(output.findings.length) },
      { label: "sync", value: "run output stays local" }
    ],
    highlights: [
      completed ? "scheduled task result は New Tab preview に表示できます。" : "完了していない run は New Tab preview で review state として表示します。",
      `full output は run history の ${output.runId} に保持します。`,
      "schedule setup の同期とは分離し、run output はこの端末の local preview に限定します。"
    ],
    actions: [
      {
        id: "open_full_output",
        label: "Open full output",
        enabled: true,
        reason: "選択 run の tools / findings / raw output を表示します。"
      },
      {
        id: "capture_result",
        label: state.captureSaved ? "Capture saved" : "Capture result",
        enabled: completed && !state.captureSaved,
        reason: state.captureSaved ? "local capture store に保存済みです。" : "完了済み run output は capture 候補として保存できます。"
      },
      {
        id: "add_to_knowledge",
        label: state.knowledgeAdded ? "Knowledge added" : "Add to knowledge",
        enabled: Boolean(state.captureSaved) && !state.knowledgeAdded,
        reason: state.knowledgeAdded ? "knowledge preview に追加済みです。" : "保存済み capture を knowledge preview に追加できます。"
      }
    ]
  };
}

export function createBrowserScheduledTaskNewTabResultFilterPreview(
  preview: BrowserScheduledTaskNewTabResultPreview | null,
  query: string
): BrowserScheduledTaskNewTabResultFilterPreview | null {
  if (!preview) {
    return null;
  }

  const normalizedQuery = normalizeSearchQuery(query);
  const searchableFields = [
    { label: "title", value: preview.title },
    { label: "summary", value: preview.summary },
    { label: "status", value: preview.status },
    { label: "task id", value: preview.taskId },
    { label: "run id", value: preview.runId },
    { label: "location", value: preview.resultLocation },
    { label: "run history", value: preview.runHistoryScope },
    { label: "cloud sync", value: preview.cloudSyncScope },
    ...preview.metadata.map((item) => ({ label: `metadata: ${item.label}`, value: item.value })),
    ...preview.highlights.map((highlight, index) => ({ label: `highlight ${index + 1}`, value: highlight })),
    ...preview.actions.map((action) => ({
      label: `action: ${action.label}`,
      value: `${action.id} ${action.reason} ${action.enabled ? "enabled" : "disabled"}`
    }))
  ];
  const matchedFields =
    normalizedQuery.length === 0
      ? searchableFields.slice(0, 4)
      : searchableFields.filter(
          (field) =>
            normalizeSearchQuery(field.label).includes(normalizedQuery) || normalizeSearchQuery(field.value).includes(normalizedQuery)
        );
  const visible = normalizedQuery.length === 0 || matchedFields.length > 0;

  return {
    id: `scheduled-task-new-tab-filter-${hashSeed(`${preview.id}:${normalizedQuery || "all"}`)}`,
    sourcePreviewId: preview.id,
    query,
    normalizedQuery,
    visible,
    matchCount: normalizedQuery.length === 0 ? searchableFields.length : matchedFields.length,
    matchedFields,
    emptyStateMessage: visible ? "" : "検索条件に一致する New Tab result はありません。",
    searchScope: ["title", "summary", "metadata", "highlights", "actions", "run id"]
  };
}

export function createBrowserScheduledTaskNewTabTracePreview(
  preview: BrowserScheduledTaskNewTabResultPreview | null,
  state: {
    captureSaved?: boolean;
    knowledgeAdded?: boolean;
  } = {}
): BrowserScheduledTaskNewTabTracePreview | null {
  if (!preview) {
    return null;
  }

  const completed = preview.status === "completed";
  const captureStatus = state.captureSaved ? "completed" : completed ? "available" : "locked";
  const knowledgeStatus = state.knowledgeAdded ? "completed" : state.captureSaved ? "available" : "locked";

  return {
    id: `scheduled-task-new-tab-trace-${hashSeed(`${preview.id}:${captureStatus}:${knowledgeStatus}`)}`,
    sourcePreviewId: preview.id,
    summary: `${preview.title} は New Tab result から run history と full output に戻れる local trace を持ちます。`,
    localOnlyNotice: "run output、capture、knowledge handoff はこの端末の local preview に限定します。",
    nodes: [
      {
        id: "new_tab_result",
        label: "New Tab result",
        description: "最新結果を compact card として表示します。",
        status: "current"
      },
      {
        id: "run_history",
        label: "Run history",
        description: `${preview.runId} を task history に保持します。`,
        status: "available"
      },
      {
        id: "full_output",
        label: "Full output",
        description: "tools、findings、raw output を確認できます。",
        status: "available",
        actionId: "open_full_output"
      },
      {
        id: "capture",
        label: state.captureSaved ? "Capture saved" : "Capture",
        description: state.captureSaved
          ? "local capture store に保存済みです。"
          : completed
            ? "完了済み result から capture confirmation に進めます。"
            : "完了済み run のみ capture に進めます。",
        status: captureStatus,
        actionId: state.captureSaved ? undefined : "capture_result"
      },
      {
        id: "knowledge",
        label: state.knowledgeAdded ? "Knowledge added" : "Knowledge",
        description: state.knowledgeAdded
          ? "knowledge preview に追加済みです。"
          : state.captureSaved
            ? "保存済み capture を knowledge preview に渡せます。"
            : "knowledge handoff は capture 保存後に有効化します。",
        status: knowledgeStatus,
        actionId: state.captureSaved && !state.knowledgeAdded ? "add_to_knowledge" : undefined
      }
    ]
  };
}

export function createBrowserScheduledTaskNewTabResultStackPreview(
  task: BrowserSchedulerTaskDraft | undefined,
  selectedRunId?: string,
  maxVisibleResults = 5
): BrowserScheduledTaskNewTabResultStackPreview | null {
  if (!task || task.runHistory.length === 0) {
    return null;
  }

  const visibleCount = clamp(Math.trunc(maxVisibleResults), 1, maxRunsPerTask);
  const effectiveSelectedRunId =
    selectedRunId && task.runHistory.some((run) => run.id === selectedRunId) ? selectedRunId : task.runHistory[0]?.id;

  return {
    id: `scheduled-task-new-tab-stack-${hashSeed(`${task.id}:${effectiveSelectedRunId ?? "latest"}:${visibleCount}:${task.runHistory.length}`)}`,
    sourceTaskId: task.id,
    selectedRunId: effectiveSelectedRunId,
    resultCount: task.runHistory.length,
    maxVisibleResults: visibleCount,
    localOnlyNotice: "recent results はこの端末の run history preview から表示し、cloud sync には含めません。",
    items: task.runHistory.slice(0, visibleCount).map((run, index) => ({
      id: `scheduled-task-new-tab-stack-item-${hashSeed(`${task.id}:${run.id}`)}`,
      runId: run.id,
      title: index === 0 ? "Latest result" : `Result ${index + 1}`,
      summary: createPreviewText(run.planSummary, 96),
      status: run.status,
      startedAt: run.startedAt,
      selected: run.id === effectiveSelectedRunId,
      metadata: [
        { label: "position", value: `${index + 1}/${task.runHistory.length}` },
        { label: "steps", value: String(run.steps.length) },
        { label: "events", value: String(run.events.length) }
      ]
    }))
  };
}

export function createBrowserScheduledTaskNewTabInboxPreview({
  tasks,
  selectedTaskId,
  selectedRunId,
  maxVisibleResults = 8
}: {
  tasks: BrowserSchedulerTaskDraft[];
  selectedTaskId?: string;
  selectedRunId?: string;
  maxVisibleResults?: number;
}): BrowserScheduledTaskNewTabInboxPreview {
  const visibleCount = clamp(Math.trunc(maxVisibleResults), 1, maxRunsPerTask);
  const runs = tasks.flatMap((task) =>
    task.runHistory.map((run, runIndex) => ({
      task,
      run,
      runIndex
    }))
  );
  const sortedRuns = [...runs].sort((left, right) => {
    const timeDelta = new Date(right.run.startedAt).getTime() - new Date(left.run.startedAt).getTime();
    if (timeDelta !== 0 && !Number.isNaN(timeDelta)) {
      return timeDelta;
    }

    return `${left.task.name}:${left.run.id}`.localeCompare(`${right.task.name}:${right.run.id}`);
  });
  const visibleRuns = sortedRuns.slice(0, visibleCount);

  return {
    id: `scheduled-task-new-tab-inbox-${hashSeed(`${tasks.map((task) => `${task.id}:${task.runHistory.length}`).join("|")}:${selectedTaskId ?? "none"}:${selectedRunId ?? "latest"}:${visibleCount}`)}`,
    selectedTaskId,
    selectedRunId,
    taskCount: tasks.length,
    resultCount: runs.length,
    maxVisibleResults: visibleCount,
    localOnlyNotice: "New Tab inbox は全 scheduled task の local run history preview を集約します。run output は cloud sync に含めません。",
    statusCounts: {
      completed: runs.filter((entry) => entry.run.status === "completed").length,
      needsApproval: runs.filter((entry) => entry.run.status === "needs_approval").length,
      blocked: runs.filter((entry) => entry.run.status === "blocked").length
    },
    items: visibleRuns.map(({ task, run, runIndex }, index) => ({
      id: `scheduled-task-new-tab-inbox-item-${hashSeed(`${task.id}:${run.id}`)}`,
      taskId: task.id,
      runId: run.id,
      taskName: task.name,
      workspaceName: task.workspaceName,
      title: index === 0 ? "Latest scheduled result" : `${task.name} / ${run.startedAt}`,
      summary: createPreviewText(run.planSummary, 110),
      status: run.status,
      startedAt: run.startedAt,
      selected: task.id === selectedTaskId && run.id === selectedRunId,
      metadata: [
        { label: "task", value: task.name },
        { label: "workspace", value: task.workspaceName },
        { label: "position", value: `${runIndex + 1}/${task.runHistory.length}` },
        { label: "steps", value: String(run.steps.length) },
        { label: "events", value: String(run.events.length) }
      ]
    }))
  };
}

export function createBrowserScheduledTaskNewTabInboxFilterPreview(
  preview: BrowserScheduledTaskNewTabInboxPreview,
  query: string,
  statusFilter: BrowserScheduledTaskNewTabInboxStatusFilter = "all"
): BrowserScheduledTaskNewTabInboxFilterPreview {
  const normalizedQuery = normalizeSearchQuery(query);
  const searchableFieldsByItem = preview.items.map((item) => {
    const fields = [
      { label: "task", value: item.taskName },
      { label: "workspace", value: item.workspaceName },
      { label: "title", value: item.title },
      { label: "summary", value: item.summary },
      { label: "status", value: item.status },
      { label: "run id", value: item.runId },
      { label: "started", value: item.startedAt },
      ...item.metadata.map((metadata) => ({ label: `metadata: ${metadata.label}`, value: metadata.value }))
    ];

    const matchedFields =
      normalizedQuery.length === 0
        ? fields.slice(0, 3)
        : fields.filter(
            (field) =>
              normalizeSearchQuery(field.label).includes(normalizedQuery) || normalizeSearchQuery(field.value).includes(normalizedQuery)
          );

    return {
      item,
      matchedFields: matchedFields.map((field) => ({ itemId: item.id, ...field }))
    };
  });
  const queryMatchedEntries =
    normalizedQuery.length === 0
      ? searchableFieldsByItem
      : searchableFieldsByItem.filter((entry) => entry.matchedFields.length > 0);
  const visibleEntries =
    statusFilter === "all" ? queryMatchedEntries : queryMatchedEntries.filter((entry) => entry.item.status === statusFilter);
  const visibleItems = visibleEntries.map((entry) => entry.item);
  const matchedFields = visibleEntries.flatMap((entry) => entry.matchedFields);
  const statusOptions: BrowserScheduledTaskNewTabInboxFilterPreview["statusOptions"] = [
    { id: "all", label: "All", count: queryMatchedEntries.length, selected: statusFilter === "all" },
    {
      id: "completed",
      label: "Done",
      count: queryMatchedEntries.filter((entry) => entry.item.status === "completed").length,
      selected: statusFilter === "completed"
    },
    {
      id: "needs_approval",
      label: "Review",
      count: queryMatchedEntries.filter((entry) => entry.item.status === "needs_approval").length,
      selected: statusFilter === "needs_approval"
    },
    {
      id: "blocked",
      label: "Blocked",
      count: queryMatchedEntries.filter((entry) => entry.item.status === "blocked").length,
      selected: statusFilter === "blocked"
    }
  ];

  return {
    id: `scheduled-task-new-tab-inbox-filter-${hashSeed(`${preview.id}:${normalizedQuery || "all"}:${statusFilter}`)}`,
    sourcePreviewId: preview.id,
    query,
    normalizedQuery,
    statusFilter,
    visibleCount: visibleItems.length,
    totalCount: preview.items.length,
    emptyStateMessage:
      visibleItems.length > 0
        ? ""
        : statusFilter !== "all" && queryMatchedEntries.length > 0
          ? "選択した status に一致する New Tab inbox result はありません。"
          : "検索条件に一致する New Tab inbox result はありません。",
    searchScope: ["task", "workspace", "title", "summary", "status", "run id", "metadata"],
    statusOptions,
    matchedFields,
    items: visibleItems
  };
}

export function createBrowserScheduledTaskNewTabInboxTriagePreview(
  filterPreview: BrowserScheduledTaskNewTabInboxFilterPreview
): BrowserScheduledTaskNewTabInboxTriagePreview {
  const completedCount = filterPreview.items.filter((item) => item.status === "completed").length;
  const reviewCount = filterPreview.items.filter((item) => item.status === "needs_approval").length;
  const blockedCount = filterPreview.items.filter((item) => item.status === "blocked").length;
  const primaryItem =
    filterPreview.statusFilter === "all"
      ? filterPreview.items.find((item) => item.status === "needs_approval") ??
        filterPreview.items.find((item) => item.status === "blocked") ??
        filterPreview.items[0]
      : filterPreview.items[0];
  const primaryActionLabel =
    primaryItem?.status === "needs_approval"
      ? "Open review result"
      : primaryItem?.status === "blocked"
        ? "Inspect blocked result"
        : primaryItem
          ? "Open completed result"
          : "No result to open";
  const summary =
    filterPreview.items.length === 0
      ? filterPreview.emptyStateMessage || "New Tab inbox result はありません。"
      : reviewCount > 0
        ? `${reviewCount} 件の review result を優先して確認できます。`
        : blockedCount > 0
          ? `${blockedCount} 件の blocked result を確認できます。`
          : `${completedCount} 件の completed result を確認できます。`;

  return {
    id: `scheduled-task-new-tab-inbox-triage-${hashSeed(`${filterPreview.id}:${primaryItem?.id ?? "empty"}`)}`,
    sourceFilterPreviewId: filterPreview.id,
    statusFilter: filterPreview.statusFilter,
    visibleCount: filterPreview.visibleCount,
    summary,
    guardrail: "Inbox triage は filtered local run history を読むだけで、scheduler store、run output、cloud sync は更新しません。",
    primaryItem,
    metrics: [
      { label: "visible", value: String(filterPreview.visibleCount) },
      { label: "review", value: String(reviewCount) },
      { label: "done", value: String(completedCount) },
      { label: "blocked", value: String(blockedCount) }
    ],
    primaryAction: {
      id: "open_result",
      label: primaryActionLabel,
      enabled: Boolean(primaryItem),
      reason: primaryItem
        ? `${primaryItem.taskName} / ${primaryItem.runId} を renderer state で選択します。`
        : "表示中の inbox result がありません。",
      taskId: primaryItem?.taskId,
      runId: primaryItem?.runId
    }
  };
}

export function createBrowserScheduledTaskNewTabInboxActionQueuePreview(
  filterPreview: BrowserScheduledTaskNewTabInboxFilterPreview,
  maxActions = 4
): BrowserScheduledTaskNewTabInboxActionQueuePreview {
  const actionLimit = clamp(Math.trunc(maxActions), 1, 6);
  const priorityRank: Record<BrowserAgentRunStatus, number> = {
    needs_approval: 0,
    blocked: 1,
    completed: 2
  };
  const actionCandidates = filterPreview.items
    .map((item, index) => {
      const priority: BrowserScheduledTaskNewTabInboxActionQueuePreview["actions"][number]["priority"] =
        item.status === "needs_approval" ? "review" : item.status === "blocked" ? "blocked" : "done";
      const label =
        item.status === "needs_approval" ? "Open review" : item.status === "blocked" ? "Inspect blocked" : "Open completed";

      return {
        id: `scheduled-task-new-tab-inbox-action-${hashSeed(`${filterPreview.id}:${item.taskId}:${item.runId}`)}`,
        itemId: item.id,
        taskId: item.taskId,
        runId: item.runId,
        label,
        title: item.taskName,
        summary: item.summary,
        status: item.status,
        priority,
        selected: item.selected,
        reason: `${item.taskName} / ${item.runId} を renderer state で選択します。`,
        sortIndex: index
      };
    })
    .sort((left, right) => {
      const priorityDelta = priorityRank[left.status] - priorityRank[right.status];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.sortIndex - right.sortIndex;
    });
  const actions = actionCandidates.slice(0, actionLimit).map((action) => ({
    id: action.id,
    itemId: action.itemId,
    taskId: action.taskId,
    runId: action.runId,
    label: action.label,
    title: action.title,
    summary: action.summary,
    status: action.status,
    priority: action.priority,
    selected: action.selected,
    reason: action.reason
  }));

  return {
    id: `scheduled-task-new-tab-inbox-action-queue-${hashSeed(`${filterPreview.id}:${actionLimit}:${actionCandidates.length}`)}`,
    sourceFilterPreviewId: filterPreview.id,
    visibleCount: filterPreview.visibleCount,
    actionCount: actionCandidates.length,
    maxActions: actionLimit,
    emptyStateMessage: actionCandidates.length > 0 ? "" : "表示中の inbox result から実行できる local action はありません。",
    localOnlyNotice: "Action queue は renderer state の task / run selection だけを更新し、scheduler store や cloud sync は更新しません。",
    actions
  };
}

export function createBrowserScheduledTaskNewTabInboxActionHandoffPreview(
  actionQueue: BrowserScheduledTaskNewTabInboxActionQueuePreview
): BrowserScheduledTaskNewTabInboxActionHandoffPreview {
  const sourceAction = actionQueue.actions.find((action) => action.selected) ?? actionQueue.actions[0];
  const blockedOperations = [
    "browser automation",
    "scheduler store write",
    "cloud sync",
    "external MCP",
    "OCI GenAI call",
    "BrowserOS source / asset / UI implementation reuse"
  ];
  const prompt = sourceAction
    ? [
        "次の scheduled task result を local review context として確認してください。",
        "",
        `- task: ${sourceAction.title}`,
        `- run id: ${sourceAction.runId}`,
        `- status: ${sourceAction.status}`,
        `- priority: ${sourceAction.priority}`,
        `- summary: ${sourceAction.summary}`,
        "",
        "要件:",
        "1. この local run history の事実だけを根拠にする。",
        "2. browser automation、scheduler store、cloud sync、external MCP、OCI GenAI call は実行しない。",
        "3. BrowserOS source、asset、UI implementation は再利用しない。",
        "4. 必要な確認事項と次の human review action を短く整理する。"
      ].join("\n")
    : "";
  const handoffPacket = sourceAction
    ? [
        "# Scheduled Task Result Handoff Packet",
        "",
        "## Source Action",
        "",
        `- action: ${sourceAction.label}`,
        `- task: ${sourceAction.title}`,
        `- run id: ${sourceAction.runId}`,
        `- status: ${sourceAction.status}`,
        `- priority: ${sourceAction.priority}`,
        "",
        "## Prompt",
        "",
        prompt,
        "",
        "## Clean-room Guardrails",
        "",
        "- local run history の事実だけを根拠にする。",
        "- browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は実行しない。",
        "- BrowserOS source、asset、UI implementation は再利用しない。"
      ].join("\n")
    : "";
  const reviewChecklist: BrowserScheduledTaskNewTabInboxActionHandoffPreview["reviewChecklist"] = [
    {
      id: "source_action",
      label: "Source action",
      status: sourceAction ? "passed" : "blocked",
      detail: sourceAction ? `${sourceAction.title} / ${sourceAction.runId}` : "表示中の inbox action がありません。"
    },
    {
      id: "local_scope",
      label: "Local scope",
      status: sourceAction ? "passed" : "blocked",
      detail: sourceAction ? "local run history だけを handoff packet に含めます。" : "local source がないため packet は生成されません。"
    },
    {
      id: "execution_guard",
      label: "Execution guard",
      status: sourceAction ? "passed" : "blocked",
      detail: "assistant 実行、browser automation、scheduler store write、外部送信は開始しません。"
    },
    {
      id: "clean_room",
      label: "Clean-room",
      status: sourceAction ? "passed" : "blocked",
      detail: "BrowserOS source、asset、UI implementation reuse を禁止します。"
    }
  ];

  return {
    id: `scheduled-task-new-tab-inbox-action-handoff-${hashSeed(`${actionQueue.id}:${sourceAction?.id ?? "empty"}`)}`,
    sourceActionQueueId: actionQueue.id,
    enabled: Boolean(sourceAction),
    title: sourceAction ? `${sourceAction.label}: ${sourceAction.title}` : "No inbox action handoff",
    sourceAction: sourceAction
      ? {
          itemId: sourceAction.itemId,
          taskId: sourceAction.taskId,
          runId: sourceAction.runId,
          label: sourceAction.label,
          title: sourceAction.title,
          status: sourceAction.status,
          priority: sourceAction.priority
        }
      : undefined,
    prompt,
    promptPreview: prompt ? createPreviewText(prompt, 180) : "表示中の inbox action がないため handoff prompt は作成されません。",
    handoffPacket,
    handoffPacketPreview: handoffPacket ? createPreviewText(handoffPacket, 220) : "表示中の inbox action がないため handoff packet は作成されません。",
    localOnlyNotice: "Handoff draft は clipboard 用の local prompt だけを生成し、assistant 実行や外部送信は開始しません。",
    metadata: [
      { label: "actions", value: String(actionQueue.actionCount) },
      { label: "visible", value: String(actionQueue.visibleCount) },
      { label: "source", value: sourceAction?.priority ?? "none" }
    ],
    reviewChecklist,
    blockedOperations,
    primaryAction: {
      id: "copy_prompt",
      label: sourceAction ? "Copy handoff packet" : "No packet",
      enabled: Boolean(sourceAction),
      reason: sourceAction ? `${sourceAction.title} の local review handoff packet をコピーします。` : "コピーできる handoff packet がありません。"
    }
  };
}

export function createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(
  handoff: BrowserScheduledTaskNewTabInboxActionHandoffPreview
): BrowserScheduledTaskNewTabInboxActionReviewDraftPreview {
  const outputSections: BrowserScheduledTaskNewTabInboxActionReviewDraftPreview["outputSections"] = [
    {
      id: "finding",
      label: "Current finding",
      detail: "handoff packet の local run history に基づく現状だけを要約します。"
    },
    {
      id: "risk",
      label: "Risk / blockers",
      detail: "review、blocked、done の優先度と残る確認事項を切り分けます。"
    },
    {
      id: "next_action",
      label: "Next human action",
      detail: "次に人が確認または選択すべき action を短く提示します。"
    },
    {
      id: "clean_room",
      label: "Clean-room confirmation",
      detail: "BrowserOS source / asset / UI implementation reuse がない前提を明示します。"
    }
  ];
  const passedChecks = handoff.reviewChecklist.filter((item) => item.status === "passed").length;
  const sourcePriority = handoff.metadata.find((item) => item.label === "source")?.value ?? "none";
  const draft = handoff.enabled
    ? [
        "次の handoff packet を assistant review draft として確認してください。",
        "",
        handoff.handoffPacket,
        "",
        "回答形式:",
        "1. Current finding: local run history の事実だけを短く要約する。",
        "2. Risk / blockers: blocked operation と review が必要な点を列挙する。",
        "3. Next human action: 次に人が実行または確認する action を 1-3 件に絞る。",
        "4. Clean-room confirmation: BrowserOS source、asset、UI implementation reuse がない前提を確認する。",
        "",
        "禁止事項:",
        "- assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call を開始しない。"
      ].join("\n")
    : "";

  return {
    id: `scheduled-task-new-tab-inbox-action-review-draft-${hashSeed(`${handoff.id}:${handoff.enabled ? "ready" : "empty"}`)}`,
    sourceHandoffId: handoff.id,
    enabled: handoff.enabled,
    title: handoff.enabled ? `${handoff.title} review draft` : "No action review draft",
    draft,
    draftPreview: draft ? createPreviewText(draft, 220) : "handoff packet がないため review draft は作成されません。",
    localOnlyNotice: "Review draft は clipboard 用の local text だけを生成し、assistant 実行や外部送信は開始しません。",
    metadata: [
      { label: "packet", value: handoff.enabled ? "ready" : "empty" },
      { label: "source", value: sourcePriority },
      { label: "checks", value: `${passedChecks}/${handoff.reviewChecklist.length}` },
      { label: "blocked", value: String(handoff.blockedOperations.length) }
    ],
    outputSections,
    primaryAction: {
      id: "copy_review_draft",
      label: handoff.enabled ? "Copy review draft" : "No draft",
      enabled: handoff.enabled,
      reason: handoff.enabled ? `${handoff.title} の local review draft をコピーします。` : "コピーできる review draft がありません。"
    }
  };
}

export function createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(
  review: BrowserScheduledTaskNewTabInboxActionReviewDraftPreview
): BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview {
  const sourcePriority = review.metadata.find((item) => item.label === "source")?.value ?? "none";
  const recommendedDecision: BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview["recommendedDecision"] = !review.enabled
    ? {
        id: "unavailable",
        label: "No decision",
        tone: "muted",
        reason: "review draft がないため decision note は生成されません。"
      }
    : sourcePriority === "blocked"
      ? {
          id: "inspect_blocked",
          label: "Inspect blocked",
          tone: "danger",
          reason: "blocked result は実行を進めず、原因と解除条件を人が確認します。"
        }
      : sourcePriority === "done"
        ? {
            id: "archive_done",
            label: "Archive done",
            tone: "success",
            reason: "completed result は必要な evidence を確認してから完了扱いにします。"
          }
        : {
            id: "review_required",
            label: "Review required",
            tone: "warning",
            reason: "needs approval result は assistant draft を読んでから人が次の action を選びます。"
          };
  const decisionNote = review.enabled
    ? [
        "# Scheduled Task Inbox Review Decision",
        "",
        `- decision: ${recommendedDecision.label}`,
        `- source priority: ${sourcePriority}`,
        `- review draft: ${review.title}`,
        `- reason: ${recommendedDecision.reason}`,
        "",
        "## Required Human Checks",
        "",
        ...review.outputSections.map((section) => `- ${section.label}: ${section.detail}`),
        "",
        "## Guardrails",
        "",
        "- この decision note は renderer local preview / clipboard 用です。",
        "- assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は開始しません。",
        "- BrowserOS source、asset、UI implementation は再利用しません。"
      ].join("\n")
    : "";

  return {
    id: `scheduled-task-new-tab-inbox-action-review-decision-${hashSeed(`${review.id}:${recommendedDecision.id}`)}`,
    sourceReviewDraftId: review.id,
    enabled: review.enabled,
    title: review.enabled ? `${recommendedDecision.label} decision preview` : "No review decision preview",
    recommendedDecision,
    decisionNote,
    decisionNotePreview: decisionNote ? createPreviewText(decisionNote, 220) : "review draft がないため decision note は作成されません。",
    metadata: [
      { label: "source", value: sourcePriority },
      { label: "decision", value: recommendedDecision.id },
      { label: "sections", value: String(review.outputSections.length) }
    ],
    nextActions: [
      {
        id: "read_review",
        label: "Read review draft",
        detail: "Current finding、risk、next action、clean-room confirmation を確認します。"
      },
      {
        id: "inspect_source",
        label: "Inspect source result",
        detail: "必要に応じて action queue の source result を renderer state で開きます。"
      },
      {
        id: "copy_note",
        label: "Copy decision note",
        detail: "decision note を clipboard にコピーして human review record として使います。"
      }
    ],
    localOnlyNotice: "Decision preview は local review state の提案だけを表示し、保存や自動実行は行いません。",
    primaryAction: {
      id: "copy_decision_note",
      label: review.enabled ? "Copy decision note" : "No note",
      enabled: review.enabled,
      reason: review.enabled ? `${recommendedDecision.label} の local decision note をコピーします。` : "コピーできる decision note がありません。"
    }
  };
}

export function createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview(
  handoff: BrowserScheduledTaskNewTabInboxActionHandoffPreview,
  decision: BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview
): BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview {
  const sourceAction = handoff.sourceAction;
  const canOpenSource = Boolean(decision.enabled && sourceAction);
  const routeCards: BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview["routeCards"] = [
    {
      id: "open_source_result",
      label: "Open source result",
      detail: sourceAction
        ? `${sourceAction.title} / ${sourceAction.runId} を renderer state で開きます。`
        : "source result がないため開けません。",
      enabled: canOpenSource,
      taskId: sourceAction?.taskId,
      runId: sourceAction?.runId
    },
    {
      id: "read_review_draft",
      label: "Read review draft",
      detail: "Review draft preview と decision reason を確認します。",
      enabled: decision.enabled
    },
    {
      id: "copy_decision_note",
      label: "Copy decision note",
      detail: "Decision note を clipboard にコピーして human review record として使います。",
      enabled: decision.primaryAction.enabled
    }
  ];

  return {
    id: `scheduled-task-new-tab-inbox-action-decision-route-${hashSeed(`${handoff.id}:${decision.id}:${sourceAction?.runId ?? "none"}`)}`,
    sourceHandoffId: handoff.id,
    sourceDecisionId: decision.id,
    enabled: canOpenSource,
    title: canOpenSource ? `${decision.recommendedDecision.label} route preview` : "No decision route preview",
    localOnlyNotice: "Decision route は renderer state の task / run selection だけを更新し、保存や自動実行は行いません。",
    metadata: [
      { label: "decision", value: decision.recommendedDecision.id },
      { label: "source", value: sourceAction?.priority ?? "none" },
      { label: "routes", value: String(routeCards.filter((route) => route.enabled).length) }
    ],
    routeCards,
    primaryAction: {
      id: "open_source_result",
      label: canOpenSource ? "Open source result" : "No source result",
      enabled: canOpenSource,
      reason: sourceAction
        ? `${sourceAction.title} / ${sourceAction.runId} を renderer state で選択します。`
        : "開ける source result がありません。",
      taskId: sourceAction?.taskId,
      runId: sourceAction?.runId
    }
  };
}

export function createBrowserScheduledTaskRunCapturePreview(
  output: BrowserScheduledTaskRunOutputPreview | null
): BrowserScheduledTaskRunCapturePreview | null {
  if (!output) {
    return null;
  }

  const markdown = [
    `# ${output.title}`,
    "",
    `- task id: ${output.taskId}`,
    `- run id: ${output.runId}`,
    `- status: ${output.status}`,
    `- workspace: ${output.workspaceName}`,
    `- started: ${output.startedAt}`,
    `- completed: ${output.completedAt}`,
    "",
    "## Summary",
    "",
    output.summary,
    "",
    "## Tools Used",
    "",
    ...(output.toolUsage.length > 0
      ? output.toolUsage.map((tool) => `- ${tool.label} / ${tool.kind} / ${tool.status}: ${tool.message}`)
      : ["- no tool usage recorded in this preview"]),
    "",
    "## Findings",
    "",
    ...(output.findings.length > 0
      ? output.findings.map((finding) => `- ${finding.level} / ${finding.createdAt}: ${finding.message}`)
      : ["- no findings recorded in this preview"]),
    "",
    "## Raw Output",
    "",
    "```text",
    output.outputText,
    "```"
  ].join("\n");

  return {
    id: `scheduled-task-run-capture-${hashSeed(`${output.taskId}:${output.runId}:${output.id}`)}`,
    sourceOutputId: output.id,
    taskId: output.taskId,
    runId: output.runId,
    title: `Capture preview: ${output.title}`,
    kind: "scheduled_task_run_output",
    storageMode: "preview_only",
    canSaveToCaptureStore: false,
    markdown,
    metadata: [
      { label: "format", value: "markdown" },
      { label: "tools", value: String(output.toolUsage.length) },
      { label: "findings", value: String(output.findings.length) },
      { label: "storage", value: "preview only" }
    ],
    warnings: [
      "local capture store には保存しません。",
      "OCI GenAI、external MCP、cloud sync には送信しません。",
      "run output はこの renderer preview の Markdown 候補としてだけ扱います。"
    ]
  };
}

export function createBrowserScheduledTaskRunCaptureSaveConfirmation(
  capturePreview: BrowserScheduledTaskRunCapturePreview | null,
  createdAt = new Date().toISOString()
): BrowserScheduledTaskRunCaptureSaveConfirmation | null {
  if (!capturePreview) {
    return null;
  }

  return {
    id: `scheduled-task-capture-confirmation-${hashSeed(`${capturePreview.id}:${createdAt}`)}`,
    sourceCapturePreviewId: capturePreview.id,
    taskId: capturePreview.taskId,
    runId: capturePreview.runId,
    title: `Capture save review: ${capturePreview.title}`,
    status: "ready_to_review",
    canPersistToCaptureStore: false,
    primaryActionLabel: "Confirm preview only",
    policyReason: "この切片では保存前確認だけを行い、local capture store には書き込みません。",
    proposedCapture: {
      title: capturePreview.title,
      kind: capturePreview.kind,
      savedAt: createdAt,
      bodyPreview: createPreviewText(capturePreview.markdown, 220),
      markdownCharacters: capturePreview.markdown.length
    },
    checklist: [
      "Markdown capture 候補の内容を確認しました。",
      "local capture store への保存は次の切片まで開始しません。",
      "OCI GenAI、external MCP、cloud sync には送信しません。"
    ],
    metadata: [
      { label: "task", value: capturePreview.taskId },
      { label: "run", value: capturePreview.runId },
      { label: "source", value: capturePreview.sourceOutputId },
      { label: "storage", value: "confirmation only" }
    ]
  };
}

export function createBrowserScheduledTaskRunCaptureStoreDraft(
  confirmation: BrowserScheduledTaskRunCaptureSaveConfirmation | null,
  capturePreview: BrowserScheduledTaskRunCapturePreview | null,
  context: BrowserScheduledTaskRunCaptureStoreContext
): BrowserScheduledTaskRunCaptureStoreDraft | null {
  if (!confirmation || !capturePreview || confirmation.sourceCapturePreviewId !== capturePreview.id) {
    return null;
  }

  const title = `Scheduled task capture: ${capturePreview.title}`;
  return {
    id: `scheduled-task-capture-store-${hashSeed(`${confirmation.id}:${context.workspaceId}:${context.url}`)}`,
    sourceConfirmationId: confirmation.id,
    sourceCapturePreviewId: capturePreview.id,
    canPersistToCaptureStore: true,
    localCaptureKind: "selection",
    primaryActionLabel: "Save to local captures",
    payload: {
      workspaceId: context.workspaceId,
      url: context.url,
      title,
      sourceType: context.sourceType,
      selectedText: capturePreview.markdown
    },
    metadata: [
      { label: "workspace", value: context.workspaceId },
      { label: "kind", value: "selection" },
      { label: "chars", value: String(capturePreview.markdown.length) },
      { label: "source", value: confirmation.id }
    ],
    checklist: [
      "保存対象は Markdown capture 候補だけです。",
      "local capture store に selection capture として保存します。",
      "scheduler store、alarm、hidden browser window、OCI GenAI、external MCP、cloud sync は更新しません。"
    ]
  };
}

export function createBrowserScheduledTaskRunCaptureKnowledgeDraft(
  storeDraft: BrowserScheduledTaskRunCaptureStoreDraft | null,
  persistedCaptureId: string | null | undefined
): BrowserScheduledTaskRunCaptureKnowledgeDraft | null {
  if (!storeDraft || !persistedCaptureId) {
    return null;
  }

  return {
    id: `scheduled-task-capture-knowledge-${hashSeed(`${storeDraft.id}:${persistedCaptureId}`)}`,
    sourceStoreDraftId: storeDraft.id,
    captureId: persistedCaptureId,
    canAddToKnowledge: true,
    primaryActionLabel: "Add to knowledge",
    metadata: [
      { label: "capture", value: persistedCaptureId },
      { label: "source", value: storeDraft.sourceCapturePreviewId },
      { label: "kind", value: storeDraft.localCaptureKind },
      { label: "status", value: "ready" }
    ],
    checklist: [
      "local capture store に保存済みの capture だけを knowledge preview に追加します。",
      "RAG 用 chunk は既存の renderer knowledge pipeline で作成します。",
      "OCI GenAI、Oracle Vector Search、external MCP、cloud sync はこの操作では起動しません。"
    ]
  };
}

function createBrowserScheduledTasksPageItem(task: BrowserSchedulerTaskDraft): BrowserScheduledTasksPageItem {
  return {
    id: task.id,
    name: task.name,
    workspaceName: task.workspaceName,
    cadenceLabel: task.cadenceLabel,
    status: task.status,
    enabled: task.enabled,
    lastRunStatus: task.lastRunStatus,
    runCount: task.runHistory.length,
    ...(task.nextRunAt ? { nextRunAt: task.nextRunAt } : {})
  };
}

function createBrowserScheduledTasksPageDetail(task: BrowserSchedulerTaskDraft): BrowserScheduledTasksPageDetail {
  return {
    id: task.id,
    title: task.name,
    prompt: task.prompt,
    workspaceName: task.workspaceName,
    cadenceLabel: task.cadenceLabel,
    status: task.status,
    enabled: task.enabled,
    actions: createBrowserScheduledTaskPreviewActions(task),
    history: task.runHistory.slice(0, maxRunsPerTask).map((run) => ({
      id: run.id,
      status: run.status,
      startedAt: run.startedAt,
      summary: run.planSummary,
      stepCount: run.steps.length,
      ...(run.completedAt ? { completedAt: run.completedAt } : {})
    })),
    ...(task.nextRunAt ? { nextRunAt: task.nextRunAt } : {})
  };
}

export function createBrowserScheduledTasksPagePreview(
  tasks: BrowserSchedulerTaskDraft[],
  selectedTaskId?: string
): BrowserScheduledTasksPagePreview {
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];

  return {
    id: `scheduled-tasks-page-${hashSeed(tasks.map((task) => task.id).join(":") || "empty")}`,
    taskCount: tasks.length,
    enabledCount: tasks.filter((task) => task.enabled).length,
    disabledCount: tasks.filter((task) => task.status === "disabled").length,
    needsReviewCount: tasks.filter((task) => task.status === "needs_approval").length,
    blockedCount: tasks.filter((task) => task.status === "blocked").length,
    items: tasks.map(createBrowserScheduledTasksPageItem),
    selectedDetail: selectedTask ? createBrowserScheduledTasksPageDetail(selectedTask) : null,
    ...(selectedTask ? { selectedTaskId: selectedTask.id } : {})
  };
}

export function createBrowserSchedulerRegistryPreview(
  entries: BrowserMcpRunHistoryEntry[],
  createdAt = new Date().toISOString()
): BrowserSchedulerRegistryPreview {
  const tasks = entries.map((entry) => createBrowserSchedulerTaskDraftFromRunHistory(entry, {}, createdAt));

  return {
    id: `browser-scheduler-registry-${hashSeed(createdAt)}`,
    createdAt,
    taskCount: tasks.length,
    readyCount: tasks.filter((task) => task.status === "ready").length,
    approvalCount: tasks.filter((task) => task.status === "needs_approval").length,
    blockedCount: tasks.filter((task) => task.status === "blocked").length,
    maxRunsPerTask,
    tasks
  };
}
