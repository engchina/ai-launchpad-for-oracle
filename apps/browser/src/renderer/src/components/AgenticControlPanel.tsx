import {
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Columns3,
  Copy,
  ExternalLink,
  FileClock,
  GitBranch,
  History,
  HardDrive,
  Image as ImageIcon,
  ListChecks,
  MessageSquare,
  Network,
  PanelRightOpen,
  Plug,
  Play,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  Trash2,
  Wrench,
  type LucideIcon
} from "lucide-react";
import { type ChangeEvent, type ReactElement, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  agenticModes,
  capabilitySignals,
  connectorBlueprints,
  scheduledTaskBlueprints,
  type AgenticModeId,
  type StatusTone
} from "@renderer/data/agenticOs";
import { cn } from "@renderer/lib/utils";
import { createBrowserAgentPlan, type BrowserAgentPlan } from "../../../shared/agentActions";
import { createBrowserAgentRunPreview, type BrowserAgentRun } from "../../../shared/agentRuns";
import {
  createBrowserAppConnectorsPreview,
  type BrowserAppConnector,
  type BrowserAppConnectorsPreview
} from "../../../shared/browserAppConnectors";
import {
  createBrowserChatPanelPreview,
  createBrowserHubComparisonPreview,
  type BrowserChatPanelPreview,
  type BrowserChatProviderId,
  type BrowserHubComparisonPreview,
  type BrowserHubPaneCount
} from "../../../shared/browserChatHub";
import {
  createBrowserCoworkPreview,
  type BrowserCoworkOperationStatus,
  type BrowserCoworkPreview,
  type BrowserCoworkRisk
} from "../../../shared/browserCowork";
import {
  createBrowserMemoryPreview,
  type BrowserMemoryEntry,
  type BrowserMemoryPreview
} from "../../../shared/browserMemory";
import {
  createBrowserSoulPreview,
  type BrowserSoulPreview,
  type BrowserSoulSection
} from "../../../shared/browserSoul";
import {
  createBrowserSkillsCatalogPreview,
  type BrowserSkillDefinition,
  type BrowserSkillsCatalogPreview
} from "../../../shared/browserSkillsCatalog";
import {
  createBrowserSmartNudgesPreview,
  type BrowserSmartNudgeCard,
  type BrowserSmartNudgePreview
} from "../../../shared/browserSmartNudges";
import {
  createBrowserWorkflowGraphDraft,
  type BrowserWorkflowGraphDraft,
  type BrowserWorkflowNodeStatus
} from "../../../shared/browserWorkflowGraph";
import { formatBrowserToolCategorySummary, summarizeBrowserToolCatalog } from "../../../shared/browserToolCatalog";
import {
  createBrowserToolInvocationPreview,
  type BrowserToolInvocationPreview
} from "../../../shared/browserToolInvocation";
import { executeBrowserToolDryRun, type BrowserToolExecutionPreview } from "../../../shared/browserToolExecutor";
import { handleBrowserMcpRequest, type BrowserMcpResponse } from "../../../shared/browserMcpProtocol";
import {
  createBrowserMcpApprovalQueue,
  type BrowserMcpApprovalQueueItem,
  type BrowserMcpApprovalQueueItemStatus
} from "../../../shared/browserMcpApprovalQueue";
import {
  createBrowserMcpApprovalDecision,
  createBrowserMcpExecutionConfirmation,
  getApprovedBrowserMcpAuditEventIds,
  type BrowserMcpApprovalDecision,
  type BrowserMcpExecutionConfirmation
} from "../../../shared/browserMcpApprovalDecision";
import {
  createBrowserMcpClientOnboardingPreview,
  createBrowserMcpClientCommands,
  getBrowserMcpEndpointDisplayUrl,
  type BrowserMcpClientCommand,
  type BrowserMcpClientOnboardingPreview
} from "../../../shared/browserMcpEndpointCommands";
import { createBrowserMcpRunHistory, type BrowserMcpRunHistoryEntry } from "../../../shared/browserMcpRunHistory";
import {
  applyBrowserScheduledTaskDryRunHistoryCandidatePreview,
  applyBrowserScheduleCardEdit,
  createBrowserScheduleApprovedReviewDraft,
  createBrowserScheduleHandoffReview,
  createBrowserScheduleHandoffReviewDraft,
  createBrowserScheduleReviewApprovalPreview,
  createBrowserScheduleCardEditDraft,
  createBrowserSavedScheduleTaskDetail,
  createBrowserScheduledTaskBackgroundRunPreview,
  createBrowserScheduledTaskDryRunHistoryCandidate,
  createBrowserScheduledTaskHistoryStoreCommitPreview,
  createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview,
  createBrowserScheduledTaskManualRunConfirmation,
  createBrowserScheduledTaskNewTabInboxActionHandoffPreview,
  createBrowserScheduledTaskNewTabInboxActionQueuePreview,
  createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview,
  createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview,
  createBrowserScheduledTaskNewTabInboxFilterPreview,
  createBrowserScheduledTaskNewTabInboxPreview,
  createBrowserScheduledTaskNewTabInboxTriagePreview,
  createBrowserScheduledTaskNewTabResultFilterPreview,
  createBrowserScheduledTaskNewTabResultPreview,
  createBrowserScheduledTaskNewTabResultStackPreview,
  createBrowserScheduledTaskNewTabTracePreview,
  createBrowserScheduledTaskRunCaptureKnowledgeDraft,
  createBrowserScheduledTaskRunCapturePreview,
  createBrowserScheduledTaskRunCaptureSaveConfirmation,
  createBrowserScheduledTaskRunCaptureStoreDraft,
  createBrowserScheduledTaskRunOutputPreview,
  createBrowserScheduledTasksPagePreview,
  createBrowserSchedulerRegistryPreview,
  createBrowserScheduleSuggestionCard,
  mergeBrowserSchedulerTaskDrafts,
  selectBrowserScheduleEditorSource,
  type BrowserScheduleCadence,
  type BrowserScheduleCardEditDraft,
  type BrowserScheduleHandoffReview,
  type BrowserScheduleReviewApprovalPreview,
  type BrowserSavedScheduleTaskDetail,
  type BrowserScheduledTaskBackgroundRunPreview,
  type BrowserScheduledTaskDryRunHistoryCandidate,
  type BrowserScheduledTaskHistoryStoreCommitPreview,
  type BrowserScheduledTaskManualRunConfirmation,
  type BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview,
  type BrowserScheduledTaskNewTabInboxActionHandoffPreview,
  type BrowserScheduledTaskNewTabInboxActionQueuePreview,
  type BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview,
  type BrowserScheduledTaskNewTabInboxActionReviewDraftPreview,
  type BrowserScheduledTaskNewTabInboxFilterPreview,
  type BrowserScheduledTaskNewTabInboxPreview,
  type BrowserScheduledTaskNewTabInboxStatusFilter,
  type BrowserScheduledTaskNewTabInboxTriagePreview,
  type BrowserScheduledTaskNewTabResultFilterPreview,
  type BrowserScheduledTaskNewTabResultPreview,
  type BrowserScheduledTaskNewTabResultStackPreview,
  type BrowserScheduledTaskNewTabTracePreview,
  type BrowserScheduledTaskRunCaptureKnowledgeDraft,
  type BrowserScheduledTaskPreviewAction,
  type BrowserScheduledTaskRunCapturePreview,
  type BrowserScheduledTaskRunCaptureSaveConfirmation,
  type BrowserScheduledTaskRunCaptureStoreDraft,
  type BrowserScheduledTaskRunOutputPreview,
  type BrowserScheduledTasksPagePreview,
  type BrowserSchedulerRegistryPreview,
  type BrowserScheduleSuggestionCard,
  type BrowserSchedulerTaskDraft
} from "../../../shared/browserSchedulerRegistry";
import type { BrowserMcpAuditEvent, BrowserMcpEndpointState, CapturedPageRecord, PageSourceType } from "../../../shared/api";

const modeIcons: Record<AgenticModeId, LucideIcon> = {
  chat: MessageSquare,
  agent: Bot,
  workflow: GitBranch,
  schedule: Calendar,
  memory: HardDrive,
  mcp: Plug
};

const toneStyles: Record<StatusTone, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  progress: "border-sky-200 bg-sky-50 text-sky-800",
  planned: "border-slate-200 bg-slate-50 text-slate-700",
  guarded: "border-amber-200 bg-amber-50 text-amber-800"
};

const workflowNodeStatusStyles: Record<BrowserWorkflowNodeStatus, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-700"
};

const coworkOperationStatusStyles: Record<BrowserCoworkOperationStatus, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-700"
};

const coworkRiskStyles: Record<BrowserCoworkRisk, string> = {
  safe: "border-sky-200 bg-sky-50 text-sky-800",
  review: "border-amber-200 bg-white text-amber-800",
  blocked: "border-rose-200 bg-white text-rose-700"
};

const browserToolCatalogSummary = summarizeBrowserToolCatalog();
const browserToolCatalogItems = [
  `${browserToolCatalogSummary.totalTools} tools / no approval ${browserToolCatalogSummary.notRequired} / review ${browserToolCatalogSummary.reviewRequired} / blocked ${browserToolCatalogSummary.blockedByDefault}`,
  ...browserToolCatalogSummary.categories
    .filter((summary) => summary.total > 0)
    .map((summary) => formatBrowserToolCategorySummary(summary))
];

const browserToolInvocationExamples = [
  createBrowserToolInvocationPreview({
    toolId: "extract_text",
    requestedBy: "agent_plan",
    workspaceName: "Oracle PoC Workspace",
    createdAt: "2026-05-28T10:15:00.000Z"
  }),
  createBrowserToolInvocationPreview({
    toolId: "navigate",
    input: { url: "https://docs.oracle.com/" },
    requestedBy: "user_preview",
    workspaceName: "Oracle PoC Workspace",
    createdAt: "2026-05-28T10:16:00.000Z"
  }),
  createBrowserToolInvocationPreview({
    toolId: "history_delete_range",
    input: { since: "2026-05-01" },
    requestedBy: "mcp_client",
    workspaceName: "Oracle PoC Workspace",
    createdAt: "2026-05-28T10:17:00.000Z"
  })
];
const browserToolExecutionExamples = browserToolInvocationExamples.map((example) =>
  executeBrowserToolDryRun(example.draft, example.draft.createdAt)
);
const browserMcpProtocolExamples = [
  handleBrowserMcpRequest({
    id: "mcp-tools-list",
    method: "tools/list",
    workspaceName: "Oracle PoC Workspace"
  }),
  handleBrowserMcpRequest({
    id: "mcp-tools-call",
    method: "tools/call",
    workspaceName: "Oracle PoC Workspace",
    createdAt: "2026-05-28T12:00:00.000Z",
    params: {
      toolId: "navigate",
      requestedBy: "mcp_client"
    }
  })
];

type McpEndpointProbeState = {
  status: "idle" | "checking" | "ok" | "error";
  message: string;
  checkedAt?: string;
  streamPreview?: string;
};

function createPreviewBrowserMcpEndpointState(): BrowserMcpEndpointState {
  return {
    status: "stopped",
    config: {
      host: "127.0.0.1",
      port: 9239,
      endpointPath: "/mcp",
      healthPath: "/health",
      streamPath: "/sse"
    },
    message: "Browser MCP HTTP endpoint は Electron preload から user opt-in で起動します。"
  };
}

function createIdleMcpEndpointProbe(): McpEndpointProbeState {
  return {
    status: "idle",
    message: "Endpoint 起動後に health と SSE preview を確認できます。"
  };
}

function createPreviewMcpAuditEvents(): BrowserMcpAuditEvent[] {
  return [
    {
      id: "preview-audit-approved-call",
      kind: "mcp_request",
      status: "ok",
      occurredAt: "2026-05-28T14:06:00.000Z",
      sessionId: "preview-session",
      httpMethod: "POST",
      path: "/mcp",
      httpStatus: 200,
      requestId: "preview-approved-call",
      workspaceName: "Oracle PoC Workspace",
      mcpMethod: "tools/call",
      toolId: "extract_text",
      executionStatus: "completed",
      approvalDecisionId: "preview-decision-approved",
      approvalDecisionStatus: "approved_preview",
      message: "tools/call handled by guarded Browser MCP bridge."
    },
    {
      id: "preview-audit-tools-call",
      kind: "mcp_request",
      status: "waiting_approval",
      occurredAt: "2026-05-28T14:05:00.000Z",
      sessionId: "preview-session",
      httpMethod: "POST",
      path: "/mcp",
      httpStatus: 200,
      requestId: "preview-tools-call",
      workspaceName: "Oracle PoC Workspace",
      mcpMethod: "tools/call",
      toolId: "navigate",
      executionStatus: "waiting_approval",
      message: "tools/call handled by Browser MCP bridge."
    },
    {
      id: "preview-audit-health",
      kind: "health_check",
      status: "ok",
      occurredAt: "2026-05-28T14:04:00.000Z",
      sessionId: "preview-session",
      httpMethod: "GET",
      path: "/health",
      httpStatus: 200,
      message: "Browser MCP health check completed."
    },
    {
      id: "preview-audit-started",
      kind: "endpoint_started",
      status: "ok",
      occurredAt: "2026-05-28T14:03:00.000Z",
      sessionId: "preview-session",
      httpMethod: "LISTEN",
      path: "/mcp",
      httpStatus: 200,
      message: "Browser MCP HTTP endpoint started on 127.0.0.1:9239."
    }
  ];
}

type AgenticControlPanelProps = {
  workspaceId: string;
  workspaceName: string;
  playbookTitle: string;
  currentUrl: string;
  currentTitle: string;
  sourceType: PageSourceType;
  activeModeId?: AgenticModeId;
  activeChatProviderId?: BrowserChatProviderId;
  captureCount?: number;
  knowledgeChunkCount?: number;
  assistantScheduleTaskDraft?: BrowserSchedulerTaskDraft | null;
  assistantWorkflowGraphDraft?: BrowserWorkflowGraphDraft | null;
  onActiveModeChange?: (modeId: AgenticModeId) => void;
  onActiveChatProviderChange?: (providerId: BrowserChatProviderId) => void;
  onScheduledCaptureSaved?: (capture: CapturedPageRecord) => void;
  onScheduledCaptureAddToKnowledge?: (captureId: string) => void;
};

type ScheduledTaskCapturePersistStatus = "idle" | "saving" | "saved" | "error";
type ScheduledTaskCaptureKnowledgeStatus = "idle" | "added" | "error";

function createPreviewScheduledTaskCaptureResult(
  draft: BrowserScheduledTaskRunCaptureStoreDraft,
  savedAt = new Date().toISOString()
): { ok: true; id: string; savedAt: string; capture: CapturedPageRecord } {
  const capture: CapturedPageRecord = {
    id: draft.id,
    workspaceId: draft.payload.workspaceId,
    kind: "selection",
    title: `選択: ${draft.payload.title}`,
    url: draft.payload.url,
    sourceType: draft.payload.sourceType,
    selectedText: draft.payload.selectedText,
    savedAt
  };

  return {
    ok: true,
    id: capture.id,
    savedAt,
    capture
  };
}

export function AgenticControlPanel({
  workspaceId,
  workspaceName,
  playbookTitle,
  currentUrl,
  currentTitle,
  sourceType,
  activeModeId,
  activeChatProviderId,
  captureCount = 0,
  knowledgeChunkCount = 0,
  assistantScheduleTaskDraft,
  assistantWorkflowGraphDraft,
  onActiveModeChange,
  onActiveChatProviderChange,
  onScheduledCaptureSaved,
  onScheduledCaptureAddToKnowledge
}: AgenticControlPanelProps): ReactElement {
  const agentContext = useMemo(
    () => ({
      workspaceName,
      playbookTitle,
      currentUrl,
      currentTitle,
      sourceType
    }),
    [currentTitle, currentUrl, playbookTitle, sourceType, workspaceName]
  );
  const [internalSelectedModeId, setInternalSelectedModeId] = useState<AgenticModeId>("agent");
  const selectedModeId = activeModeId ?? internalSelectedModeId;
  const [internalSelectedChatProviderId, setInternalSelectedChatProviderId] = useState<BrowserChatProviderId>("oci_genai_enterprise");
  const selectedChatProviderId = activeChatProviderId ?? internalSelectedChatProviderId;
  const [chatHubPaneCount, setChatHubPaneCount] = useState<BrowserHubPaneCount>(3);
  const [chatScreenshotAttached, setChatScreenshotAttached] = useState(false);
  const [memoryQuery, setMemoryQuery] = useState("");
  const deferredMemoryQuery = useDeferredValue(memoryQuery);
  const [soulInstructionDraft, setSoulInstructionDraft] = useState("メール送信や予定作成は必ず確認してから実行する。");
  const [agentTaskDraft, setAgentTaskDraft] = useState(
    "現在ページを観測し、PoC readiness、必要な capture、follow-up artifact を整理する。"
  );
  const [plannedTask, setPlannedTask] = useState(
    "現在ページを観測し、PoC readiness、必要な capture、follow-up artifact を整理する。"
  );
  const [approvedStepIds, setApprovedStepIds] = useState<string[]>([]);
  const [agentRun, setAgentRun] = useState<BrowserAgentRun | null>(null);
  const [mcpEndpointState, setMcpEndpointState] = useState<BrowserMcpEndpointState>(() => createPreviewBrowserMcpEndpointState());
  const [mcpEndpointAction, setMcpEndpointAction] = useState<"idle" | "starting" | "stopping">("idle");
  const [mcpEndpointCopyStatus, setMcpEndpointCopyStatus] = useState("");
  const [mcpEndpointProbe, setMcpEndpointProbe] = useState<McpEndpointProbeState>(() => createIdleMcpEndpointProbe());
  const [mcpAuditEvents, setMcpAuditEvents] = useState<BrowserMcpAuditEvent[]>(() => createPreviewMcpAuditEvents());
  const [mcpAuditMessage, setMcpAuditMessage] = useState("renderer preview は sample audit log を表示しています。");
  const [mcpApprovalDecisions, setMcpApprovalDecisions] = useState<BrowserMcpApprovalDecision[]>([]);
  const [savedSchedulerTasks, setSavedSchedulerTasks] = useState<BrowserSchedulerTaskDraft[]>([]);
  const [schedulerMessage, setSchedulerMessage] = useState("renderer preview は scheduler draft を保存しません。");
  const [scheduledTaskReviewApprovalMessage, setScheduledTaskReviewApprovalMessage] = useState("review approval preview はまだありません。");
  const [scheduleEditorDraftOverride, setScheduleEditorDraftOverride] = useState<BrowserScheduleCardEditDraft | null>(null);
  const [selectedScheduledTaskId, setSelectedScheduledTaskId] = useState<string | null>(null);
  const [selectedScheduledTaskActionId, setSelectedScheduledTaskActionId] = useState<BrowserScheduledTaskPreviewAction["id"]>("test_preview");
  const [selectedScheduledTaskRunId, setSelectedScheduledTaskRunId] = useState<string | null>(null);
  const [scheduledTaskHistoryPreviewTasks, setScheduledTaskHistoryPreviewTasks] = useState<{
    sourceId: string;
    tasks: BrowserSchedulerTaskDraft[];
  } | null>(null);
  const [scheduledTaskHistoryPreviewMessage, setScheduledTaskHistoryPreviewMessage] = useState("local run history preview はまだありません。");
  const [scheduledTaskHistoryStoreMessage, setScheduledTaskHistoryStoreMessage] = useState("local run history preview はまだ保存されていません。");
  const [scheduledTaskCaptureSaveMessage, setScheduledTaskCaptureSaveMessage] = useState("capture save confirmation はまだありません。");
  const [scheduledTaskCaptureConfirmedId, setScheduledTaskCaptureConfirmedId] = useState<string | null>(null);
  const [scheduledTaskCapturePersistedDraftId, setScheduledTaskCapturePersistedDraftId] = useState<string | null>(null);
  const [scheduledTaskCapturePersistedCaptureId, setScheduledTaskCapturePersistedCaptureId] = useState<string | null>(null);
  const [scheduledTaskCapturePersistStatus, setScheduledTaskCapturePersistStatus] = useState<ScheduledTaskCapturePersistStatus>("idle");
  const [scheduledTaskCaptureKnowledgeStatus, setScheduledTaskCaptureKnowledgeStatus] = useState<ScheduledTaskCaptureKnowledgeStatus>("idle");
  const hasBrowserMcpEndpointApi = Boolean(window.aiLaunchpad?.browserMcpEndpoint);
  const hasSchedulerRegistryApi = Boolean(window.aiLaunchpad?.schedulerRegistry);
  const agentPlan = useMemo(
    () =>
      createBrowserAgentPlan({
        ...agentContext,
        task: plannedTask
      }),
    [agentContext, plannedTask]
  );
  const browserCoworkPreview = useMemo(
    () =>
      createBrowserCoworkPreview({
        workspaceName,
        playbookTitle,
        currentTitle,
        currentUrl,
        task: agentTaskDraft,
        captureCount,
        knowledgeChunkCount
      }),
    [agentTaskDraft, captureCount, currentTitle, currentUrl, knowledgeChunkCount, playbookTitle, workspaceName]
  );
  const selectedMode = useMemo(
    () => agenticModes.find((mode) => mode.id === selectedModeId) ?? agenticModes[0],
    [selectedModeId]
  );
  const handleSelectMode = useCallback(
    (modeId: AgenticModeId) => {
      if (activeModeId === undefined) {
        setInternalSelectedModeId(modeId);
      }
      onActiveModeChange?.(modeId);
    },
    [activeModeId, onActiveModeChange]
  );
  const handleSelectChatProvider = useCallback(
    (providerId: BrowserChatProviderId) => {
      if (activeChatProviderId === undefined) {
        setInternalSelectedChatProviderId(providerId);
      }
      onActiveChatProviderChange?.(providerId);
    },
    [activeChatProviderId, onActiveChatProviderChange]
  );
  const SelectedIcon = modeIcons[selectedMode.id];
  const mcpEndpointUrl = getBrowserMcpEndpointDisplayUrl(mcpEndpointState);
  const mcpClientCommands = useMemo(() => createBrowserMcpClientCommands(mcpEndpointUrl), [mcpEndpointUrl]);
  const mcpClientOnboardingPreview = useMemo(
    () => createBrowserMcpClientOnboardingPreview(mcpEndpointState),
    [mcpEndpointState]
  );
  const approvedMcpAuditEventIds = useMemo(
    () => getApprovedBrowserMcpAuditEventIds(mcpApprovalDecisions),
    [mcpApprovalDecisions]
  );
  const mcpApprovalQueue = useMemo(
    () => createBrowserMcpApprovalQueue(mcpAuditEvents, approvedMcpAuditEventIds),
    [approvedMcpAuditEventIds, mcpAuditEvents]
  );
  const mcpExecutionConfirmation = useMemo(() => createBrowserMcpExecutionConfirmation(mcpApprovalQueue), [mcpApprovalQueue]);
  const mcpRunHistory = useMemo(() => createBrowserMcpRunHistory(mcpAuditEvents, mcpApprovalDecisions), [mcpApprovalDecisions, mcpAuditEvents]);
  const mcpSchedulerPreview = useMemo(() => createBrowserSchedulerRegistryPreview(mcpRunHistory), [mcpRunHistory]);
  const defaultWorkflowGraphDraft = useMemo(
    () =>
      createBrowserWorkflowGraphDraft({
        workspaceName,
        playbookTitle,
        currentTitle,
        currentUrl
      }),
    [currentTitle, currentUrl, playbookTitle, workspaceName]
  );
  const workflowGraphDraft = assistantWorkflowGraphDraft ?? defaultWorkflowGraphDraft;
  const schedulerPreview = useMemo(() => {
    const tasks = mergeBrowserSchedulerTaskDrafts(assistantScheduleTaskDraft, mcpSchedulerPreview.tasks);

    return {
      ...mcpSchedulerPreview,
      id: assistantScheduleTaskDraft ? `${mcpSchedulerPreview.id}:assistant-handoff` : mcpSchedulerPreview.id,
      taskCount: tasks.length,
      readyCount: tasks.filter((task) => task.status === "ready").length,
      approvalCount: tasks.filter((task) => task.status === "needs_approval").length,
      blockedCount: tasks.filter((task) => task.status === "blocked").length,
      tasks
    };
  }, [assistantScheduleTaskDraft, mcpSchedulerPreview]);
  const savedScheduleTaskDetail = useMemo(
    () => createBrowserSavedScheduleTaskDetail(savedSchedulerTasks[0]),
    [savedSchedulerTasks]
  );
  const scheduledTasksBaseSource =
    savedSchedulerTasks.length > 0
      ? mergeBrowserSchedulerTaskDrafts(assistantScheduleTaskDraft, savedSchedulerTasks)
      : schedulerPreview.tasks;
  const scheduledTasksBaseSourceId = `${savedSchedulerTasks.length > 0 ? "saved" : "draft"}:${scheduledTasksBaseSource.map((task) => task.id).join(":")}`;
  const scheduledTasksPageSource =
    scheduledTaskHistoryPreviewTasks?.sourceId === scheduledTasksBaseSourceId ? scheduledTaskHistoryPreviewTasks.tasks : scheduledTasksBaseSource;
  const scheduleEditorSourceTask = useMemo(
    () =>
      selectBrowserScheduleEditorSource({
        selectedTaskId: selectedScheduledTaskId,
        assistantTask: assistantScheduleTaskDraft,
        tasks: scheduledTasksPageSource
      }),
    [assistantScheduleTaskDraft, scheduledTasksPageSource, selectedScheduledTaskId]
  );
  const scheduleSuggestionCard = useMemo(
    () => createBrowserScheduleSuggestionCard(scheduleEditorSourceTask),
    [scheduleEditorSourceTask]
  );
  const scheduleHandoffReview = useMemo(
    () => createBrowserScheduleHandoffReview(scheduleEditorSourceTask),
    [scheduleEditorSourceTask]
  );
  const defaultScheduleEditorDraft = useMemo(
    () => createBrowserScheduleCardEditDraft(scheduleEditorSourceTask),
    [scheduleEditorSourceTask]
  );
  const scheduleEditorDraft =
    scheduleEditorDraftOverride?.sourceTaskId === defaultScheduleEditorDraft?.sourceTaskId
      ? scheduleEditorDraftOverride
      : defaultScheduleEditorDraft;
  const scheduledTasksPagePreview = useMemo(
    () =>
      createBrowserScheduledTasksPagePreview(
        scheduledTasksPageSource,
        selectedScheduledTaskId ?? undefined
      ),
    [scheduledTasksPageSource, selectedScheduledTaskId]
  );
  const selectedScheduledTask = useMemo(
    () => scheduledTasksPageSource.find((task) => task.id === scheduledTasksPagePreview.selectedTaskId),
    [scheduledTasksPageSource, scheduledTasksPagePreview.selectedTaskId]
  );
  const scheduledTaskHistoryPreviewActive = scheduledTaskHistoryPreviewTasks?.sourceId === scheduledTasksBaseSourceId;
  const scheduledTaskHistoryStoreCommitPreview = useMemo(
    () =>
      createBrowserScheduledTaskHistoryStoreCommitPreview({
        baseTasks: scheduledTasksBaseSource,
        historyPreviewActive: scheduledTaskHistoryPreviewActive,
        previewTask: selectedScheduledTask
      }),
    [scheduledTaskHistoryPreviewActive, scheduledTasksBaseSource, selectedScheduledTask]
  );
  const scheduledTaskManualRunConfirmation = useMemo(
    () => createBrowserScheduledTaskManualRunConfirmation(selectedScheduledTask, selectedScheduledTaskActionId),
    [selectedScheduledTask, selectedScheduledTaskActionId]
  );
  const scheduledTaskReviewApprovalPreview = useMemo(
    () => createBrowserScheduleReviewApprovalPreview(selectedScheduledTask),
    [selectedScheduledTask]
  );
  const scheduledTaskBackgroundRunPreview = useMemo(
    () => createBrowserScheduledTaskBackgroundRunPreview(selectedScheduledTask),
    [selectedScheduledTask]
  );
  const scheduledTaskDryRunHistoryCandidate = useMemo(
    () => createBrowserScheduledTaskDryRunHistoryCandidate(scheduledTaskManualRunConfirmation),
    [scheduledTaskManualRunConfirmation]
  );
  const scheduledTaskRunOutputPreview = useMemo(
    () => createBrowserScheduledTaskRunOutputPreview(selectedScheduledTask, selectedScheduledTaskRunId ?? undefined),
    [selectedScheduledTask, selectedScheduledTaskRunId]
  );
  const scheduledTaskRunCapturePreview = useMemo(
    () => createBrowserScheduledTaskRunCapturePreview(scheduledTaskRunOutputPreview),
    [scheduledTaskRunOutputPreview]
  );
  const scheduledTaskRunCaptureSaveConfirmation = useMemo(
    () => createBrowserScheduledTaskRunCaptureSaveConfirmation(scheduledTaskRunCapturePreview),
    [scheduledTaskRunCapturePreview]
  );
  const scheduledTaskRunCaptureStoreDraft = useMemo(
    () =>
      createBrowserScheduledTaskRunCaptureStoreDraft(scheduledTaskRunCaptureSaveConfirmation, scheduledTaskRunCapturePreview, {
        workspaceId,
        url: currentUrl,
        sourceType
      }),
    [currentUrl, scheduledTaskRunCapturePreview, scheduledTaskRunCaptureSaveConfirmation, sourceType, workspaceId]
  );
  const scheduledTaskRunCaptureKnowledgeDraft = useMemo(
    () => createBrowserScheduledTaskRunCaptureKnowledgeDraft(scheduledTaskRunCaptureStoreDraft, scheduledTaskCapturePersistedCaptureId),
    [scheduledTaskCapturePersistedCaptureId, scheduledTaskRunCaptureStoreDraft]
  );
  const scheduledTaskCaptureSaveConfirmed = scheduledTaskCaptureConfirmedId === scheduledTaskRunCaptureSaveConfirmation?.id;
  const scheduledTaskCapturePersisted = scheduledTaskCapturePersistedDraftId === scheduledTaskRunCaptureStoreDraft?.id;
  const scheduledTaskNewTabResultPreview = useMemo(
    () =>
      createBrowserScheduledTaskNewTabResultPreview(scheduledTaskRunOutputPreview, {
        captureSaved: scheduledTaskCapturePersisted,
        knowledgeAdded: scheduledTaskCaptureKnowledgeStatus === "added"
      }),
    [scheduledTaskCaptureKnowledgeStatus, scheduledTaskCapturePersisted, scheduledTaskRunOutputPreview]
  );
  const scheduledTaskNewTabResultStackPreview = useMemo(
    () => createBrowserScheduledTaskNewTabResultStackPreview(selectedScheduledTask, selectedScheduledTaskRunId ?? undefined),
    [selectedScheduledTask, selectedScheduledTaskRunId]
  );
  const scheduledTaskNewTabInboxPreview = useMemo(
    () =>
      createBrowserScheduledTaskNewTabInboxPreview({
        tasks: scheduledTasksPageSource,
        selectedTaskId: scheduledTasksPagePreview.selectedTaskId,
        selectedRunId: selectedScheduledTaskRunId ?? undefined
      }),
    [scheduledTasksPagePreview.selectedTaskId, scheduledTasksPageSource, selectedScheduledTaskRunId]
  );
  const browserChatPanelPreview = useMemo(
    () =>
      createBrowserChatPanelPreview({
        workspaceName,
        url: currentUrl,
        title: currentTitle,
        sourceType,
        selectedText: scheduledTaskRunCapturePreview?.markdown,
        captureCount: scheduledTaskCapturePersisted ? 1 : 0,
        knowledgeChunkCount: scheduledTaskCaptureKnowledgeStatus === "added" ? 1 : 0,
        screenshotAttached: chatScreenshotAttached,
        activeProviderId: selectedChatProviderId
      }),
    [
      chatScreenshotAttached,
      currentTitle,
      currentUrl,
      scheduledTaskCaptureKnowledgeStatus,
      scheduledTaskCapturePersisted,
      scheduledTaskRunCapturePreview,
      selectedChatProviderId,
      sourceType,
      workspaceName
    ]
  );
  const browserHubComparisonPreview = useMemo(
    () => createBrowserHubComparisonPreview(browserChatPanelPreview, chatHubPaneCount),
    [browserChatPanelPreview, chatHubPaneCount]
  );
  const browserMemoryPreview = useMemo(
    () =>
      createBrowserMemoryPreview({
        workspaceName,
        playbookTitle,
        currentUrl,
        currentTitle,
        captureCount,
        knowledgeChunkCount,
        query: deferredMemoryQuery
      }),
    [captureCount, currentTitle, currentUrl, deferredMemoryQuery, knowledgeChunkCount, playbookTitle, workspaceName]
  );
  const browserSoulPreview = useMemo(
    () =>
      createBrowserSoulPreview({
        workspaceName,
        currentMode: selectedMode.id,
        instructionDraft: soulInstructionDraft,
        preferredLanguage: "Japanese project UI / Chinese conversation"
      }),
    [selectedMode.id, soulInstructionDraft, workspaceName]
  );
  const browserSkillsCatalogPreview = useMemo(
    () =>
      createBrowserSkillsCatalogPreview({
        workspaceName,
        playbookTitle,
        currentMode: selectedMode.id,
        instructionQuery: deferredMemoryQuery
      }),
    [deferredMemoryQuery, playbookTitle, selectedMode.id, workspaceName]
  );
  const browserAppConnectorsPreview = useMemo(
    () =>
      createBrowserAppConnectorsPreview({
        workspaceName,
        playbookTitle,
        connectedConnectorIds:
          mcpEndpointState.status === "running"
            ? ["oci_genai_project", "oracle_ai_database", "browser_control_mcp"]
            : ["oci_genai_project", "oracle_ai_database"],
        manualFallbackConnectorIds: mcpEndpointState.status === "running" ? [] : ["browser_control_mcp"],
        nowLabel: mcpEndpointState.status
      }),
    [mcpEndpointState.status, playbookTitle, workspaceName]
  );
  const smartNudgesPreview = useMemo(
    () =>
      createBrowserSmartNudgesPreview({
        mode: selectedMode.id,
        workspaceName,
        task: agentTaskDraft,
        completedTaskSummary: agentRun?.planSummary
      }),
    [agentRun, agentTaskDraft, selectedMode.id, workspaceName]
  );

  const loadMcpAuditEvents = useCallback(async (): Promise<void> => {
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
    if (!endpointApi?.auditEvents) {
      return;
    }

    try {
      const result = await endpointApi.auditEvents();
      setMcpAuditEvents(result.events);
      setMcpAuditMessage(result.events.length > 0 ? `${result.events.length} 件の audit event を読み込みました。` : "audit event はまだありません。");
    } catch {
      setMcpAuditMessage("Browser MCP audit log を読み込めませんでした。");
    }
  }, []);

  const loadMcpApprovalDecisions = useCallback(async (): Promise<void> => {
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
    if (!endpointApi?.approvalDecisions) {
      return;
    }

    try {
      const result = await endpointApi.approvalDecisions();
      setMcpApprovalDecisions(result.decisions);
    } catch {
      setMcpApprovalDecisions([]);
    }
  }, []);

  const loadSchedulerTasks = useCallback(async (): Promise<void> => {
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!schedulerApi?.listTasks) {
      return;
    }

    try {
      const result = await schedulerApi.listTasks();
      setSavedSchedulerTasks(result.tasks);
      setSchedulerMessage(
        result.tasks.length > 0 ? `${result.tasks.length} 件の schedule task draft を読み込みました。` : "保存済み schedule task draft はありません。"
      );
    } catch {
      setSchedulerMessage("schedule task draft を読み込めませんでした。");
    }
  }, []);

  useEffect(() => {
    let canceled = false;

    async function loadEndpointState(): Promise<void> {
      const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
      if (!endpointApi) {
        return;
      }

      try {
        const state = await endpointApi.status();
        if (!canceled) {
          setMcpEndpointState(state);
        }
      } catch {
        if (!canceled) {
          setMcpEndpointState({
            ...createPreviewBrowserMcpEndpointState(),
            status: "error",
            message: "Browser MCP endpoint status を読み込めませんでした。",
            error: "preload IPC failed"
          });
        }
      }
    }

    void loadEndpointState();
    queueMicrotask(() => {
      void loadMcpAuditEvents();
      void loadMcpApprovalDecisions();
      void loadSchedulerTasks();
    });
    return () => {
      canceled = true;
    };
  }, [loadMcpApprovalDecisions, loadMcpAuditEvents, loadSchedulerTasks]);

  const handleCreatePlan = (): void => {
    setPlannedTask(agentTaskDraft);
    setApprovedStepIds([]);
    setAgentRun(null);
  };

  const handleCreateRunPreview = (approvedIds: string[]): void => {
    setAgentRun(createBrowserAgentRunPreview(agentPlan, approvedIds));
  };

  const handleSelectScheduledTask = (taskId: string): void => {
    setSelectedScheduledTaskId(taskId);
    setSelectedScheduledTaskRunId(null);
  };

  const handleApplyScheduledTaskHistoryCandidate = (): void => {
    const result = applyBrowserScheduledTaskDryRunHistoryCandidatePreview(scheduledTasksPageSource, scheduledTaskDryRunHistoryCandidate);
    if (result.applied) {
      setScheduledTaskHistoryPreviewTasks({
        sourceId: scheduledTasksBaseSourceId,
        tasks: result.tasks
      });
    }
    setScheduledTaskHistoryPreviewMessage(result.reason);
    if (result.sourceTaskId) {
      setSelectedScheduledTaskId(result.sourceTaskId);
    }
    if (result.appendedRunId) {
      setSelectedScheduledTaskRunId(result.appendedRunId);
    }
  };

  const handleClearScheduledTaskHistoryPreview = (): void => {
    setScheduledTaskHistoryPreviewTasks(null);
    setSelectedScheduledTaskRunId(null);
    setScheduledTaskHistoryPreviewMessage("local run history preview をクリアしました。保存済み task draft と scheduler draft は変更していません。");
    setScheduledTaskHistoryStoreMessage("local run history preview はまだ保存されていません。");
  };

  const handlePersistScheduledTaskHistoryPreview = async (): Promise<void> => {
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!scheduledTaskHistoryStoreCommitPreview?.canPersist || !scheduledTaskHistoryStoreCommitPreview.task || !schedulerApi?.saveTask) {
      setScheduledTaskHistoryStoreMessage("local scheduler store に保存できる run history preview はありません。");
      return;
    }

    try {
      const result = await schedulerApi.saveTask(scheduledTaskHistoryStoreCommitPreview.task);
      setSavedSchedulerTasks((current) => [result.task, ...current.filter((item) => item.id !== result.task.id)]);
      setSelectedScheduledTaskId(result.task.id);
      setSelectedScheduledTaskRunId(scheduledTaskHistoryStoreCommitPreview.appendedRunIds[0] ?? result.task.runHistory[0]?.id ?? null);
      setScheduledTaskHistoryPreviewTasks(null);
      setScheduledTaskHistoryStoreMessage(`${result.task.name} の run history preview を local scheduler store に保存しました。`);
      await loadSchedulerTasks();
    } catch {
      setScheduledTaskHistoryStoreMessage("run history preview を local scheduler store に保存できませんでした。");
    }
  };

  const handleConfirmScheduledTaskCaptureSave = (): void => {
    if (!scheduledTaskRunCaptureSaveConfirmation) {
      setScheduledTaskCaptureSaveMessage("確認できる capture preview はありません。");
      return;
    }

    setScheduledTaskCaptureConfirmedId(scheduledTaskRunCaptureSaveConfirmation.id);
    setScheduledTaskCapturePersistStatus("idle");
    setScheduledTaskCaptureKnowledgeStatus("idle");
    setScheduledTaskCapturePersistedDraftId(null);
    setScheduledTaskCapturePersistedCaptureId(null);
    setScheduledTaskCaptureSaveMessage(
      `${scheduledTaskRunCaptureSaveConfirmation.proposedCapture.title} を保存前確認済みにしました。local capture store へ保存できます。`
    );
  };

  const handlePersistScheduledTaskCapture = async (): Promise<void> => {
    if (!scheduledTaskRunCaptureStoreDraft) {
      setScheduledTaskCapturePersistStatus("error");
      setScheduledTaskCaptureSaveMessage("保存できる capture store draft はありません。");
      return;
    }

    if (!scheduledTaskCaptureSaveConfirmed) {
      setScheduledTaskCapturePersistStatus("error");
      setScheduledTaskCaptureSaveMessage("先に capture save confirmation を確認してください。");
      return;
    }

    setScheduledTaskCapturePersistStatus("saving");
    try {
      const result = window.aiLaunchpad?.browserApi?.saveSelection
        ? await window.aiLaunchpad.browserApi.saveSelection(scheduledTaskRunCaptureStoreDraft.payload)
        : createPreviewScheduledTaskCaptureResult(scheduledTaskRunCaptureStoreDraft);

      onScheduledCaptureSaved?.(result.capture);
      setScheduledTaskCapturePersistedDraftId(scheduledTaskRunCaptureStoreDraft.id);
      setScheduledTaskCapturePersistedCaptureId(result.id);
      setScheduledTaskCapturePersistStatus("saved");
      setScheduledTaskCaptureKnowledgeStatus("idle");
      setScheduledTaskCaptureSaveMessage(`${result.capture.title} を local capture store に保存しました。`);
    } catch (error) {
      setScheduledTaskCapturePersistStatus("error");
      setScheduledTaskCaptureSaveMessage(error instanceof Error ? error.message : "local capture store への保存に失敗しました。");
    }
  };

  const handleAddScheduledTaskCaptureToKnowledge = (): void => {
    if (!scheduledTaskRunCaptureKnowledgeDraft) {
      setScheduledTaskCaptureKnowledgeStatus("error");
      setScheduledTaskCaptureSaveMessage("knowledge に追加できる保存済み capture はありません。");
      return;
    }

    onScheduledCaptureAddToKnowledge?.(scheduledTaskRunCaptureKnowledgeDraft.captureId);
    setScheduledTaskCaptureKnowledgeStatus("added");
    setScheduledTaskCaptureSaveMessage(`${scheduledTaskRunCaptureKnowledgeDraft.captureId} を knowledge preview に追加しました。`);
  };

  const handleProbeMcpEndpoint = async (state = mcpEndpointState): Promise<void> => {
    if (state.status !== "running" || !state.healthUrl || !state.streamUrl) {
      setMcpEndpointProbe(createIdleMcpEndpointProbe());
      return;
    }

    setMcpEndpointProbe({
      status: "checking",
      message: "Browser MCP endpoint を確認しています。"
    });

    try {
      const [healthResponse, streamResponse] = await Promise.all([fetch(state.healthUrl), fetch(state.streamUrl)]);
      const healthBody = (await healthResponse.json()) as { ok?: boolean; bridge?: string; transport?: string };
      const streamPreview = await streamResponse.text();

      if (!healthResponse.ok || !streamResponse.ok || healthBody.ok !== true) {
        throw new Error("Browser MCP endpoint health check failed.");
      }

      setMcpEndpointProbe({
        status: "ok",
        message: `${healthBody.bridge ?? "browser-mcp"} / ${healthBody.transport ?? "http"} は応答しています。`,
        checkedAt: new Date().toISOString(),
        streamPreview
      });
      await loadMcpAuditEvents();
    } catch (error) {
      setMcpEndpointProbe({
        status: "error",
        message: error instanceof Error ? error.message : "Browser MCP endpoint を確認できませんでした。"
      });
      await loadMcpAuditEvents();
    }
  };

  const handleStartMcpEndpoint = async (): Promise<void> => {
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
    if (!endpointApi) {
      return;
    }

    setMcpEndpointAction("starting");
    try {
      const nextState = await endpointApi.start({ port: mcpEndpointState.config.port });
      setMcpEndpointState(nextState);
      await handleProbeMcpEndpoint(nextState);
      await loadMcpAuditEvents();
    } finally {
      setMcpEndpointAction("idle");
    }
  };

  const handleStopMcpEndpoint = async (): Promise<void> => {
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
    if (!endpointApi) {
      return;
    }

    setMcpEndpointAction("stopping");
    try {
      setMcpEndpointState(await endpointApi.stop());
      setMcpEndpointProbe(createIdleMcpEndpointProbe());
      await loadMcpAuditEvents();
    } finally {
      setMcpEndpointAction("idle");
    }
  };

  const handleClearMcpAuditEvents = async (): Promise<void> => {
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;
    if (!endpointApi?.clearAuditEvents) {
      return;
    }

    await endpointApi.clearAuditEvents();
    if (endpointApi.clearApprovalDecisions) {
      await endpointApi.clearApprovalDecisions();
    }
    setMcpApprovalDecisions([]);
    await loadMcpAuditEvents();
  };

  const handleToggleMcpApproval = async (auditEventId: string): Promise<void> => {
    const queueItem = mcpApprovalQueue.find((item) => item.auditEventId === auditEventId);
    if (!queueItem) {
      return;
    }

    const nextStatus = queueItem.status === "approved_preview" ? "revoked_preview" : "approved_preview";
    const decision = createBrowserMcpApprovalDecision(queueItem, nextStatus, new Date().toISOString());
    const endpointApi = window.aiLaunchpad?.browserMcpEndpoint;

    if (endpointApi?.saveApprovalDecision) {
      const saved = await endpointApi.saveApprovalDecision(decision);
      setMcpApprovalDecisions((current) => [saved.decision, ...current.filter((item) => item.auditEventId !== saved.decision.auditEventId)]);
      await loadMcpApprovalDecisions();
      return;
    }

    setMcpApprovalDecisions((current) => [decision, ...current.filter((item) => item.auditEventId !== decision.auditEventId)]);
  };

  const handleCreateMcpApprovalRunPreview = (auditEventId: string): void => {
    const queueItem = mcpApprovalQueue.find((item) => item.auditEventId === auditEventId);
    if (!queueItem) {
      return;
    }

    handleSelectMode("agent");
    setAgentRun(queueItem.runPreview);
  };

  const handleSaveSchedulerReadyTask = async (): Promise<void> => {
    const readyTask = scheduleEditorSourceTask?.status === "ready" ? scheduleEditorSourceTask : undefined;
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!readyTask || !schedulerApi?.saveTask) {
      setSchedulerMessage("保存できる ready schedule task draft がありません。");
      return;
    }

    try {
      const result = await schedulerApi.saveTask(readyTask);
      setSavedSchedulerTasks((current) => [result.task, ...current.filter((item) => item.id !== result.task.id)]);
      setSchedulerMessage(`${result.task.name} を local scheduler store に保存しました。`);
      await loadSchedulerTasks();
    } catch {
      setSchedulerMessage("schedule task draft を保存できませんでした。");
    }
  };

  const handleSaveSchedulerReviewDraft = async (): Promise<void> => {
    const reviewDraft = createBrowserScheduleHandoffReviewDraft(scheduleEditorSourceTask);
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!reviewDraft || !schedulerApi?.saveTask) {
      setSchedulerMessage("保存できる handoff review draft がありません。");
      return;
    }

    try {
      const result = await schedulerApi.saveTask(reviewDraft);
      setSavedSchedulerTasks((current) => [result.task, ...current.filter((item) => item.id !== result.task.id)]);
      setSelectedScheduledTaskId(result.task.id);
      setSchedulerMessage(`${result.task.name} を approval 待ちの review draft として local scheduler store に保存しました。`);
      await loadSchedulerTasks();
    } catch {
      setSchedulerMessage("handoff review draft を保存できませんでした。");
    }
  };

  const handleApproveScheduledTaskReviewDraft = async (): Promise<void> => {
    const approvedDraft = createBrowserScheduleApprovedReviewDraft(selectedScheduledTask);
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!approvedDraft || !schedulerApi?.saveTask) {
      setScheduledTaskReviewApprovalMessage("承認できる schedule review draft がありません。");
      return;
    }

    try {
      const result = await schedulerApi.saveTask(approvedDraft);
      setSavedSchedulerTasks((current) => [result.task, ...current.filter((item) => item.id !== result.task.id)]);
      setSelectedScheduledTaskId(result.task.id);
      setScheduleEditorDraftOverride(null);
      setScheduledTaskHistoryPreviewTasks(null);
      setScheduledTaskReviewApprovalMessage(
        `${result.task.name} を承認済み disabled draft として保存しました。enabled 化は Editable Schedule Draft で別途確認します。`
      );
      await loadSchedulerTasks();
    } catch {
      setScheduledTaskReviewApprovalMessage("schedule review draft を承認保存できませんでした。");
    }
  };

  const handleSaveSchedulerEditedTask = async (): Promise<void> => {
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!scheduleEditorSourceTask || !scheduleEditorDraft || !schedulerApi?.saveTask) {
      setSchedulerMessage("保存できる schedule editor draft がありません。");
      return;
    }

    try {
      const editedTask = applyBrowserScheduleCardEdit(scheduleEditorSourceTask, scheduleEditorDraft);
      const result = await schedulerApi.saveTask(editedTask);
      setSavedSchedulerTasks((current) => [result.task, ...current.filter((item) => item.id !== result.task.id)]);
      setSchedulerMessage(`${result.task.name} の編集内容を local scheduler store に保存しました。`);
      await loadSchedulerTasks();
    } catch {
      setSchedulerMessage("schedule editor draft を保存できませんでした。");
    }
  };

  const handleClearSchedulerTasks = async (): Promise<void> => {
    const schedulerApi = window.aiLaunchpad?.schedulerRegistry;
    if (!schedulerApi?.clearTasks) {
      return;
    }

    await schedulerApi.clearTasks();
    setSavedSchedulerTasks([]);
    await loadSchedulerTasks();
  };

  const handleCopyMcpText = async (value: string, label: string): Promise<void> => {
    if (!navigator.clipboard) {
      setMcpEndpointCopyStatus("コピーできませんでした");
      return;
    }

    await navigator.clipboard.writeText(value);
    setMcpEndpointCopyStatus(`${label} をコピーしました`);
    window.setTimeout(() => setMcpEndpointCopyStatus(""), 1400);
  };

  return (
    <section className="mt-5 rounded-md border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agentic Browser OS Layer</p>
          </div>
          <h2 className="mt-1 text-base font-semibold text-slate-950">BrowserOS 型機能の clean-room 実装トラック</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            既存 Browser Client を土台に、Chat、Agent、Workflow、Schedule、Memory、MCP を Oracle enterprise AI 向けに再設計します。
          </p>
        </div>
        <div className="grid min-w-[360px] grid-cols-2 gap-2">
          {capabilitySignals.map((signal) => (
            <div key={signal.label} className={cn("rounded-md border px-3 py-2", toneStyles[signal.tone])}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75">{signal.label}</p>
              <p className="mt-0.5 text-sm font-semibold">{signal.value}</p>
              <p className="mt-1 text-[11px] leading-4 opacity-80">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2" role="tablist" aria-label="Agentic browser modes">
        {agenticModes.map((mode) => {
          const ModeIcon = modeIcons[mode.id];
          const active = mode.id === selectedMode.id;

          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelectMode(mode.id)}
              className={cn(
                "flex h-[72px] cursor-pointer flex-col items-start justify-between rounded-md border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                active ? "border-slate-900 bg-slate-900 text-white" : "border-border bg-slate-50 text-slate-700 hover:bg-white"
              )}
            >
              <ModeIcon aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-semibold">{mode.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-4">
        <div className="rounded-md border border-border bg-slate-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <SelectedIcon aria-hidden="true" className="h-4 w-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-slate-950">{selectedMode.label}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedMode.summary}</p>
            </div>
            <span className={cn("shrink-0 rounded-md border px-2 py-1 text-xs font-semibold", toneStyles[selectedMode.tone])}>
              {selectedMode.stateLabel}
            </span>
          </div>

          <div className="mt-4 rounded-md border border-sky-100 bg-white p-3">
            <div className="flex items-start gap-2">
              <BrainCircuit aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
              <p className="text-sm leading-6 text-slate-700">{selectedMode.oracleAdaptation}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ModeList icon={ListChecks} title="Pipeline" items={selectedMode.pipeline} />
            <div className="grid grid-cols-2 gap-3">
              <ModeList icon={ShieldCheck} title="Safety" items={selectedMode.safeguards} />
              <ModeList icon={CircleDot} title="Next cuts" items={selectedMode.nextCuts} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <WorkflowGraphDraftPanel draft={workflowGraphDraft} />

          <div className="space-y-4">
            {selectedMode.id === "chat" ? (
              <ChatHubPreviewPanel
                panel={browserChatPanelPreview}
                hub={browserHubComparisonPreview}
                onSelectProvider={handleSelectChatProvider}
                onPaneCountChange={setChatHubPaneCount}
                onAttachScreenshot={() => setChatScreenshotAttached(true)}
                onReset={() => setChatScreenshotAttached(false)}
              />
            ) : null}
            {selectedMode.id === "memory" ? (
              <>
                <MemoryPreviewPanel preview={browserMemoryPreview} query={memoryQuery} onQueryChange={setMemoryQuery} />
                <AgentSoulPreviewPanel
                  preview={browserSoulPreview}
                  instructionDraft={soulInstructionDraft}
                  onInstructionDraftChange={setSoulInstructionDraft}
                />
                <BrowserSkillsCatalogPanel preview={browserSkillsCatalogPreview} />
              </>
            ) : null}
            {selectedMode.id === "mcp" ? <ConnectAppsPreviewPanel preview={browserAppConnectorsPreview} /> : null}
            <SmartNudgesPreviewPanel preview={smartNudgesPreview} />
            {selectedMode.id === "agent" ? <CoworkPreviewPanel preview={browserCoworkPreview} /> : null}
            <AgentPlanPreview
              plan={agentPlan}
              task={agentTaskDraft}
              approvedStepIds={approvedStepIds}
              run={agentRun}
              onTaskChange={setAgentTaskDraft}
              onApprovedStepIdsChange={setApprovedStepIds}
              onCreatePlan={handleCreatePlan}
              onCreateRun={handleCreateRunPreview}
            />
            <MiniListPanel icon={Wrench} title="Browser Tool Catalog" items={browserToolCatalogItems} />
            <ToolInvocationPanel examples={browserToolInvocationExamples} />
            <ToolExecutorPanel executions={browserToolExecutionExamples} />
            <McpProtocolPanel responses={browserMcpProtocolExamples} />
            <McpEndpointSettingsPanel
              state={mcpEndpointState}
              endpointUrl={mcpEndpointUrl}
              clientOnboardingPreview={mcpClientOnboardingPreview}
              commands={mcpClientCommands}
              probe={mcpEndpointProbe}
              auditEvents={mcpAuditEvents}
              auditMessage={mcpAuditMessage}
              approvalQueue={mcpApprovalQueue}
              executionConfirmation={mcpExecutionConfirmation}
              approvalDecisions={mcpApprovalDecisions}
              runHistory={mcpRunHistory}
              schedulerPreview={schedulerPreview}
              scheduleSuggestionCard={scheduleSuggestionCard}
              scheduleHandoffReview={scheduleHandoffReview}
              scheduleEditorDraft={scheduleEditorDraft}
              scheduleEditorSourceTask={scheduleEditorSourceTask}
              savedSchedulerTasks={savedSchedulerTasks}
              savedScheduleTaskDetail={savedScheduleTaskDetail}
              scheduledTasksPagePreview={scheduledTasksPagePreview}
              scheduledTaskManualRunConfirmation={scheduledTaskManualRunConfirmation}
              scheduledTaskReviewApprovalPreview={scheduledTaskReviewApprovalPreview}
              scheduledTaskBackgroundRunPreview={scheduledTaskBackgroundRunPreview}
              scheduledTaskDryRunHistoryCandidate={scheduledTaskDryRunHistoryCandidate}
              scheduledTaskHistoryStoreCommitPreview={scheduledTaskHistoryStoreCommitPreview}
              scheduledTaskNewTabInboxPreview={scheduledTaskNewTabInboxPreview}
              scheduledTaskNewTabResultPreview={scheduledTaskNewTabResultPreview}
              scheduledTaskNewTabResultStackPreview={scheduledTaskNewTabResultStackPreview}
              scheduledTaskRunOutputPreview={scheduledTaskRunOutputPreview}
              scheduledTaskRunCapturePreview={scheduledTaskRunCapturePreview}
              scheduledTaskRunCaptureSaveConfirmation={scheduledTaskRunCaptureSaveConfirmation}
              scheduledTaskRunCaptureStoreDraft={scheduledTaskRunCaptureStoreDraft}
              scheduledTaskRunCaptureKnowledgeDraft={scheduledTaskRunCaptureKnowledgeDraft}
              scheduledTaskHistoryPreviewMessage={scheduledTaskHistoryPreviewMessage}
              scheduledTaskHistoryStoreMessage={scheduledTaskHistoryStoreMessage}
              scheduledTaskHistoryPreviewActive={scheduledTaskHistoryPreviewActive}
              scheduledTaskCaptureSaveMessage={scheduledTaskCaptureSaveMessage}
              scheduledTaskCaptureSaveConfirmed={scheduledTaskCaptureSaveConfirmed}
              scheduledTaskCapturePersistStatus={scheduledTaskCapturePersistStatus}
              scheduledTaskCapturePersisted={scheduledTaskCapturePersisted}
              scheduledTaskCaptureKnowledgeStatus={scheduledTaskCaptureKnowledgeStatus}
              scheduledTaskReviewApprovalMessage={scheduledTaskReviewApprovalMessage}
              schedulerMessage={schedulerMessage}
              copyStatus={mcpEndpointCopyStatus}
              action={mcpEndpointAction}
              canControl={hasBrowserMcpEndpointApi}
              canPersistScheduler={hasSchedulerRegistryApi}
              onStart={handleStartMcpEndpoint}
              onStop={handleStopMcpEndpoint}
              onProbe={() => handleProbeMcpEndpoint()}
              onRefreshAudit={loadMcpAuditEvents}
              onClearAudit={handleClearMcpAuditEvents}
              onToggleApproval={handleToggleMcpApproval}
              onCreateApprovalRun={handleCreateMcpApprovalRunPreview}
              onSaveSchedulerReady={handleSaveSchedulerReadyTask}
              onSaveSchedulerReviewDraft={handleSaveSchedulerReviewDraft}
              onSaveSchedulerEdited={handleSaveSchedulerEditedTask}
              onScheduleEditorDraftChange={setScheduleEditorDraftOverride}
              onSelectScheduledTask={handleSelectScheduledTask}
              onSelectScheduledTaskAction={setSelectedScheduledTaskActionId}
              onSelectScheduledTaskRun={setSelectedScheduledTaskRunId}
              onApproveScheduledTaskReviewDraft={handleApproveScheduledTaskReviewDraft}
              onApplyScheduledTaskHistoryCandidate={handleApplyScheduledTaskHistoryCandidate}
              onClearScheduledTaskHistoryPreview={handleClearScheduledTaskHistoryPreview}
              onPersistScheduledTaskHistoryPreview={handlePersistScheduledTaskHistoryPreview}
              onConfirmScheduledTaskCaptureSave={handleConfirmScheduledTaskCaptureSave}
              onPersistScheduledTaskCapture={handlePersistScheduledTaskCapture}
              onAddScheduledTaskCaptureToKnowledge={handleAddScheduledTaskCaptureToKnowledge}
              onClearSchedulerTasks={handleClearSchedulerTasks}
              onCopy={handleCopyMcpText}
            />
            <MiniListPanel icon={Network} title="MCP / App Connectors" items={connectorBlueprints.map(formatConnector)} />
            <MiniListPanel icon={Calendar} title="Scheduled Tasks" items={scheduledTaskBlueprints.map(formatScheduledTask)} />
          </div>
        </div>
      </div>
    </section>
  );
}

const stepToneStyles: Record<BrowserAgentPlan["steps"][number]["risk"], string> = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const runStatusStyles: Record<BrowserAgentRun["status"], string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_approval: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const reviewDecisionToneStyles: Record<BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview["recommendedDecision"]["tone"], string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  muted: "border-slate-200 bg-slate-100 text-slate-600"
};

const runStepStatusStyles: Record<BrowserAgentRun["steps"][number]["status"], string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  approved: "border-sky-200 bg-sky-50 text-sky-800",
  skipped: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const chatProviderStatusStyles: Record<BrowserChatPanelPreview["providers"][number]["status"], string> = {
  default: "border-sky-200 bg-sky-50 text-sky-800",
  grounding: "border-violet-200 bg-violet-50 text-violet-800",
  fallback: "border-slate-200 bg-slate-50 text-slate-700"
};

const chatContextStateStyles: Record<BrowserChatPanelPreview["contextItems"][number]["state"], string> = {
  included: "border-emerald-200 bg-emerald-50 text-emerald-800",
  available: "border-sky-200 bg-sky-50 text-sky-800",
  missing: "border-slate-200 bg-slate-100 text-slate-600"
};

const hubPaneStatusStyles: Record<BrowserHubComparisonPreview["panes"][number]["status"], string> = {
  ready: "border-sky-200 bg-sky-50 text-sky-800",
  grounded: "border-violet-200 bg-violet-50 text-violet-800",
  local_only: "border-slate-200 bg-slate-50 text-slate-700"
};

const hubResponseStateStyles: Record<BrowserHubComparisonPreview["panes"][number]["responseState"], string> = {
  preview_ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_evidence: "border-amber-200 bg-amber-50 text-amber-800",
  local_only: "border-slate-200 bg-slate-50 text-slate-700"
};

const appConnectorStatusStyles: Record<BrowserAppConnector["status"], string> = {
  connected: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_auth: "border-sky-200 bg-sky-50 text-sky-800",
  manual_fallback: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const appConnectorCategoryStyles: Record<BrowserAppConnector["category"], string> = {
  ai: "border-cyan-200 bg-cyan-50 text-cyan-800",
  database: "border-violet-200 bg-violet-50 text-violet-800",
  storage: "border-slate-200 bg-slate-50 text-slate-700",
  browser: "border-emerald-200 bg-emerald-50 text-emerald-800",
  business: "border-amber-200 bg-amber-50 text-amber-800"
};

const appConnectorScopeStyles: Record<BrowserAppConnector["scopes"][number]["decision"], string> = {
  allowed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review_required: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const smartNudgeTypeStyles: Record<BrowserSmartNudgeCard["type"], string> = {
  app_connection: "border-sky-200 bg-sky-50 text-sky-800",
  schedule_suggestion: "border-emerald-200 bg-emerald-50 text-emerald-800"
};

const soulSectionStyles: Record<BrowserSoulSection["id"], string> = {
  personality: "border-sky-200 bg-sky-50 text-sky-800",
  communication: "border-violet-200 bg-violet-50 text-violet-800",
  boundaries: "border-amber-200 bg-amber-50 text-amber-800",
  preferences: "border-emerald-200 bg-emerald-50 text-emerald-800"
};

const skillCategoryStyles: Record<BrowserSkillDefinition["category"], string> = {
  research: "border-sky-200 bg-sky-50 text-sky-800",
  sales: "border-amber-200 bg-amber-50 text-amber-800",
  rag: "border-emerald-200 bg-emerald-50 text-emerald-800",
  browser: "border-violet-200 bg-violet-50 text-violet-800",
  safety: "border-rose-200 bg-rose-50 text-rose-800"
};

const skillStatusStyles: Record<BrowserSkillDefinition["status"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  available: "border-slate-200 bg-slate-50 text-slate-700",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800"
};

const skillRiskStyles: Record<BrowserSkillDefinition["risk"], string> = {
  safe: "border-emerald-200 bg-white text-emerald-800",
  review: "border-amber-200 bg-white text-amber-800"
};

const memoryEntryStatusStyles: Record<BrowserMemoryEntry["status"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  candidate: "border-amber-200 bg-amber-50 text-amber-800",
  expires: "border-slate-200 bg-slate-50 text-slate-700"
};

const newTabTraceStatusStyles: Record<BrowserScheduledTaskNewTabTracePreview["nodes"][number]["status"], string> = {
  current: "border-sky-300 bg-sky-50 text-sky-900",
  available: "border-slate-200 bg-white text-slate-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  locked: "border-slate-200 bg-slate-100 text-slate-500"
};

const backgroundRunStageStatusStyles: Record<BrowserScheduledTaskBackgroundRunPreview["stages"][number]["status"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  waiting: "border-slate-200 bg-slate-50 text-slate-700",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const mcpClientOnboardingStatusStyles: Record<BrowserMcpClientOnboardingPreview["clients"][number]["status"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  endpoint_stopped: "border-slate-200 bg-slate-100 text-slate-600",
  copy_required: "border-sky-200 bg-sky-50 text-sky-800",
  review_required: "border-amber-200 bg-amber-50 text-amber-800"
};

const mcpClientToolScopeStyles: Record<BrowserMcpClientOnboardingPreview["toolCategories"][number]["scope"], string> = {
  read: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800"
};

const eventLevelStyles: Record<BrowserAgentRun["events"][number]["level"], string> = {
  info: "text-slate-600",
  approval: "text-amber-700",
  blocked: "text-rose-700"
};

const invocationStatusStyles: Record<BrowserToolInvocationPreview["draft"]["status"], string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  waiting_approval: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-sky-200 bg-sky-50 text-sky-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800",
  unknown_tool: "border-rose-200 bg-rose-50 text-rose-800"
};

const executionStatusStyles: Record<BrowserToolExecutionPreview["status"], string> = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  waiting_approval: "border-amber-200 bg-amber-50 text-amber-800",
  blocked: "border-rose-200 bg-rose-50 text-rose-800",
  unknown_tool: "border-rose-200 bg-rose-50 text-rose-800"
};

const endpointStatusStyles: Record<BrowserMcpEndpointState["status"], string> = {
  stopped: "border-slate-200 bg-slate-50 text-slate-700",
  starting: "border-sky-200 bg-sky-50 text-sky-800",
  running: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800"
};

function AgentPlanPreview({
  plan,
  task,
  approvedStepIds,
  run,
  onTaskChange,
  onApprovedStepIdsChange,
  onCreatePlan,
  onCreateRun
}: {
  plan: BrowserAgentPlan;
  task: string;
  approvedStepIds: string[];
  run: BrowserAgentRun | null;
  onTaskChange: (value: string) => void;
  onApprovedStepIdsChange: (value: string[]) => void;
  onCreatePlan: () => void;
  onCreateRun: (approvedStepIds: string[]) => void;
}): ReactElement {
  const approvalSteps = plan.steps.filter((step) => step.approval === "required");
  const approvedSet = new Set(approvedStepIds);
  const approvedCount = approvalSteps.filter((step) => approvedSet.has(step.id)).length;

  const handleToggleApproval = (stepId: string, checked: boolean): void => {
    if (checked) {
      onApprovedStepIdsChange([...approvedSet, stepId]);
      return;
    }

    onApprovedStepIdsChange(approvedStepIds.filter((id) => id !== stepId));
  };

  const handleApproveAll = (): void => {
    onApprovedStepIdsChange(approvalSteps.map((step) => step.id));
  };

  const handleClearApprovals = (): void => {
    onApprovedStepIdsChange([]);
  };

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <h3 className="text-sm font-semibold text-slate-950">Agent Plan Preview</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">Browser action は approval gate を通して dry-run plan に変換します。</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <SummaryBadge label="safe" value={plan.approvalSummary.safe} tone="safe" />
          <SummaryBadge label="review" value={plan.approvalSummary.review} tone="review" />
          <SummaryBadge label="blocked" value={plan.approvalSummary.blocked} tone="blocked" />
        </div>
      </div>

      <label htmlFor="agent-task" className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        Task
      </label>
      <textarea
        id="agent-task"
        value={task}
        onChange={(event) => onTaskChange(event.target.value)}
        rows={3}
        className="mt-2 w-full resize-none rounded-md border border-input bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
      />
      <button
        type="button"
        onClick={onCreatePlan}
        className="mt-2 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
      >
        <Bot aria-hidden="true" className="h-4 w-4" />
        Plan
      </button>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
        <p className="mt-1 text-xs leading-5 text-slate-700">{plan.summary}</p>
      </div>

      <ol className="mt-3 space-y-2">
        {plan.steps.map((step) => (
          <li key={step.id} className="rounded-md border border-border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sky-800">Step {step.order}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{step.title}</p>
              </div>
              <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", stepToneStyles[step.risk])}>
                {step.approval === "required" ? "approval" : step.approval}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{step.action.description}</p>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">{step.rationale}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History aria-hidden="true" className="h-4 w-4 text-sky-700" />
              <h4 className="text-sm font-semibold text-slate-950">Run History Dry-run</h4>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              承認済み step だけを含めた local preview event を生成します。実ブラウザ操作や OCI 送信は行いません。
            </p>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            approved {approvedCount}/{approvalSteps.length}
          </span>
        </div>

        {approvalSteps.length > 0 ? (
          <div className="mt-3 space-y-2">
            {approvalSteps.map((step) => (
              <label
                key={step.id}
                htmlFor={`approval-${step.id}`}
                className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"
              >
                <input
                  id={`approval-${step.id}`}
                  type="checkbox"
                  checked={approvedSet.has(step.id)}
                  onChange={(event) => handleToggleApproval(step.id, event.target.checked)}
                  className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-sky-700 focus:ring-sky-700"
                />
                <span>
                  <span className="font-semibold text-slate-900">{step.action.label}</span> - {step.rationale}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-slate-600">この plan には追加承認が必要な step はありません。</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleApproveAll}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          >
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
            Approve all
          </button>
          <button
            type="button"
            onClick={handleClearApprovals}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onCreateRun(approvedStepIds)}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-sky-700 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          >
            <Play aria-hidden="true" className="h-3.5 w-3.5" />
            Dry-run
          </button>
        </div>

        {run ? <AgentRunPreview run={run} /> : null}
      </div>
    </div>
  );
}

function AgentRunPreview({ run }: { run: BrowserAgentRun }): ReactElement {
  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest run</p>
        <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", runStatusStyles[run.status])}>
          {run.status}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        {run.id} / events {run.events.length}
      </p>
      <ul className="mt-3 space-y-2">
        {run.events.slice(0, 6).map((event) => (
          <li key={event.id} className={cn("text-xs leading-5", eventLevelStyles[event.level])}>
            {event.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolInvocationPanel({ examples }: { examples: BrowserToolInvocationPreview[] }): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-sky-700" />
        <h3 className="text-sm font-semibold text-slate-950">Tool Invocation Preview</h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        catalog tool は invocation draft と audit event に変換してから executor に渡します。
      </p>
      <div className="mt-3 space-y-2">
        {examples.map((preview) => (
          <div key={preview.draft.id} className="rounded-md border border-border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{preview.draft.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {preview.draft.compatibleName} / {preview.draft.requestedBy}
                </p>
              </div>
              <span
                className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", invocationStatusStyles[preview.draft.status])}
              >
                {preview.draft.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{preview.events[0]?.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolExecutorPanel({ executions }: { executions: BrowserToolExecutionPreview[] }): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <Play aria-hidden="true" className="h-4 w-4 text-sky-700" />
        <h3 className="text-sm font-semibold text-slate-950">Local Executor Dry-run</h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        executor は read-only tool だけを dry-run completed とし、approval / blocked は audit に残して停止します。
      </p>
      <div className="mt-3 space-y-2">
        {executions.map((execution) => (
          <div key={execution.id} className="rounded-md border border-border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{execution.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {execution.compatibleName} / {execution.mode}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", executionStatusStyles[execution.status])}>
                {execution.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{execution.output.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function McpProtocolPanel({ responses }: { responses: BrowserMcpResponse[] }): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <Network aria-hidden="true" className="h-4 w-4 text-sky-700" />
        <h3 className="text-sm font-semibold text-slate-950">MCP Protocol Preview</h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        endpoint 実装前に tools/list と tools/call の response contract を固定します。
      </p>
      <div className="mt-3 space-y-2">
        {responses.map((response) => (
          <div key={response.id} className="rounded-md border border-border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{response.method}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{formatMcpResponseSummary(response)}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold",
                  response.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
                )}
              >
                {response.ok ? "ok" : response.error.code}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function McpEndpointSettingsPanel({
  state,
  endpointUrl,
  clientOnboardingPreview,
  commands,
  probe,
  auditEvents,
  auditMessage,
  approvalQueue,
  executionConfirmation,
  approvalDecisions,
  runHistory,
  schedulerPreview,
  scheduleSuggestionCard,
  scheduleHandoffReview,
  scheduleEditorDraft,
  scheduleEditorSourceTask,
  savedSchedulerTasks,
  savedScheduleTaskDetail,
  scheduledTasksPagePreview,
  scheduledTaskManualRunConfirmation,
  scheduledTaskReviewApprovalPreview,
  scheduledTaskBackgroundRunPreview,
  scheduledTaskDryRunHistoryCandidate,
  scheduledTaskHistoryStoreCommitPreview,
  scheduledTaskNewTabInboxPreview,
  scheduledTaskNewTabResultPreview,
  scheduledTaskNewTabResultStackPreview,
  scheduledTaskRunOutputPreview,
  scheduledTaskRunCapturePreview,
  scheduledTaskRunCaptureSaveConfirmation,
  scheduledTaskRunCaptureStoreDraft,
  scheduledTaskRunCaptureKnowledgeDraft,
  scheduledTaskHistoryPreviewMessage,
  scheduledTaskHistoryStoreMessage,
  scheduledTaskHistoryPreviewActive,
  scheduledTaskCaptureSaveMessage,
  scheduledTaskCaptureSaveConfirmed,
  scheduledTaskCapturePersistStatus,
  scheduledTaskCapturePersisted,
  scheduledTaskCaptureKnowledgeStatus,
  scheduledTaskReviewApprovalMessage,
  schedulerMessage,
  copyStatus,
  action,
  canControl,
  canPersistScheduler,
  onStart,
  onStop,
  onProbe,
  onRefreshAudit,
  onClearAudit,
  onToggleApproval,
  onCreateApprovalRun,
  onSaveSchedulerReady,
  onSaveSchedulerReviewDraft,
  onSaveSchedulerEdited,
  onScheduleEditorDraftChange,
  onSelectScheduledTask,
  onSelectScheduledTaskAction,
  onSelectScheduledTaskRun,
  onApproveScheduledTaskReviewDraft,
  onApplyScheduledTaskHistoryCandidate,
  onClearScheduledTaskHistoryPreview,
  onPersistScheduledTaskHistoryPreview,
  onConfirmScheduledTaskCaptureSave,
  onPersistScheduledTaskCapture,
  onAddScheduledTaskCaptureToKnowledge,
  onClearSchedulerTasks,
  onCopy
}: {
  state: BrowserMcpEndpointState;
  endpointUrl: string;
  clientOnboardingPreview: BrowserMcpClientOnboardingPreview;
  commands: BrowserMcpClientCommand[];
  probe: McpEndpointProbeState;
  auditEvents: BrowserMcpAuditEvent[];
  auditMessage: string;
  approvalQueue: BrowserMcpApprovalQueueItem[];
  executionConfirmation: BrowserMcpExecutionConfirmation | null;
  approvalDecisions: BrowserMcpApprovalDecision[];
  runHistory: BrowserMcpRunHistoryEntry[];
  schedulerPreview: BrowserSchedulerRegistryPreview;
  scheduleSuggestionCard: BrowserScheduleSuggestionCard | null;
  scheduleHandoffReview: BrowserScheduleHandoffReview | null;
  scheduleEditorDraft: BrowserScheduleCardEditDraft | null;
  scheduleEditorSourceTask: BrowserSchedulerTaskDraft | undefined;
  savedSchedulerTasks: BrowserSchedulerTaskDraft[];
  savedScheduleTaskDetail: BrowserSavedScheduleTaskDetail | null;
  scheduledTasksPagePreview: BrowserScheduledTasksPagePreview;
  scheduledTaskManualRunConfirmation: BrowserScheduledTaskManualRunConfirmation | null;
  scheduledTaskReviewApprovalPreview: BrowserScheduleReviewApprovalPreview | null;
  scheduledTaskBackgroundRunPreview: BrowserScheduledTaskBackgroundRunPreview | null;
  scheduledTaskDryRunHistoryCandidate: BrowserScheduledTaskDryRunHistoryCandidate | null;
  scheduledTaskHistoryStoreCommitPreview: BrowserScheduledTaskHistoryStoreCommitPreview | null;
  scheduledTaskNewTabInboxPreview: BrowserScheduledTaskNewTabInboxPreview;
  scheduledTaskNewTabResultPreview: BrowserScheduledTaskNewTabResultPreview | null;
  scheduledTaskNewTabResultStackPreview: BrowserScheduledTaskNewTabResultStackPreview | null;
  scheduledTaskRunOutputPreview: BrowserScheduledTaskRunOutputPreview | null;
  scheduledTaskRunCapturePreview: BrowserScheduledTaskRunCapturePreview | null;
  scheduledTaskRunCaptureSaveConfirmation: BrowserScheduledTaskRunCaptureSaveConfirmation | null;
  scheduledTaskRunCaptureStoreDraft: BrowserScheduledTaskRunCaptureStoreDraft | null;
  scheduledTaskRunCaptureKnowledgeDraft: BrowserScheduledTaskRunCaptureKnowledgeDraft | null;
  scheduledTaskHistoryPreviewMessage: string;
  scheduledTaskHistoryStoreMessage: string;
  scheduledTaskHistoryPreviewActive: boolean;
  scheduledTaskCaptureSaveMessage: string;
  scheduledTaskCaptureSaveConfirmed: boolean;
  scheduledTaskCapturePersistStatus: ScheduledTaskCapturePersistStatus;
  scheduledTaskCapturePersisted: boolean;
  scheduledTaskCaptureKnowledgeStatus: ScheduledTaskCaptureKnowledgeStatus;
  scheduledTaskReviewApprovalMessage: string;
  schedulerMessage: string;
  copyStatus: string;
  action: "idle" | "starting" | "stopping";
  canControl: boolean;
  canPersistScheduler: boolean;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onProbe: () => Promise<void>;
  onRefreshAudit: () => Promise<void>;
  onClearAudit: () => Promise<void>;
  onToggleApproval: (auditEventId: string) => Promise<void>;
  onCreateApprovalRun: (auditEventId: string) => void;
  onSaveSchedulerReady: () => Promise<void>;
  onSaveSchedulerReviewDraft: () => Promise<void>;
  onSaveSchedulerEdited: () => Promise<void>;
  onScheduleEditorDraftChange: (draft: BrowserScheduleCardEditDraft | null) => void;
  onSelectScheduledTask: (taskId: string) => void;
  onSelectScheduledTaskAction: (actionId: BrowserScheduledTaskPreviewAction["id"]) => void;
  onSelectScheduledTaskRun: (runId: string) => void;
  onApproveScheduledTaskReviewDraft: () => Promise<void>;
  onApplyScheduledTaskHistoryCandidate: () => void;
  onClearScheduledTaskHistoryPreview: () => void;
  onPersistScheduledTaskHistoryPreview: () => Promise<void>;
  onConfirmScheduledTaskCaptureSave: () => void;
  onPersistScheduledTaskCapture: () => Promise<void>;
  onAddScheduledTaskCaptureToKnowledge: () => void;
  onClearSchedulerTasks: () => Promise<void>;
  onCopy: (value: string, label: string) => Promise<void>;
}): ReactElement {
  const startDisabled = !canControl || action !== "idle" || state.status === "running";
  const stopDisabled = !canControl || action !== "idle" || state.status !== "running";
  const probeDisabled = state.status !== "running" || probe.status === "checking";
  const guardedExecutionEvents = auditEvents.filter(
    (event) =>
      event.kind === "mcp_request" &&
      event.approvalDecisionStatus === "approved_preview" &&
      event.executionStatus === "completed"
  );

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Plug aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <h3 className="text-sm font-semibold text-slate-950">MCP Endpoint Settings</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{state.message}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", endpointStatusStyles[state.status])}>
          {state.status}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs leading-5 text-slate-600">
        <div className="min-w-0 rounded-md border border-border bg-slate-50 p-2">
          <dt className="font-semibold text-slate-500">Host</dt>
          <dd className="mt-1 truncate font-medium text-slate-900">{state.config.host}</dd>
        </div>
        <div className="min-w-0 rounded-md border border-border bg-slate-50 p-2">
          <dt className="font-semibold text-slate-500">Port</dt>
          <dd className="mt-1 truncate font-medium text-slate-900">{state.config.port}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Endpoint URL</p>
            <p className="mt-1 break-all font-mono text-xs leading-5 text-slate-900">{endpointUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => void onCopy(endpointUrl, "URL")}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          >
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
        {state.healthUrl ? <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-500">{state.healthUrl}</p> : null}
        {state.streamUrl ? <p className="mt-1 break-all font-mono text-[11px] leading-5 text-slate-500">{state.streamUrl}</p> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={startDisabled}
          onClick={() => void onStart()}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-sky-700 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <Power aria-hidden="true" className="h-3.5 w-3.5" />
          {action === "starting" ? "Starting" : "Start"}
        </button>
        <button
          type="button"
          disabled={stopDisabled}
          onClick={() => void onStop()}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <Square aria-hidden="true" className="h-3.5 w-3.5" />
          {action === "stopping" ? "Stopping" : "Stop"}
        </button>
        <button
          type="button"
          disabled={probeDisabled}
          onClick={() => void onProbe()}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          {probe.status === "checking" ? "Checking" : "Ping"}
        </button>
        {!canControl ? (
          <span className="inline-flex h-8 items-center rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800">
            Electron IPC required
          </span>
        ) : null}
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Probe</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{probe.message}</p>
          </div>
          <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", probeToneClassName(probe.status))}>
            {probe.status}
          </span>
        </div>
        {probe.checkedAt ? <p className="mt-2 text-[11px] leading-5 text-slate-500">Checked {probe.checkedAt}</p> : null}
        {probe.streamPreview ? (
          <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-slate-950 p-2 text-[11px] leading-5 text-slate-100">
            <code>{probe.streamPreview}</code>
          </pre>
        ) : null}
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileClock aria-hidden="true" className="h-4 w-4 text-sky-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit Log</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{auditMessage}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => void onRefreshAudit()}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void onClearAudit()}
              className="inline-flex h-8 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {auditEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="grid grid-cols-[minmax(84px,0.55fr)_minmax(0,1fr)_auto] gap-2 rounded-md border border-border bg-slate-50 p-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950">{event.kind}</p>
                <p className="mt-1 truncate text-[11px] leading-4 text-slate-500">{formatAuditEventTime(event.occurredAt)}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs leading-5 text-slate-700">{formatAuditEventSummary(event)}</p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{event.sessionId ?? "no-session"}</p>
              </div>
              <span className={cn("h-fit rounded-md border px-2 py-1 text-[11px] font-semibold", auditStatusClassName(event.status))}>
                {event.status}
              </span>
            </div>
          ))}
          {auditEvents.length === 0 ? <p className="text-xs leading-5 text-slate-600">audit event はまだありません。</p> : null}
        </div>
      </div>

      <McpApprovalQueuePanel queue={approvalQueue} onToggleApproval={onToggleApproval} />
      <McpExecutionConfirmationPanel
        confirmation={executionConfirmation}
        decisions={approvalDecisions}
        onToggleApproval={onToggleApproval}
        onCreateRun={onCreateApprovalRun}
      />
      <McpGuardedExecutionPanel events={guardedExecutionEvents} />
      <McpRunHistoryPanel entries={runHistory} />
      <McpSchedulerRegistryPanel
        preview={schedulerPreview}
        sourceTask={scheduleEditorSourceTask}
        suggestionCard={scheduleSuggestionCard}
        handoffReview={scheduleHandoffReview}
        editorDraft={scheduleEditorDraft}
        savedTasks={savedSchedulerTasks}
        savedTaskDetail={savedScheduleTaskDetail}
        message={schedulerMessage}
        canPersist={canPersistScheduler}
        onSaveReady={onSaveSchedulerReady}
        onSaveReviewDraft={onSaveSchedulerReviewDraft}
        onSaveEdited={onSaveSchedulerEdited}
        onEditorDraftChange={onScheduleEditorDraftChange}
        onClearSaved={onClearSchedulerTasks}
      />
      <ScheduledTasksManagerPanel
        preview={scheduledTasksPagePreview}
        confirmation={scheduledTaskManualRunConfirmation}
        reviewApprovalPreview={scheduledTaskReviewApprovalPreview}
        backgroundRunPreview={scheduledTaskBackgroundRunPreview}
        historyCandidate={scheduledTaskDryRunHistoryCandidate}
        historyStoreCommitPreview={scheduledTaskHistoryStoreCommitPreview}
        newTabInboxPreview={scheduledTaskNewTabInboxPreview}
        newTabResultPreview={scheduledTaskNewTabResultPreview}
        newTabResultStackPreview={scheduledTaskNewTabResultStackPreview}
        runOutputPreview={scheduledTaskRunOutputPreview}
        runCapturePreview={scheduledTaskRunCapturePreview}
        captureSaveConfirmation={scheduledTaskRunCaptureSaveConfirmation}
        captureStoreDraft={scheduledTaskRunCaptureStoreDraft}
        captureKnowledgeDraft={scheduledTaskRunCaptureKnowledgeDraft}
        historyPreviewMessage={scheduledTaskHistoryPreviewMessage}
        historyStoreMessage={scheduledTaskHistoryStoreMessage}
        historyPreviewActive={scheduledTaskHistoryPreviewActive}
        captureSaveMessage={scheduledTaskCaptureSaveMessage}
        captureSaveConfirmed={scheduledTaskCaptureSaveConfirmed}
        capturePersistStatus={scheduledTaskCapturePersistStatus}
        capturePersisted={scheduledTaskCapturePersisted}
        captureKnowledgeStatus={scheduledTaskCaptureKnowledgeStatus}
        reviewApprovalMessage={scheduledTaskReviewApprovalMessage}
        canPersist={canPersistScheduler}
        onSelectTask={onSelectScheduledTask}
        onSelectAction={onSelectScheduledTaskAction}
        onSelectRun={onSelectScheduledTaskRun}
        onApproveReviewDraft={onApproveScheduledTaskReviewDraft}
        onAppendHistoryCandidate={onApplyScheduledTaskHistoryCandidate}
        onClearHistoryPreview={onClearScheduledTaskHistoryPreview}
        onPersistHistoryPreview={onPersistScheduledTaskHistoryPreview}
        onConfirmCaptureSave={onConfirmScheduledTaskCaptureSave}
        onPersistCapture={onPersistScheduledTaskCapture}
        onAddCaptureToKnowledge={onAddScheduledTaskCaptureToKnowledge}
        onCopy={onCopy}
      />

      <div className="mt-4 border-t border-slate-200 pt-3">
        <div className="rounded-md border border-cyan-200 bg-cyan-50/60 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Plug aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">{clientOnboardingPreview.title}</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-cyan-950">{clientOnboardingPreview.localOnlyNotice}</p>
            </div>
            <span className="shrink-0 rounded-md border border-cyan-200 bg-white px-2 py-1 text-[11px] font-semibold text-cyan-800">
              {clientOnboardingPreview.endpointStatus}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {clientOnboardingPreview.stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-cyan-200 bg-white px-2 py-2 text-center">
                <p className="truncate text-sm font-semibold text-slate-950">{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-800">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="min-w-0 rounded-md border border-cyan-200 bg-white p-3" aria-label="MCP client setup">
              <div className="flex items-center gap-2">
                <Terminal aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Clients</p>
              </div>
              <div className="mt-3 space-y-2">
                {clientOnboardingPreview.clients.map((client) => (
                  <article key={client.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-950">{client.label}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{client.description}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold", mcpClientOnboardingStatusStyles[client.status])}>
                        {client.status}
                      </span>
                    </div>
                    <p className="mt-2 truncate rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] leading-4 text-slate-600">
                      {client.transportLabel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-600">{client.verificationPrompt}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="min-w-0 rounded-md border border-cyan-200 bg-white p-3" aria-label="MCP setup checklist">
              <div className="flex items-center gap-2">
                <ListChecks aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Setup Flow</p>
              </div>
              <div className="mt-3 space-y-2">
                {clientOnboardingPreview.setupSteps.map((step) => (
                  <div key={step.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-semibold text-slate-950">{step.title}</p>
                      <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold", mcpClientOnboardingStatusStyles[step.status])}>
                        {step.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-2">
                <p className="text-xs font-semibold text-cyan-900">{clientOnboardingPreview.customMcpServer.title}</p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-cyan-900">{clientOnboardingPreview.customMcpServer.sseUrlPlaceholder}</p>
                <p className="mt-1 text-[11px] leading-4 text-cyan-900">{clientOnboardingPreview.customMcpServer.guardrail}</p>
              </div>
            </section>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <section className="rounded-md border border-cyan-200 bg-white p-3" aria-label="Browser MCP tool categories">
              <div className="flex items-center gap-2">
                <Wrench aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Browser Tool Categories</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {clientOnboardingPreview.toolCategories.map((category) => (
                  <div key={category.label} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <span className="min-w-0 truncate text-[11px] font-semibold text-slate-700">{category.label}</span>
                    <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold", mcpClientToolScopeStyles[category.scope])}>
                      {category.count} / {category.scope}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-cyan-200 bg-white p-3" aria-label="External app groups">
              <div className="flex items-center gap-2">
                <Plug aria-hidden="true" className="h-4 w-4 text-cyan-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">External App Groups</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {clientOnboardingPreview.externalAppGroups.map((group) => (
                  <div key={group.label} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-semibold text-slate-800">{group.label}</p>
                      <span className="shrink-0 rounded-md border border-cyan-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-cyan-800">
                        {group.authBoundary}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{group.examples.join(", ")}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <ul className="mt-3 space-y-1">
            {clientOnboardingPreview.guardrails.map((guardrail) => (
              <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-cyan-950">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-700" />
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
        <div className="flex items-center gap-2">
          <Terminal aria-hidden="true" className="h-4 w-4 text-sky-700" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client Commands</p>
        </div>
        <div className="mt-3 space-y-2">
          {commands.map((command) => (
            <div key={command.id} className="rounded-md border border-border bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{command.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{command.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onCopy(command.command, command.label)}
                  className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                >
                  <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <pre className="mt-2 max-h-28 overflow-auto rounded-md bg-slate-950 p-2 text-[11px] leading-5 text-slate-100">
                <code>{command.command}</code>
              </pre>
            </div>
          ))}
        </div>
        </div>
      </div>

      {copyStatus ? <p className="mt-3 text-xs font-medium text-emerald-700">{copyStatus}</p> : null}
      {state.error ? <p className="mt-2 text-xs leading-5 text-rose-700">{state.error}</p> : null}
    </div>
  );
}

function formatMcpResponseSummary(response: BrowserMcpResponse): string {
  if (!response.ok) {
    return response.error.message;
  }

  if (response.method === "tools/list") {
    return `${response.result.tools.length} tools / review ${response.result.summary.reviewRequired} / blocked ${response.result.summary.blockedByDefault}`;
  }

  return `${response.result.invocation.compatibleName} -> ${response.result.execution.status} / events ${response.result.events.length}`;
}

function probeToneClassName(status: McpEndpointProbeState["status"]): string {
  if (status === "ok") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "checking") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (status === "error") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function auditStatusClassName(status: BrowserMcpAuditEvent["status"]): string {
  if (status === "ok") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "waiting_approval") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function formatAuditEventTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatAuditEventSummary(event: BrowserMcpAuditEvent): string {
  if (event.kind === "mcp_request") {
    const toolLabel = event.toolId ? ` / ${event.toolId}` : "";
    return `${event.mcpMethod ?? "mcp"}${toolLabel} / ${event.httpStatus ?? "-"}`;
  }

  if (event.kind === "endpoint_started" || event.kind === "endpoint_stopped" || event.kind === "endpoint_error") {
    return event.message ?? event.path ?? event.kind;
  }

  return `${event.httpMethod ?? "-"} ${event.path ?? "-"} / ${event.httpStatus ?? "-"}`;
}

function approvalQueueStatusClassName(status: BrowserMcpApprovalQueueItemStatus): string {
  if (status === "approved_preview") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function McpApprovalQueuePanel({
  queue,
  onToggleApproval
}: {
  queue: BrowserMcpApprovalQueueItem[];
  onToggleApproval: (auditEventId: string) => Promise<void>;
}): ReactElement {
  return (
    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-amber-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Approval Queue</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            MCP client からの承認待ち tool call を run history preview に接続します。
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-800">
          {queue.length} waiting
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {queue.map((item) => (
          <div key={item.id} className="rounded-md border border-amber-200 bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.rationale}</p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">
                  {item.requestId ?? "no-request"} / {item.sessionId ?? "no-session"}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", approvalQueueStatusClassName(item.status))}>
                {item.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onToggleApproval(item.auditEventId)}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                  item.status === "approved_preview"
                    ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    : "bg-amber-700 text-white hover:bg-amber-800"
                )}
              >
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                {item.status === "approved_preview" ? "Undo preview" : "Approve preview"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
              <span className="truncate">method: {item.mcpMethod}</span>
              <span className="truncate">tool: {item.toolId}</span>
              <span className="truncate">workspace: {item.workspaceName}</span>
              <span className="truncate">run: {item.runPreview.status}</span>
            </div>
          </div>
        ))}
        {queue.length === 0 ? <p className="text-xs leading-5 text-amber-900">承認待ち MCP tool call はありません。</p> : null}
      </div>
    </div>
  );
}

function McpExecutionConfirmationPanel({
  confirmation,
  decisions,
  onToggleApproval,
  onCreateRun
}: {
  confirmation: BrowserMcpExecutionConfirmation | null;
  decisions: BrowserMcpApprovalDecision[];
  onToggleApproval: (auditEventId: string) => Promise<void>;
  onCreateRun: (auditEventId: string) => void;
}): ReactElement {
  const latestDecision = confirmation
    ? decisions.find((decision) => decision.auditEventId === confirmation.auditEventId)
    : undefined;

  return (
    <div className="mt-3 rounded-md border border-sky-200 bg-sky-50/70 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Execution Confirmation</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-sky-950">
            approval queue の選択結果を保存し、実行前の policy reason と最終確認を分離します。
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 text-[11px] font-semibold text-sky-800">
          {decisions.length} saved
        </span>
      </div>

      {confirmation ? (
        <div className="mt-3 rounded-md border border-sky-200 bg-white p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{confirmation.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{confirmation.policyReason}</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{confirmation.finalConfirmation}</p>
            </div>
            <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", approvalQueueStatusClassName(confirmation.decisionStatus))}>
              {confirmation.decisionStatus}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
            <span className="truncate">method: {confirmation.mcpMethod}</span>
            <span className="truncate">tool: {confirmation.toolId}</span>
            <span className="truncate">workspace: {confirmation.workspaceName}</span>
            <span className="truncate">run: {confirmation.runPreviewStatus}</span>
          </div>
          {latestDecision ? (
            <p className="mt-2 truncate font-mono text-[11px] leading-4 text-slate-500">
              saved: {latestDecision.status} / {latestDecision.decidedAt}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onToggleApproval(confirmation.auditEventId)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                confirmation.decisionStatus === "approved_preview"
                  ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  : "bg-sky-700 text-white hover:bg-sky-800"
              )}
            >
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              {confirmation.actionLabel}
            </button>
            <button
              type="button"
              onClick={() => onCreateRun(confirmation.auditEventId)}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
            >
              <History aria-hidden="true" className="h-3.5 w-3.5" />
              Run history
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-sky-950">実行前 confirmation の対象になる MCP request はありません。</p>
      )}
    </div>
  );
}

function McpGuardedExecutionPanel({ events }: { events: BrowserMcpAuditEvent[] }): ReactElement {
  const latestEvent = events[0];

  return (
    <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/70 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Guarded Execution</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-emerald-950">
            保存済み approval decision と一致した MCP request だけを guarded dry-run executor に渡します。
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800">
          {events.length} completed
        </span>
      </div>

      {latestEvent ? (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-emerald-200 bg-white p-3 text-[11px] leading-4 text-slate-600">
          <span className="truncate">request: {latestEvent.requestId ?? "no-request"}</span>
          <span className="truncate">tool: {latestEvent.toolId ?? "unknown_tool"}</span>
          <span className="truncate">decision: {latestEvent.approvalDecisionStatus ?? "none"}</span>
          <span className="truncate">execution: {latestEvent.executionStatus ?? "unknown"}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-emerald-950">guarded executor に到達した MCP request はまだありません。</p>
      )}
    </div>
  );
}

function runHistoryStageClassName(stage: BrowserMcpRunHistoryEntry["stage"]): string {
  if (stage === "recorded") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (stage === "guarded_executor") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function McpRunHistoryPanel({ entries }: { entries: BrowserMcpRunHistoryEntry[] }): ReactElement {
  const latestEntry = entries[0];

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <History aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MCP Run History</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            audit event を workflow / scheduler と共通の BrowserAgentRun 履歴 contract に変換します。
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
          {entries.length} entries
        </span>
      </div>

      {latestEntry ? (
        <div className="mt-3 space-y-2">
          {entries.slice(0, 3).map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-border bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{entry.title}</p>
                <p className="mt-1 truncate text-xs leading-5 text-slate-600">
                  {entry.run.id} / {entry.executionStatus} / {entry.schedulerPolicy}
                </p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">
                  {entry.requestId ?? "no-request"} / {entry.workspaceName}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", runStatusStyles[entry.status])}>
                  {entry.status}
                </span>
                <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", runHistoryStageClassName(entry.stage))}>
                  {entry.stage}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-600">MCP run history entry はまだありません。</p>
      )}
    </div>
  );
}

function schedulerTaskStatusClassName(status: BrowserSchedulerTaskDraft["status"]): string {
  if (status === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "needs_approval") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function runStepStatusClassName(status: BrowserAgentRun["steps"][number]["status"]): string {
  return runStepStatusStyles[status];
}

function formatNextRunAt(value: string | undefined): string {
  if (!value) {
    return "not scheduled";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function clampScheduleInput(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function createCadenceForType(type: BrowserScheduleCadence["type"], current: BrowserScheduleCadence): BrowserScheduleCadence {
  if (type === "daily") {
    return current.type === "daily" ? current : { type: "daily", timeOfDay: "08:00", timezone: "Asia/Tokyo" };
  }

  if (type === "hourly") {
    return current.type === "hourly" ? current : { type: "hourly", intervalHours: 6 };
  }

  return current.type === "minutes" ? current : { type: "minutes", intervalMinutes: 30 };
}

function McpSchedulerRegistryPanel({
  preview,
  sourceTask,
  suggestionCard,
  handoffReview,
  editorDraft,
  savedTasks,
  savedTaskDetail,
  message,
  canPersist,
  onSaveReady,
  onSaveReviewDraft,
  onSaveEdited,
  onEditorDraftChange,
  onClearSaved
}: {
  preview: BrowserSchedulerRegistryPreview;
  sourceTask: BrowserSchedulerTaskDraft | undefined;
  suggestionCard: BrowserScheduleSuggestionCard | null;
  handoffReview: BrowserScheduleHandoffReview | null;
  editorDraft: BrowserScheduleCardEditDraft | null;
  savedTasks: BrowserSchedulerTaskDraft[];
  savedTaskDetail: BrowserSavedScheduleTaskDetail | null;
  message: string;
  canPersist: boolean;
  onSaveReady: () => Promise<void>;
  onSaveReviewDraft: () => Promise<void>;
  onSaveEdited: () => Promise<void>;
  onEditorDraftChange: (draft: BrowserScheduleCardEditDraft | null) => void;
  onClearSaved: () => Promise<void>;
}): ReactElement {
  const savedSourceRunHistoryIds = new Set(savedTasks.map((task) => task.sourceRunHistoryId));
  const saveDisabled = !canPersist || sourceTask?.status !== "ready";
  const suggestionSaveDisabled = !canPersist || !suggestionCard?.canConfirm;
  const handoffReviewSaveDisabled = !canPersist || !handoffReview?.canSaveReviewDraft;
  const editorSaveDisabled = !canPersist || !editorDraft || !editorDraft.canEnable;

  const updateEditorDraft = (patch: Partial<BrowserScheduleCardEditDraft>): void => {
    if (!editorDraft) {
      return;
    }

    onEditorDraftChange({ ...editorDraft, ...patch });
  };

  const handleEditorNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    updateEditorDraft({ name: event.target.value });
  };

  const handleEditorPromptChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    updateEditorDraft({ prompt: event.target.value });
  };

  const handleEditorCadenceTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (!editorDraft) {
      return;
    }

    updateEditorDraft({
      cadence: createCadenceForType(event.target.value as BrowserScheduleCadence["type"], editorDraft.cadence)
    });
  };

  const handleEditorDailyTimeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!editorDraft || editorDraft.cadence.type !== "daily") {
      return;
    }

    updateEditorDraft({
      cadence: {
        ...editorDraft.cadence,
        timeOfDay: event.target.value || "08:00"
      }
    });
  };

  const handleEditorIntervalChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!editorDraft) {
      return;
    }

    const value = Number.parseInt(event.target.value, 10);
    if (editorDraft.cadence.type === "hourly") {
      updateEditorDraft({
        cadence: {
          type: "hourly",
          intervalHours: clampScheduleInput(value, 1, 24)
        }
      });
      return;
    }

    if (editorDraft.cadence.type === "minutes") {
      updateEditorDraft({
        cadence: {
          type: "minutes",
          intervalMinutes: clampScheduleInput(value, 1, 60)
        }
      });
    }
  };

  const handleEditorEnabledChange = (event: ChangeEvent<HTMLInputElement>): void => {
    updateEditorDraft({ enabled: event.target.checked });
  };

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduler Registry Draft</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            MCP run history と attached browser context から schedule task draft を作成します。現時点では local preview のみで自動実行は開始しません。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
            ready {preview.readyCount}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            approval {preview.approvalCount}
          </span>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
            blocked {preview.blockedCount}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            saved {savedTasks.length}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saveDisabled}
          onClick={() => void onSaveReady()}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
          Save ready
        </button>
        <button
          type="button"
          disabled={!canPersist || savedTasks.length === 0}
          onClick={() => void onClearSaved()}
          className="inline-flex h-8 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Clear saved
        </button>
        {!canPersist ? (
          <span className="inline-flex h-8 items-center rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800">
            Electron IPC required
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{message}</p>

      <div className="mt-3 rounded-md border border-sky-200 bg-sky-50/70 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-sky-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Schedule Suggestion Card</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-sky-950">
              conversation から提案される scheduling card の clean-room preview です。確認前に自動実行は開始しません。
            </p>
          </div>
          {suggestionCard ? (
            <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", schedulerTaskStatusClassName(suggestionCard.status))}>
              {suggestionCard.status}
            </span>
          ) : null}
        </div>

        {suggestionCard ? (
          <div className="mt-3 rounded-md border border-sky-200 bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{suggestionCard.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{suggestionCard.description}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-700">{suggestionCard.promptPreview}</p>
              </div>
              <button
                type="button"
                disabled={suggestionSaveDisabled}
                onClick={() => void onSaveReady()}
                className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-sky-700 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                {suggestionCard.actionLabel}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
              {suggestionCard.details.map((detail) => (
                <span key={detail} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                  {detail}
                </span>
              ))}
              <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                next: {formatNextRunAt(suggestionCard.nextRunAt)}
              </span>
            </div>
            {suggestionCard.blockedReason ? (
              <p className="mt-2 text-xs leading-5 text-amber-800">{suggestionCard.blockedReason}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-sky-950">schedule suggestion card にできる run history / attached context はまだありません。</p>
        )}
      </div>

      {handoffReview ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/80 p-3" aria-label="Schedule handoff review gate">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-amber-800" />
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Schedule Handoff Review Gate</p>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">{handoffReview.title}</p>
              <p className="mt-1 text-xs leading-5 text-amber-950">{handoffReview.reason}</p>
            </div>
            <button
              type="button"
              disabled={handoffReviewSaveDisabled}
              onClick={() => void onSaveReviewDraft()}
              className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-amber-700 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {handoffReview.primaryActionLabel}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-700">
            {handoffReview.metadata.map((item) => (
              <span key={item.label} className="truncate rounded-md border border-amber-200 bg-white px-2 py-1">
                {item.label}: {item.value}
              </span>
            ))}
          </div>
          <ul className="mt-3 grid gap-1 text-[11px] leading-4 text-amber-950">
            {handoffReview.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Wrench aria-hidden="true" className="h-4 w-4 text-slate-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Editable Schedule Draft</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              scheduling card が prefill する name、prompt、schedule type、enable 状態を保存前に調整します。
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            local draft
          </span>
        </div>

        {editorDraft ? (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-600" htmlFor="schedule-editor-name">
                Task name
                <input
                  id="schedule-editor-name"
                  type="text"
                  value={editorDraft.name}
                  onChange={handleEditorNameChange}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600" htmlFor="schedule-editor-type">
                Schedule type
                <select
                  id="schedule-editor-type"
                  value={editorDraft.cadence.type}
                  onChange={handleEditorCadenceTypeChange}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                  <option value="minutes">Minutes</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-600" htmlFor="schedule-editor-prompt">
              Prompt
              <textarea
                id="schedule-editor-prompt"
                value={editorDraft.prompt}
                onChange={handleEditorPromptChange}
                className="mt-1 min-h-20 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-xs leading-5 text-slate-900 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              {editorDraft.cadence.type === "daily" ? (
                <label className="block text-xs font-semibold text-slate-600" htmlFor="schedule-editor-time">
                  Time
                  <input
                    id="schedule-editor-time"
                    type="time"
                    value={editorDraft.cadence.timeOfDay}
                    onChange={handleEditorDailyTimeChange}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              ) : (
                <label className="block text-xs font-semibold text-slate-600" htmlFor="schedule-editor-interval">
                  Interval
                  <input
                    id="schedule-editor-interval"
                    type="number"
                    min={editorDraft.cadence.type === "hourly" ? 1 : 1}
                    max={editorDraft.cadence.type === "hourly" ? 24 : 60}
                    value={editorDraft.cadence.type === "hourly" ? editorDraft.cadence.intervalHours : editorDraft.cadence.intervalMinutes}
                    onChange={handleEditorIntervalChange}
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              )}
              <label
                className="flex h-9 items-center gap-2 self-end rounded-md border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
                htmlFor="schedule-editor-enabled"
              >
                <input
                  id="schedule-editor-enabled"
                  type="checkbox"
                  checked={editorDraft.enabled}
                  disabled={!editorDraft.canEnable}
                  onChange={handleEditorEnabledChange}
                  className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-700 disabled:cursor-not-allowed"
                />
                Enabled
              </label>
            </div>
            {editorDraft.disabledReason ? <p className="text-xs leading-5 text-amber-800">{editorDraft.disabledReason}</p> : null}
            <button
              type="button"
              disabled={editorSaveDisabled}
              onClick={() => void onSaveEdited()}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <Power aria-hidden="true" className="h-3.5 w-3.5" />
              Save edited draft
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-slate-600">編集できる schedule task draft はまだありません。</p>
        )}
      </div>

      {preview.tasks.length > 0 ? (
        <div className="mt-3 space-y-2">
          {preview.tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-border bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {task.name}
                  {savedSourceRunHistoryIds.has(task.sourceRunHistoryId) ? (
                    <span className="ml-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      saved
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 truncate text-xs leading-5 text-slate-600">
                  {task.cadenceLabel} / next {formatNextRunAt(task.nextRunAt)}
                </p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">
                  {task.approvalPolicy} / runs {task.runHistory.length}/{preview.maxRunsPerTask}
                </p>
              </div>
              <span className={cn("h-fit rounded-md border px-2 py-1 text-[11px] font-semibold", schedulerTaskStatusClassName(task.status))}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-600">schedule task draft にできる run history はまだありません。</p>
      )}

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ListChecks aria-hidden="true" className="h-4 w-4 text-slate-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saved Task Detail</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              local scheduler store に保存済みの draft を detail view として確認します。run result はまだ実行しません。
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            {savedTasks.length} saved
          </span>
        </div>

        {savedTaskDetail ? (
          <div className="mt-3 rounded-md border border-border bg-white p-3">
            <p className="truncate text-sm font-semibold text-slate-950">{savedTaskDetail.title}</p>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-700">{savedTaskDetail.prompt}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
              {savedTaskDetail.metadata.map((item) => (
                <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
            {savedTaskDetail.latestRunSummary ? (
              <p className="mt-2 truncate text-xs leading-5 text-slate-600">latest: {savedTaskDetail.latestRunSummary}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-slate-600">保存済み schedule task draft を選択すると detail が表示されます。</p>
        )}
      </div>
    </div>
  );
}

function ScheduledTasksManagerPanel({
  preview,
  confirmation,
  reviewApprovalPreview,
  backgroundRunPreview,
  historyCandidate,
  historyStoreCommitPreview,
  newTabInboxPreview,
  newTabResultPreview,
  newTabResultStackPreview,
  runOutputPreview,
  runCapturePreview,
  captureSaveConfirmation,
  captureStoreDraft,
  captureKnowledgeDraft,
  historyPreviewMessage,
  historyStoreMessage,
  historyPreviewActive,
  captureSaveMessage,
  captureSaveConfirmed,
  capturePersistStatus,
  capturePersisted,
  captureKnowledgeStatus,
  reviewApprovalMessage,
  canPersist,
  onSelectTask,
  onSelectAction,
  onSelectRun,
  onApproveReviewDraft,
  onAppendHistoryCandidate,
  onClearHistoryPreview,
  onPersistHistoryPreview,
  onConfirmCaptureSave,
  onPersistCapture,
  onAddCaptureToKnowledge,
  onCopy
}: {
  preview: BrowserScheduledTasksPagePreview;
  confirmation: BrowserScheduledTaskManualRunConfirmation | null;
  reviewApprovalPreview: BrowserScheduleReviewApprovalPreview | null;
  backgroundRunPreview: BrowserScheduledTaskBackgroundRunPreview | null;
  historyCandidate: BrowserScheduledTaskDryRunHistoryCandidate | null;
  historyStoreCommitPreview: BrowserScheduledTaskHistoryStoreCommitPreview | null;
  newTabInboxPreview: BrowserScheduledTaskNewTabInboxPreview;
  newTabResultPreview: BrowserScheduledTaskNewTabResultPreview | null;
  newTabResultStackPreview: BrowserScheduledTaskNewTabResultStackPreview | null;
  runOutputPreview: BrowserScheduledTaskRunOutputPreview | null;
  runCapturePreview: BrowserScheduledTaskRunCapturePreview | null;
  captureSaveConfirmation: BrowserScheduledTaskRunCaptureSaveConfirmation | null;
  captureStoreDraft: BrowserScheduledTaskRunCaptureStoreDraft | null;
  captureKnowledgeDraft: BrowserScheduledTaskRunCaptureKnowledgeDraft | null;
  historyPreviewMessage: string;
  historyStoreMessage: string;
  historyPreviewActive: boolean;
  captureSaveMessage: string;
  captureSaveConfirmed: boolean;
  capturePersistStatus: ScheduledTaskCapturePersistStatus;
  capturePersisted: boolean;
  captureKnowledgeStatus: ScheduledTaskCaptureKnowledgeStatus;
  reviewApprovalMessage: string;
  canPersist: boolean;
  onSelectTask: (taskId: string) => void;
  onSelectAction: (actionId: BrowserScheduledTaskPreviewAction["id"]) => void;
  onSelectRun: (runId: string) => void;
  onApproveReviewDraft: () => Promise<void>;
  onAppendHistoryCandidate: () => void;
  onClearHistoryPreview: () => void;
  onPersistHistoryPreview: () => Promise<void>;
  onConfirmCaptureSave: () => void;
  onPersistCapture: () => Promise<void>;
  onAddCaptureToKnowledge: () => void;
  onCopy: (value: string, label: string) => Promise<void>;
}): ReactElement {
  const [newTabResultQuery, setNewTabResultQuery] = useState("");
  const [newTabInboxStatusFilter, setNewTabInboxStatusFilter] = useState<BrowserScheduledTaskNewTabInboxStatusFilter>("all");
  const deferredNewTabResultQuery = useDeferredValue(newTabResultQuery);
  const selectedDetail = preview.selectedDetail;
  const capturePersistDisabled =
    !captureStoreDraft || !captureSaveConfirmed || capturePersistStatus === "saving" || capturePersisted;
  const capturePersistLabel = capturePersisted
    ? "Saved to captures"
    : capturePersistStatus === "saving"
      ? "Saving..."
      : captureStoreDraft?.primaryActionLabel ?? "Save to local captures";
  const captureKnowledgeDisabled = !captureKnowledgeDraft || captureKnowledgeStatus === "added";
  const captureKnowledgeLabel = captureKnowledgeStatus === "added" ? "Added to knowledge" : captureKnowledgeDraft?.primaryActionLabel ?? "Add to knowledge";
  const reviewApprovalDisabled = !canPersist || !reviewApprovalPreview?.canApprove;
  const historyStoreCommitDisabled = !canPersist || !historyStoreCommitPreview?.canPersist;
  const newTabFilterPreview = useMemo<BrowserScheduledTaskNewTabResultFilterPreview | null>(
    () => createBrowserScheduledTaskNewTabResultFilterPreview(newTabResultPreview, deferredNewTabResultQuery),
    [deferredNewTabResultQuery, newTabResultPreview]
  );
  const newTabInboxFilterPreview = useMemo<BrowserScheduledTaskNewTabInboxFilterPreview>(
    () => createBrowserScheduledTaskNewTabInboxFilterPreview(newTabInboxPreview, deferredNewTabResultQuery, newTabInboxStatusFilter),
    [deferredNewTabResultQuery, newTabInboxPreview, newTabInboxStatusFilter]
  );
  const newTabInboxTriagePreview = useMemo<BrowserScheduledTaskNewTabInboxTriagePreview>(
    () => createBrowserScheduledTaskNewTabInboxTriagePreview(newTabInboxFilterPreview),
    [newTabInboxFilterPreview]
  );
  const newTabInboxActionQueuePreview = useMemo<BrowserScheduledTaskNewTabInboxActionQueuePreview>(
    () => createBrowserScheduledTaskNewTabInboxActionQueuePreview(newTabInboxFilterPreview),
    [newTabInboxFilterPreview]
  );
  const newTabInboxActionHandoffPreview = useMemo<BrowserScheduledTaskNewTabInboxActionHandoffPreview>(
    () => createBrowserScheduledTaskNewTabInboxActionHandoffPreview(newTabInboxActionQueuePreview),
    [newTabInboxActionQueuePreview]
  );
  const newTabInboxActionReviewDraftPreview = useMemo<BrowserScheduledTaskNewTabInboxActionReviewDraftPreview>(
    () => createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(newTabInboxActionHandoffPreview),
    [newTabInboxActionHandoffPreview]
  );
  const newTabInboxActionReviewDecisionPreview = useMemo<BrowserScheduledTaskNewTabInboxActionReviewDecisionPreview>(
    () => createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(newTabInboxActionReviewDraftPreview),
    [newTabInboxActionReviewDraftPreview]
  );
  const newTabInboxActionDecisionRoutePreview = useMemo<BrowserScheduledTaskNewTabInboxActionDecisionRoutePreview>(
    () => createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview(newTabInboxActionHandoffPreview, newTabInboxActionReviewDecisionPreview),
    [newTabInboxActionHandoffPreview, newTabInboxActionReviewDecisionPreview]
  );
  const newTabInboxQueryActive = newTabInboxFilterPreview.normalizedQuery.length > 0;
  const newTabInboxFilterActive = newTabInboxQueryActive || newTabInboxStatusFilter !== "all";
  const newTabTracePreview = useMemo<BrowserScheduledTaskNewTabTracePreview | null>(
    () =>
      createBrowserScheduledTaskNewTabTracePreview(newTabResultPreview, {
        captureSaved: capturePersisted,
        knowledgeAdded: captureKnowledgeStatus === "added"
      }),
    [captureKnowledgeStatus, capturePersisted, newTabResultPreview]
  );

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduled Tasks Manager</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            保存済みまたは draft の scheduled task を list / detail view として確認します。実行操作は preview 表示だけに限定します。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            tasks {preview.taskCount}
          </span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
            enabled {preview.enabledCount}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            disabled {preview.disabledCount}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            review {preview.needsReviewCount}
          </span>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
            blocked {preview.blockedCount}
          </span>
        </div>
      </div>

      {preview.items.length > 0 ? (
        <div className="mt-3 grid gap-3">
          <section className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Scheduled task list">
            <div className="flex items-center gap-2">
              <ListChecks aria-hidden="true" className="h-4 w-4 text-slate-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Task List</p>
            </div>
            <div className="mt-3 space-y-2">
              {preview.items.slice(0, 6).map((item) => {
                const selected = item.id === preview.selectedTaskId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectTask(item.id)}
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                      selected ? "border-sky-300 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-950">{item.name}</span>
                      <span className="mt-1 block truncate text-xs leading-5 text-slate-600">
                        {item.workspaceName} / {item.cadenceLabel}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[11px] leading-4 text-slate-500">
                        next {formatNextRunAt(item.nextRunAt)} / runs {item.runCount}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", schedulerTaskStatusClassName(item.status))}>
                        {item.status}
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-1 text-[11px] font-semibold",
                          item.enabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        )}
                      >
                        {item.enabled ? "enabled" : "disabled"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3" aria-label="Scheduled task detail">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <History aria-hidden="true" className="h-4 w-4 text-slate-700" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detail</p>
                </div>
                {selectedDetail ? <p className="mt-1 truncate text-sm font-semibold text-slate-950">{selectedDetail.title}</p> : null}
              </div>
              {selectedDetail ? (
                <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", schedulerTaskStatusClassName(selectedDetail.status))}>
                  {selectedDetail.status}
                </span>
              ) : null}
            </div>

            {selectedDetail ? (
              <div className="mt-3 space-y-3">
                <p className="line-clamp-3 text-xs leading-5 text-slate-700">{selectedDetail.prompt}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
                  <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                    workspace: {selectedDetail.workspaceName}
                  </span>
                  <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                    cadence: {selectedDetail.cadenceLabel}
                  </span>
                  <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                    next: {formatNextRunAt(selectedDetail.nextRunAt)}
                  </span>
                  <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                    state: {selectedDetail.enabled ? "enabled" : "disabled"}
                  </span>
                </div>

                {reviewApprovalPreview ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3" aria-label="Schedule review approval preview">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <ShieldCheck aria-hidden="true" className="h-4 w-4 text-amber-700" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Schedule Review Approval</p>
                        </div>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-950">{reviewApprovalPreview.title}</p>
                        <p className="mt-1 text-xs leading-5 text-amber-950">{reviewApprovalPreview.reason}</p>
                      </div>
                      <button
                        type="button"
                        disabled={reviewApprovalDisabled}
                        onClick={() => void onApproveReviewDraft()}
                        className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-amber-700 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                      >
                        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                        {reviewApprovalPreview.primaryActionLabel}
                      </button>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-amber-950">{reviewApprovalMessage}</p>
                    {!canPersist ? (
                      <span className="mt-2 inline-flex h-7 items-center rounded-md border border-amber-200 bg-white px-2 text-[11px] font-semibold text-amber-800">
                        Electron IPC required
                      </span>
                    ) : null}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-700">
                      {reviewApprovalPreview.metadata.map((item) => (
                        <span key={item.label} className="truncate rounded-md border border-amber-200 bg-white px-2 py-1">
                          {item.label}: {item.value}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-3 grid gap-1 text-[11px] leading-4 text-amber-950">
                      {reviewApprovalPreview.checklist.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Play aria-hidden="true" className="h-4 w-4 text-slate-700" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview Actions</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {selectedDetail.actions.map((taskAction) => {
                      const Icon = taskAction.id === "cancel_preview" ? Square : taskAction.id === "retry_preview" ? RefreshCw : Play;
                      const selectedAction = taskAction.id === confirmation?.actionId;

                      return (
                        <button
                          key={taskAction.id}
                          type="button"
                          disabled={!taskAction.enabled}
                          title={taskAction.reason}
                          onClick={() => onSelectAction(taskAction.id)}
                          className={cn(
                            "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border px-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                            selectedAction
                              ? "border-slate-900 bg-slate-900 text-white"
                              : taskAction.enabled
                                ? "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-white"
                                : "border-slate-200 bg-white text-slate-500"
                          )}
                        >
                          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                          {taskAction.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-amber-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Manual Run Confirmation</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-amber-950">
                        manual test / retry を guarded dry-run に渡す前の policy reason と実行前確認です。
                      </p>
                    </div>
                    {confirmation ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold",
                          confirmation.canConfirm
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-rose-200 bg-rose-50 text-rose-800"
                        )}
                      >
                        {confirmation.status}
                      </span>
                    ) : null}
                  </div>

                  {confirmation ? (
                    <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{confirmation.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{confirmation.policyReason}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-700">{confirmation.dryRunSummary}</p>
                        </div>
                        <button
                          type="button"
                          disabled
                          className={cn(
                            "inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-medium",
                            confirmation.canConfirm
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          )}
                        >
                          <Play aria-hidden="true" className="h-3.5 w-3.5" />
                          {confirmation.primaryActionLabel}
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] leading-4 text-slate-600">
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          expected: {confirmation.expectedRunStatus}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          timeout: {Math.round(confirmation.timeoutSeconds / 60)} min
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
                        {confirmation.steps.map((step) => (
                          <div key={step.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{step.title}</p>
                              <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold", stepToneStyles[step.risk])}>
                                {step.risk}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-600">{step.detail}</p>
                          </div>
                        ))}
                      </div>
                      <ul className="mt-3 space-y-1">
                        {confirmation.guardrails.map((guardrail) => (
                          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <span>{guardrail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-amber-950">確認対象の scheduled task はまだありません。</p>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <PanelRightOpen aria-hidden="true" className="h-4 w-4 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Background Run Preview</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        scheduled task の alarm、hidden window、agent execution、result save を BrowserOS-like flow として確認します。
                      </p>
                    </div>
                    {backgroundRunPreview ? (
                      <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {backgroundRunPreview.stats[0]?.value ?? 0} stages
                      </span>
                    ) : null}
                  </div>

                  {backgroundRunPreview ? (
                    <div className="mt-3 space-y-3">
                      <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-xs leading-5 text-slate-700">
                        {backgroundRunPreview.localOnlyNotice}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-4">
                        {backgroundRunPreview.stats.map((stat) => (
                          <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-center">
                            <p className="text-sm font-semibold text-slate-950">{stat.value}</p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-3">
                        {backgroundRunPreview.metadata.map((item) => (
                          <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                      <div className="grid gap-2 lg:grid-cols-5">
                        {backgroundRunPreview.stages.map((stage, index) => (
                          <article key={stage.id} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-950">
                                  {String(index + 1).padStart(2, "0")} / {stage.title}
                                </p>
                                <p className="mt-1 truncate font-mono text-[10px] leading-4 text-slate-500">{stage.artifactLabel}</p>
                              </div>
                              <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", backgroundRunStageStatusStyles[stage.status])}>
                                {stage.status}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-3 text-[11px] leading-4 text-slate-600">{stage.detail}</p>
                            <p className="mt-2 line-clamp-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] leading-4 text-slate-500">
                              {stage.guardrail}
                            </p>
                          </article>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {backgroundRunPreview.actions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            disabled={!action.enabled}
                            title={action.reason}
                            className={cn(
                              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                              action.enabled
                                ? "cursor-pointer border-sky-200 bg-sky-50 text-sky-800 hover:bg-white"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            )}
                          >
                            <PanelRightOpen aria-hidden="true" className="h-3.5 w-3.5" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                      <ul className="space-y-1">
                        {backgroundRunPreview.guardrails.map((guardrail) => (
                          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span>{guardrail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-600">scheduled task を選択すると background run preview が表示されます。</p>
                  )}
                </div>

                <div className="rounded-md border border-sky-200 bg-sky-50/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Sparkles aria-hidden="true" className="h-4 w-4 text-sky-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">New Tab Result Preview</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-sky-950">
                        scheduled task の最新結果を New Tab 相当の compact card として表示します。run output はこの端末の local preview に保持します。
                      </p>
                    </div>
                    {newTabResultPreview ? (
                      <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", runStatusStyles[newTabResultPreview.status])}>
                        {newTabResultPreview.status}
                      </span>
                    ) : null}
                  </div>

                  <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={(event) => event.preventDefault()}>
                    <label className="relative min-w-0 flex-1">
                      <span className="sr-only">New Tab result を検索</span>
                      <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="search"
                        value={newTabResultQuery}
                        disabled={!newTabResultPreview && newTabInboxPreview.items.length === 0}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => setNewTabResultQuery(event.target.value)}
                        placeholder="summary / tools / finding / run id"
                        className="h-8 w-full rounded-md border border-sky-200 bg-white pl-8 pr-3 text-xs text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={newTabResultQuery.length === 0}
                      onClick={() => setNewTabResultQuery("")}
                      className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                      Clear
                    </button>
                    {newTabFilterPreview ? (
                      <span className="inline-flex h-8 items-center rounded-md border border-sky-200 bg-white px-2 text-[11px] font-semibold text-sky-800">
                        {newTabFilterPreview.normalizedQuery.length === 0
                          ? `${newTabFilterPreview.searchScope.length} scopes`
                          : `${newTabFilterPreview.matchCount} matches`}
                        </span>
                      ) : null}
                    <span className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700" aria-live="polite">
                      {newTabInboxFilterActive
                        ? `inbox ${newTabInboxFilterPreview.visibleCount}/${newTabInboxFilterPreview.totalCount} visible`
                        : `inbox ${newTabInboxFilterPreview.totalCount} items`}
                    </span>
                  </form>

                  {newTabInboxPreview.taskCount > 0 ? (
                    <div className="mt-3 rounded-md border border-sky-200 bg-white/80 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">New Tab result inbox</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxPreview.localOnlyNotice}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800" aria-live="polite">
                            {newTabInboxFilterActive
                              ? `${newTabInboxFilterPreview.visibleCount}/${newTabInboxFilterPreview.totalCount} visible`
                              : `${newTabInboxPreview.resultCount}/${newTabInboxPreview.maxVisibleResults} results`}
                          </span>
                          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                            done {newTabInboxPreview.statusCounts.completed}
                          </span>
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                            review {newTabInboxPreview.statusCounts.needsApproval}
                          </span>
                          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
                            blocked {newTabInboxPreview.statusCounts.blocked}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1" role="tablist" aria-label="New Tab inbox status">
                        {newTabInboxFilterPreview.statusOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            role="tab"
                            aria-selected={option.selected}
                            onClick={() => setNewTabInboxStatusFilter(option.id)}
                            className={cn(
                              "inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                              option.selected
                                ? "border-sky-300 bg-sky-100 text-sky-900"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <span>{option.label}</span>
                            <span className="font-mono text-[10px] opacity-80">{option.count}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 border-t border-sky-100 pt-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Inbox triage</p>
                            <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxTriagePreview.summary}</p>
                          </div>
                          <button
                            type="button"
                            disabled={!newTabInboxTriagePreview.primaryAction.enabled}
                            title={newTabInboxTriagePreview.primaryAction.reason}
                            onClick={() => {
                              if (!newTabInboxTriagePreview.primaryAction.taskId || !newTabInboxTriagePreview.primaryAction.runId) {
                                return;
                              }
                              onSelectTask(newTabInboxTriagePreview.primaryAction.taskId);
                              onSelectRun(newTabInboxTriagePreview.primaryAction.runId);
                            }}
                            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-sky-200 bg-white px-3 text-xs font-medium text-sky-800 transition-colors duration-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <PanelRightOpen aria-hidden="true" className="h-3.5 w-3.5" />
                            {newTabInboxTriagePreview.primaryAction.label}
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                          {newTabInboxTriagePreview.metrics.map((metric) => (
                            <span key={metric.label} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                              {metric.label}: {metric.value}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500">{newTabInboxTriagePreview.guardrail}</p>
                      </div>
                      <div className="mt-2 rounded-md border border-slate-200 bg-white p-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Inbox action queue</p>
                            <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxActionQueuePreview.localOnlyNotice}</p>
                          </div>
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700" aria-live="polite">
                            {newTabInboxActionQueuePreview.actionCount}/{newTabInboxActionQueuePreview.maxActions} actions
                          </span>
                        </div>
                        {newTabInboxActionQueuePreview.actions.length > 0 ? (
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            {newTabInboxActionQueuePreview.actions.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                title={action.reason}
                                onClick={() => {
                                  onSelectTask(action.taskId);
                                  onSelectRun(action.runId);
                                }}
                                className={cn(
                                  "min-w-0 cursor-pointer rounded-md border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                                  action.selected ? "border-sky-300 bg-sky-50 text-sky-950" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                                )}
                              >
                                <span className="flex items-center justify-between gap-2">
                                  <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
                                    <PanelRightOpen aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{action.label}</span>
                                  </span>
                                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", runStatusStyles[action.status])}>
                                    {action.priority}
                                  </span>
                                </span>
                                <span className="mt-1 block truncate text-[11px] leading-4 text-slate-600">{action.title}</span>
                                <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-slate-500">{action.summary}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-xs leading-5 text-slate-600">
                            {newTabInboxActionQueuePreview.emptyStateMessage}
                          </p>
                        )}
                        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2" aria-label="Action handoff draft">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Action handoff draft</p>
                              <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxActionHandoffPreview.localOnlyNotice}</p>
                            </div>
                            <button
                              type="button"
                              disabled={!newTabInboxActionHandoffPreview.primaryAction.enabled}
                              title={newTabInboxActionHandoffPreview.primaryAction.reason}
                              onClick={() => void onCopy(newTabInboxActionHandoffPreview.handoffPacket, "Inbox action handoff packet")}
                              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                            >
                              <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                              {newTabInboxActionHandoffPreview.primaryAction.label}
                            </button>
                          </div>
                          <p className="mt-2 line-clamp-3 rounded-md border border-slate-200 bg-white px-2 py-1.5 font-mono text-[10px] leading-4 text-slate-600">
                            {newTabInboxActionHandoffPreview.handoffPacketPreview}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                            {newTabInboxActionHandoffPreview.metadata.map((metadata) => (
                              <span key={metadata.label} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
                                {metadata.label}: {metadata.value}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 grid gap-1 md:grid-cols-2" aria-live="polite">
                            {newTabInboxActionHandoffPreview.reviewChecklist.map((check) => (
                              <div key={check.id} className="min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">{check.label}</span>
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                                      check.status === "passed"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-slate-200 bg-slate-100 text-slate-600"
                                    )}
                                  >
                                    {check.status}
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{check.detail}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500">
                            Blocked: {newTabInboxActionHandoffPreview.blockedOperations.join(", ")}
                          </p>
                          <div className="mt-2 rounded-md border border-slate-200 bg-white p-2" aria-label="Action review draft preview">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Review draft preview</p>
                                <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxActionReviewDraftPreview.localOnlyNotice}</p>
                              </div>
                              <button
                                type="button"
                                disabled={!newTabInboxActionReviewDraftPreview.primaryAction.enabled}
                                title={newTabInboxActionReviewDraftPreview.primaryAction.reason}
                                onClick={() => void onCopy(newTabInboxActionReviewDraftPreview.draft, "Inbox action review draft")}
                                className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                              >
                                <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
                                {newTabInboxActionReviewDraftPreview.primaryAction.label}
                              </button>
                            </div>
                            <p className="mt-2 line-clamp-3 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-[10px] leading-4 text-slate-600">
                              {newTabInboxActionReviewDraftPreview.draftPreview}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                              {newTabInboxActionReviewDraftPreview.metadata.map((metadata) => (
                                <span key={metadata.label} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                  {metadata.label}: {metadata.value}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 grid gap-1 md:grid-cols-2">
                              {newTabInboxActionReviewDraftPreview.outputSections.map((section) => (
                                <div key={section.id} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">{section.label}</p>
                                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{section.detail}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2" aria-label="Review decision preview">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Review decision preview</p>
                                  <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxActionReviewDecisionPreview.localOnlyNotice}</p>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-md border px-2 py-1 text-[11px] font-semibold",
                                    reviewDecisionToneStyles[newTabInboxActionReviewDecisionPreview.recommendedDecision.tone]
                                  )}
                                >
                                  {newTabInboxActionReviewDecisionPreview.recommendedDecision.label}
                                </span>
                              </div>
                              <p className="mt-2 text-[11px] leading-4 text-slate-600">{newTabInboxActionReviewDecisionPreview.recommendedDecision.reason}</p>
                              <p className="mt-2 line-clamp-3 rounded-md border border-slate-200 bg-white px-2 py-1.5 font-mono text-[10px] leading-4 text-slate-600">
                                {newTabInboxActionReviewDecisionPreview.decisionNotePreview}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                                {newTabInboxActionReviewDecisionPreview.metadata.map((metadata) => (
                                  <span key={metadata.label} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
                                    {metadata.label}: {metadata.value}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 grid gap-1 md:grid-cols-3">
                                {newTabInboxActionReviewDecisionPreview.nextActions.map((action) => (
                                  <div key={action.id} className="min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5">
                                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">{action.label}</p>
                                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{action.detail}</p>
                                  </div>
                                ))}
                              </div>
                              <button
                                type="button"
                                disabled={!newTabInboxActionReviewDecisionPreview.primaryAction.enabled}
                                title={newTabInboxActionReviewDecisionPreview.primaryAction.reason}
                                onClick={() => void onCopy(newTabInboxActionReviewDecisionPreview.decisionNote, "Inbox action decision note")}
                                className="mt-2 inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                              >
                                <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
                                {newTabInboxActionReviewDecisionPreview.primaryAction.label}
                              </button>
                              <div className="mt-2 rounded-md border border-slate-200 bg-white p-2" aria-label="Decision route preview">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Decision route preview</p>
                                    <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabInboxActionDecisionRoutePreview.localOnlyNotice}</p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!newTabInboxActionDecisionRoutePreview.primaryAction.enabled}
                                    title={newTabInboxActionDecisionRoutePreview.primaryAction.reason}
                                    onClick={() => {
                                      if (!newTabInboxActionDecisionRoutePreview.primaryAction.taskId || !newTabInboxActionDecisionRoutePreview.primaryAction.runId) {
                                        return;
                                      }
                                      onSelectTask(newTabInboxActionDecisionRoutePreview.primaryAction.taskId);
                                      onSelectRun(newTabInboxActionDecisionRoutePreview.primaryAction.runId);
                                    }}
                                    className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                                  >
                                    <PanelRightOpen aria-hidden="true" className="h-3.5 w-3.5" />
                                    {newTabInboxActionDecisionRoutePreview.primaryAction.label}
                                  </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                                  {newTabInboxActionDecisionRoutePreview.metadata.map((metadata) => (
                                    <span key={metadata.label} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                      {metadata.label}: {metadata.value}
                                    </span>
                                  ))}
                                </div>
                                <div className="mt-2 grid gap-1 md:grid-cols-3">
                                  {newTabInboxActionDecisionRoutePreview.routeCards.map((route) => (
                                    <div
                                      key={route.id}
                                      className={cn(
                                        "min-w-0 rounded-md border px-2 py-1.5",
                                        route.enabled ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white text-slate-400"
                                      )}
                                    >
                                      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">{route.label}</p>
                                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{route.detail}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {newTabInboxQueryActive ? (
                        <div className="mt-2 flex flex-wrap gap-1" aria-live="polite">
                          {newTabInboxFilterPreview.matchedFields.slice(0, 4).map((field, index) => (
                            <span
                              key={`${field.itemId}-${field.label}-${index}`}
                              className="max-w-full truncate rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800"
                            >
                              {field.label}: {field.value}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {newTabInboxFilterPreview.items.length > 0 ? (
                        <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                          {newTabInboxFilterPreview.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={item.selected}
                              title={`${item.taskName}: ${item.summary}`}
                              onClick={() => {
                                onSelectTask(item.taskId);
                                onSelectRun(item.runId);
                              }}
                              className={cn(
                                "min-w-0 rounded-md border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                                item.selected
                                  ? "border-sky-300 bg-sky-50 text-sky-950"
                                  : "cursor-pointer border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
                                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{item.title}</span>
                                </span>
                                <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", runStatusStyles[item.status])}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{item.summary}</p>
                              <p className="mt-1 truncate font-mono text-[10px] leading-4 text-slate-500">{item.startedAt}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.metadata.slice(0, 3).map((metadata) => (
                                  <span key={metadata.label} className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                    {metadata.label}: {metadata.value}
                                  </span>
                                ))}
                                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                  {item.selected ? "selected" : "open"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-2 py-2 text-xs leading-5 text-sky-950">
                          {newTabInboxFilterPreview.emptyStateMessage || "New Tab inbox に表示できる scheduled task result はまだありません。"}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {newTabResultStackPreview ? (
                    <div className="mt-3 rounded-md border border-sky-200 bg-white/80 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Recent New Tab results</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabResultStackPreview.localOnlyNotice}</p>
                        </div>
                        <span className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
                          {newTabResultStackPreview.resultCount}/{newTabResultStackPreview.maxVisibleResults} visible
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {newTabResultStackPreview.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={item.selected}
                            title={item.summary}
                            onClick={() => onSelectRun(item.runId)}
                            className={cn(
                              "min-w-0 rounded-md border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-default",
                              item.selected
                                ? "border-sky-300 bg-sky-50 text-sky-950"
                                : "cursor-pointer border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
                                <History aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{item.title}</span>
                              </span>
                              <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", runStatusStyles[item.status])}>
                                {item.status}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{item.summary}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.metadata.map((metadata) => (
                                <span key={metadata.label} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                  {metadata.label}: {metadata.value}
                                </span>
                              ))}
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                                {item.selected ? "selected" : "open"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {newTabResultPreview && newTabFilterPreview?.visible ? (
                    <div className="mt-3 space-y-3 rounded-md border border-sky-200 bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{newTabResultPreview.title}</p>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-700">{newTabResultPreview.summary}</p>
                        </div>
                        <span className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
                          {newTabResultPreview.resultLocation}
                        </span>
                      </div>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                        {newTabResultPreview.metadata.map((item) => (
                          <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                      {newTabTracePreview ? (
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Local result trace</p>
                              <p className="mt-1 text-[11px] leading-4 text-slate-600">{newTabTracePreview.localOnlyNotice}</p>
                            </div>
                            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                              {newTabTracePreview.nodes.length} steps
                            </span>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-5">
                            {newTabTracePreview.nodes.map((node) => {
                              const traceActionable = node.actionId && node.status !== "locked" && node.status !== "completed";
                              const content = (
                                <>
                                  <span className="flex items-center gap-1.5">
                                    {node.id === "new_tab_result" ? (
                                      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                                    ) : node.id === "run_history" ? (
                                      <History aria-hidden="true" className="h-3.5 w-3.5" />
                                    ) : node.id === "full_output" ? (
                                      <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
                                    ) : node.id === "capture" ? (
                                      <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
                                    ) : (
                                      <BrainCircuit aria-hidden="true" className="h-3.5 w-3.5" />
                                    )}
                                    <span className="truncate">{node.label}</span>
                                  </span>
                                  <span className="truncate text-[10px] font-semibold uppercase tracking-wide opacity-80">{node.status}</span>
                                </>
                              );

                              if (traceActionable) {
                                return (
                                  <button
                                    key={node.id}
                                    type="button"
                                    title={node.description}
                                    onClick={() => {
                                      if (node.actionId === "open_full_output") {
                                        onSelectRun(newTabResultPreview.runId);
                                        return;
                                      }
                                      if (node.actionId === "capture_result") {
                                        onConfirmCaptureSave();
                                        return;
                                      }
                                      if (node.actionId === "add_to_knowledge") {
                                        onAddCaptureToKnowledge();
                                      }
                                    }}
                                    className={cn(
                                      "inline-flex min-w-0 cursor-pointer flex-col gap-1 rounded-md border px-2 py-2 text-left text-[11px] transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                                      newTabTraceStatusStyles[node.status]
                                    )}
                                  >
                                    {content}
                                  </button>
                                );
                              }

                              return (
                                <div
                                  key={node.id}
                                  title={node.description}
                                  className={cn(
                                    "inline-flex min-w-0 flex-col gap-1 rounded-md border px-2 py-2 text-[11px]",
                                    newTabTraceStatusStyles[node.status]
                                  )}
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                      {newTabFilterPreview.normalizedQuery.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {newTabFilterPreview.matchedFields.slice(0, 4).map((field) => (
                            <span
                              key={`${field.label}:${field.value}`}
                              className="max-w-full truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800"
                              title={`${field.label}: ${field.value}`}
                            >
                              {field.label}: {field.value}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {newTabResultPreview.actions.map((action) => {
                          const actionable =
                            action.enabled &&
                            (action.id === "open_full_output" || action.id === "capture_result" || action.id === "add_to_knowledge");

                          return (
                            <button
                              key={action.id}
                              type="button"
                              disabled={!actionable}
                              title={action.reason}
                              onClick={() => {
                                if (action.id === "open_full_output") {
                                  onSelectRun(newTabResultPreview.runId);
                                  return;
                                }
                                if (action.id === "capture_result") {
                                  onConfirmCaptureSave();
                                  return;
                                }
                                if (action.id === "add_to_knowledge") {
                                  onAddCaptureToKnowledge();
                                }
                              }}
                              className={cn(
                                "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                                actionable
                                  ? "cursor-pointer border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                                  : action.enabled
                                    ? "border-sky-200 bg-sky-50 text-sky-800"
                                    : "border-slate-200 bg-slate-100 text-slate-500"
                              )}
                            >
                              {action.id === "open_full_output" ? (
                                <Terminal aria-hidden="true" className="h-3.5 w-3.5" />
                              ) : action.id === "capture_result" ? (
                                <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
                              ) : (
                                <BrainCircuit aria-hidden="true" className="h-3.5 w-3.5" />
                              )}
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                      <ul className="space-y-1">
                        {newTabResultPreview.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : newTabResultPreview ? (
                    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold text-slate-800">{newTabFilterPreview?.emptyStateMessage}</p>
                      <p className="mt-1 text-[11px] leading-4 text-slate-600">
                        title、summary、metadata、highlights、actions、run id を対象に local-only で検索しています。
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-sky-950">run を選択すると New Tab result preview が表示されます。</p>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <History aria-hidden="true" className="h-4 w-4 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dry-run History Candidate</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        confirmation から BrowserAgentRun 互換の履歴候補を作成します。まだ保存も実行もしません。
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      {historyPreviewActive ? (
                        <span className="inline-flex h-8 items-center rounded-md border border-sky-200 bg-sky-50 px-2 text-[11px] font-semibold text-sky-800">
                          local preview active
                        </span>
                      ) : null}
                      {historyCandidate ? (
                        <span className={cn("inline-flex h-8 items-center rounded-md border px-2 text-[11px] font-semibold", runStatusStyles[historyCandidate.status])}>
                          {historyCandidate.historyLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {historyCandidate ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={!historyCandidate.canAppendToHistory}
                          onClick={onAppendHistoryCandidate}
                          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                        >
                          <FileClock aria-hidden="true" className="h-3.5 w-3.5" />
                          Add to local preview
                        </button>
                        <button
                          type="button"
                          disabled={!historyPreviewActive}
                          onClick={onClearHistoryPreview}
                          className="inline-flex h-8 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          Clear preview
                        </button>
                        <button
                          type="button"
                          disabled={historyStoreCommitDisabled}
                          onClick={() => void onPersistHistoryPreview()}
                          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <HardDrive aria-hidden="true" className="h-3.5 w-3.5" />
                          {historyStoreCommitPreview?.primaryActionLabel ?? "Save preview to scheduler store"}
                        </button>
                      </div>
                      <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs leading-5 text-slate-700">{historyPreviewMessage}</p>
                      <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Store Commit Preview</p>
                            <p className="mt-1 text-xs leading-5 text-emerald-950">
                              {historyStoreCommitPreview?.reason ?? "local scheduler store に保存できる preview はまだありません。"}
                            </p>
                          </div>
                          {historyStoreCommitPreview ? (
                            <span
                              className={cn(
                                "shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold",
                                historyStoreCommitPreview.canPersist
                                  ? "border-emerald-200 bg-white text-emerald-800"
                                  : "border-slate-200 bg-slate-100 text-slate-600"
                              )}
                            >
                              {historyStoreCommitPreview.status}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-emerald-950">{historyStoreMessage}</p>
                        {!canPersist ? (
                          <span className="mt-2 inline-flex h-7 items-center rounded-md border border-emerald-200 bg-white px-2 text-[11px] font-semibold text-emerald-800">
                            Electron IPC required
                          </span>
                        ) : null}
                        {historyStoreCommitPreview ? (
                          <>
                            <div className="mt-3 grid gap-2 text-[11px] leading-4 text-slate-700 sm:grid-cols-3">
                              {historyStoreCommitPreview.metadata.map((item) => (
                                <span key={item.label} className="truncate rounded-md border border-emerald-200 bg-white px-2 py-1">
                                  {item.label}: {item.value}
                                </span>
                              ))}
                            </div>
                            <ul className="mt-3 space-y-1">
                              {historyStoreCommitPreview.checklist.map((item) => (
                                <li key={item} className="flex gap-2 text-[11px] leading-4 text-emerald-950">
                                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-3">
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          run: {historyCandidate.run.id}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          status: {historyCandidate.run.status}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          events: {historyCandidate.run.events.length}
                        </span>
                      </div>
                      <p className="text-xs leading-5 text-slate-700">{historyCandidate.summary}</p>
                      <div className="grid gap-2 md:grid-cols-3">
                        {historyCandidate.run.steps.map((step) => (
                          <div key={step.stepId} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{step.title}</p>
                              <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold", runStepStatusClassName(step.status))}>
                                {step.status}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-600">{step.message}</p>
                          </div>
                        ))}
                      </div>
                      <ul className="space-y-1">
                        {historyCandidate.notes.map((note) => (
                          <li key={note} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-600">{historyPreviewMessage}</p>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileClock aria-hidden="true" className="h-4 w-4 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Run History</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">run を選択すると下の output preview に tool と findings を表示します。</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedDetail.history.slice(0, 4).map((run) => {
                      const selectedRun = run.id === runOutputPreview?.runId;

                      return (
                        <button
                          key={run.id}
                          type="button"
                          aria-pressed={selectedRun}
                          onClick={() => onSelectRun(run.id)}
                          className={cn(
                            "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                            selectedRun ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-slate-950">{run.summary}</span>
                            <span className="mt-1 block truncate font-mono text-[11px] leading-4 text-slate-500">
                              {run.startedAt} / steps {run.stepCount}
                            </span>
                          </span>
                          <span className={cn("h-fit rounded-md border px-2 py-1 text-[11px] font-semibold", runStatusStyles[run.status])}>
                            {run.status}
                          </span>
                        </button>
                      );
                    })}
                    {selectedDetail.history.length === 0 ? (
                      <p className="text-xs leading-5 text-slate-600">run history はまだありません。</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Terminal aria-hidden="true" className="h-4 w-4 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Run Output Preview</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        選択 run の full output 相当を local preview として表示します。実行結果の永続化や外部送信は行いません。
                      </p>
                    </div>
                    {runOutputPreview ? (
                      <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", runStatusStyles[runOutputPreview.status])}>
                        {runOutputPreview.status}
                      </span>
                    ) : null}
                  </div>

                  {runOutputPreview ? (
                    <div className="mt-3 space-y-3">
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                        {runOutputPreview.metadata.map((item) => (
                          <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs leading-5 text-slate-700">{runOutputPreview.summary}</p>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <section className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Selected run tools">
                          <div className="flex items-center gap-2">
                            <Wrench aria-hidden="true" className="h-4 w-4 text-slate-700" />
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tools Used</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {runOutputPreview.toolUsage.map((tool) => (
                              <div key={tool.id} className="rounded-md border border-slate-200 bg-white p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{tool.label}</p>
                                  <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold", runStepStatusClassName(tool.status))}>
                                    {tool.status}
                                  </span>
                                </div>
                                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{tool.kind}</p>
                                <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-600">{tool.message}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                        <section className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Selected run findings">
                          <div className="flex items-center gap-2">
                            <ListChecks aria-hidden="true" className="h-4 w-4 text-slate-700" />
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Findings</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {runOutputPreview.findings.length > 0 ? (
                              runOutputPreview.findings.map((finding) => (
                                <div key={finding.id} className="rounded-md border border-slate-200 bg-white p-2">
                                  <p className={cn("text-xs font-semibold", eventLevelStyles[finding.level])}>{finding.level}</p>
                                  <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-600">{finding.message}</p>
                                  <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{finding.createdAt}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs leading-5 text-slate-600">finding はまだありません。</p>
                            )}
                          </div>
                        </section>
                      </div>
                      <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">
                        <code>{runOutputPreview.outputText}</code>
                      </pre>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-600">run を選択すると output preview が表示されます。</p>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-slate-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capture / Export Preview</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        選択 run output を Markdown capture 候補に変換します。local capture store にはまだ保存しません。
                      </p>
                    </div>
                    {runCapturePreview ? (
                      <span className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
                        {runCapturePreview.storageMode}
                      </span>
                    ) : null}
                  </div>

                  {runCapturePreview ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void onCopy(runCapturePreview.markdown, "Scheduled run Markdown")}
                          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                        >
                          <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                          Copy Markdown
                        </button>
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-8 cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500"
                        >
                          Save capture pending
                        </button>
                      </div>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                        {runCapturePreview.metadata.map((item) => (
                          <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                      <ul className="space-y-1">
                        {runCapturePreview.warnings.map((warning) => (
                          <li key={warning} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                      <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">
                        <code>{runCapturePreview.markdown}</code>
                      </pre>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-600">run output を選択すると capture preview が表示されます。</p>
                  )}
                </div>

                <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Capture Save Confirmation</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-emerald-950">
                        Markdown capture 候補を保存前に確認し、確認後に local capture store へ selection capture として保存します。
                      </p>
                    </div>
                    {captureSaveConfirmation ? (
                      <span className="shrink-0 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800">
                        {captureSaveConfirmation.status}
                      </span>
                    ) : null}
                  </div>

                  {captureSaveConfirmation ? (
                    <div className="mt-3 space-y-3 rounded-md border border-emerald-200 bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">{captureSaveConfirmation.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{captureSaveConfirmation.policyReason}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={onConfirmCaptureSave}
                            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-medium text-white transition-colors duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                          >
                            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                            {captureSaveConfirmation.primaryActionLabel}
                          </button>
                          <button
                            type="button"
                            disabled={capturePersistDisabled}
                            onClick={() => void onPersistCapture()}
                            className={cn(
                              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                              capturePersistDisabled
                                ? "border-slate-200 bg-slate-100 text-slate-500"
                                : "cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white"
                            )}
                          >
                            <HardDrive aria-hidden="true" className="h-3.5 w-3.5" />
                            {capturePersistLabel}
                          </button>
                          <button
                            type="button"
                            disabled={captureKnowledgeDisabled}
                            onClick={onAddCaptureToKnowledge}
                            className={cn(
                              "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                              captureKnowledgeDisabled
                                ? "border-slate-200 bg-slate-100 text-slate-500"
                                : "cursor-pointer border-sky-200 bg-sky-50 text-sky-800 hover:bg-white"
                            )}
                          >
                            <BrainCircuit aria-hidden="true" className="h-3.5 w-3.5" />
                            {captureKnowledgeLabel}
                          </button>
                        </div>
                      </div>
                      <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-5 text-emerald-950">
                        {captureSaveMessage}
                      </p>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                        {captureSaveConfirmation.metadata.map((item) => (
                          <span key={item.label} className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                            {item.label}: {item.value}
                          </span>
                        ))}
                      </div>
                      <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          title: {captureSaveConfirmation.proposedCapture.title}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          kind: {captureSaveConfirmation.proposedCapture.kind}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          saved: {captureSaveConfirmation.proposedCapture.savedAt}
                        </span>
                        <span className="truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          chars: {captureSaveConfirmation.proposedCapture.markdownCharacters}
                        </span>
                      </div>
                      {captureStoreDraft ? (
                        <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                          {captureStoreDraft.metadata.map((item) => (
                            <span key={item.label} className="truncate rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1">
                              {item.label}: {item.value}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {captureKnowledgeDraft ? (
                        <div className="grid gap-2 text-[11px] leading-4 text-slate-600 sm:grid-cols-4">
                          {captureKnowledgeDraft.metadata.map((item) => (
                            <span key={item.label} className="truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-1">
                              {item.label}: {item.value}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <ul className="space-y-1">
                        {captureSaveConfirmation.checklist.map((item) => (
                          <li key={item} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {captureStoreDraft?.checklist.map((item) => (
                          <li key={item} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {captureKnowledgeDraft?.checklist.map((item) => (
                          <li key={item} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="line-clamp-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] leading-4 text-slate-600">
                        {captureSaveConfirmation.proposedCapture.bodyPreview}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-emerald-950">
                      capture preview が作成されると保存前確認が表示されます。
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-5 text-slate-600">scheduled task を選択すると detail が表示されます。</p>
            )}
          </section>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-600">Scheduled Tasks Manager に表示できる task はまだありません。</p>
      )}
    </div>
  );
}

function ChatHubPreviewPanel({
  panel,
  hub,
  onSelectProvider,
  onPaneCountChange,
  onAttachScreenshot,
  onReset
}: {
  panel: BrowserChatPanelPreview;
  hub: BrowserHubComparisonPreview;
  onSelectProvider: (providerId: BrowserChatProviderId) => void;
  onPaneCountChange: (paneCount: BrowserHubPaneCount) => void;
  onAttachScreenshot: () => void;
  onReset: () => void;
}): ReactElement {
  return (
    <div className="rounded-md border border-sky-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <h3 className="text-sm font-semibold text-slate-950">Chat & Hub Preview</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            現在ページの context を side chat に集約し、同じ prompt を Hub panes に展開する clean-room preview です。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
            {panel.shortcutLabel}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            {panel.providerCycleShortcutLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">{panel.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{panel.localOnlyNotice}</p>
          </div>
          <span className="shrink-0 rounded-md border border-sky-200 bg-white px-2 py-1 text-[11px] font-semibold text-sky-800">
            {panel.activeProviderLabel}
          </span>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {panel.providers.map((provider) => {
            const active = provider.id === panel.activeProviderId;

            return (
              <button
                key={provider.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectProvider(provider.id)}
                className={cn(
                  "min-w-0 cursor-pointer rounded-md border p-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                  active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">{provider.label}</span>
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", active ? "border-white/30 bg-white/10 text-white" : chatProviderStatusStyles[provider.status])}>
                    {provider.status}
                  </span>
                </span>
                <span className={cn("mt-1 block line-clamp-2 text-[11px] leading-4", active ? "text-slate-200" : "text-slate-600")}>
                  {provider.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3" aria-label="Chat context preview">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ClipboardCheck aria-hidden="true" className="h-4 w-4 text-slate-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Context</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{panel.contextSummary}</p>
            </div>
            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {panel.tokenBudgetLabel}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {panel.contextItems.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{item.label}</p>
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", chatContextStateStyles[item.state])}>
                    {item.state}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] leading-4 text-slate-600">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {panel.toolbarActions.map((action) => {
              const Icon =
                action.id === "copy_context"
                  ? Copy
                  : action.id === "attach_screenshot"
                    ? ImageIcon
                    : action.id === "reset_chat"
                      ? RefreshCw
                      : action.id === "open_external"
                        ? ExternalLink
                        : PanelRightOpen;
              const actionable = action.id === "reset_chat" || (action.id === "attach_screenshot" && action.enabled);

              return (
                <button
                  key={action.id}
                  type="button"
                  title={action.reason}
                  disabled={!action.enabled && !actionable}
                  onClick={() => {
                    if (action.id === "attach_screenshot") {
                      onAttachScreenshot();
                      return;
                    }
                    if (action.id === "reset_chat") {
                      onReset();
                    }
                  }}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-md border px-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                    action.enabled && actionable
                      ? "cursor-pointer border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                      : action.enabled
                        ? "border-sky-200 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3" aria-label="Hub comparison preview">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Columns3 aria-hidden="true" className="h-4 w-4 text-slate-700" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{hub.title}</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{hub.promptMirrorLabel}</p>
            </div>
            <div className="flex shrink-0 gap-1" role="group" aria-label="Hub pane count">
              {hub.panelSelector.map((paneCount) => (
                <button
                  key={paneCount}
                  type="button"
                  aria-pressed={hub.paneCount === paneCount}
                  onClick={() => onPaneCountChange(paneCount)}
                  className={cn(
                    "h-7 w-7 cursor-pointer rounded-md border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                    hub.paneCount === paneCount
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {paneCount}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {hub.panes.map((pane) => (
              <div
                key={pane.id}
                className={cn(
                  "min-w-0 rounded-md border p-2",
                  pane.selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{pane.title}</p>
                  <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", hubPaneStatusStyles[pane.status])}>
                    {pane.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] leading-4 text-slate-600">{pane.providerLabel}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{pane.contextRoute}</p>
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-[11px] font-semibold text-slate-950">{pane.responseTitle}</p>
                    <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", hubResponseStateStyles[pane.responseState])}>
                      {pane.responseState}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-4 text-[11px] leading-4 text-slate-600">{pane.responsePreview}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                      {pane.evidenceLabel}
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                      {pane.privacyLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!pane.sendEnabled}
                    title={pane.executionLabel}
                    className="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-2 text-[11px] font-semibold text-slate-500 disabled:cursor-not-allowed"
                  >
                    {pane.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-1">
            {[...hub.comparisonChecks, ...hub.guardrails].map((guardrail) => (
              <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ConnectAppsPreviewPanel({ preview }: { preview: BrowserAppConnectorsPreview }): ReactElement {
  return (
    <div className="rounded-md border border-cyan-200 bg-white p-4" aria-label="Connect Apps preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Plug aria-hidden="true" className="h-4 w-4 text-cyan-700" />
            <h3 className="text-sm font-semibold text-slate-950">{preview.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview.localOnlyNotice}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1">
          {preview.stats.map((stat) => (
            <span key={stat.label} className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-800">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-800" />
            <p className="min-w-0 text-xs font-semibold text-cyan-950">{preview.workspaceName}</p>
          </div>
          <span className="rounded-md border border-cyan-200 bg-white px-2 py-1 text-[11px] font-semibold text-cyan-800">
            Recommended: {preview.recommendedConnectorIds.length}
          </span>
        </div>
        <ul className="mt-2 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-cyan-950">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-800" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {preview.connectors.map((connector) => (
          <ConnectAppConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}

function ConnectAppConnectorCard({ connector }: { connector: BrowserAppConnector }): ReactElement {
  const Icon = connector.category === "browser" ? Network : connector.category === "ai" ? BrainCircuit : Plug;

  return (
    <article className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-700" />
            <p className="min-w-0 text-sm font-semibold text-slate-950">{connector.name}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{connector.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {connector.recommended ? (
            <span className="rounded-md border border-cyan-200 bg-white px-2 py-1 text-[10px] font-semibold text-cyan-800">recommended</span>
          ) : null}
          <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", appConnectorCategoryStyles[connector.category])}>
            {connector.category}
          </span>
          <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", appConnectorStatusStyles[connector.status])}>
            {connector.statusLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {connector.scopes.map((scope) => (
          <div key={scope.id} className="rounded-md border border-slate-200 bg-white p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-slate-950">{scope.label}</p>
              <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", appConnectorScopeStyles[scope.decision])}>
                {scope.decision}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">{scope.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {connector.actions.map((action) => {
          const ActionIcon = action.id === "connect" ? ExternalLink : action.id === "manual" ? RefreshCw : action.id === "disconnect" ? Power : ShieldCheck;

          return (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              aria-label={`${connector.name}: ${action.label}`}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 disabled:cursor-not-allowed",
                action.enabled
                  ? action.id === "connect"
                    ? "cursor-pointer border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    : "cursor-pointer border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              )}
            >
              <ActionIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-white p-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Manual fallback</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-600">{connector.manualFallback}</p>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">Last checked: {connector.lastCheckedLabel}</p>
      </div>

      <ul className="mt-3 space-y-1">
        {connector.guardrails.map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-700" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SmartNudgesPreviewPanel({ preview }: { preview: BrowserSmartNudgePreview }): ReactElement {
  return (
    <div className="rounded-md border border-teal-200 bg-white p-4" aria-label="Smart Nudges preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-teal-700" />
            <h3 className="text-sm font-semibold text-slate-950">{preview.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview.localOnlyNotice}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1">
          {preview.stats.map((stat) => (
            <span key={stat.label} className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-800">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      </div>

      {preview.cards.length > 0 ? (
        <div className="mt-3 grid gap-3">
          {preview.cards.map((card) => (
            <SmartNudgeCardPreview key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">No active nudge</p>
          <ul className="mt-2 space-y-1">
            {preview.suppressedReasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview.cards.length > 0 && preview.suppressedReasons.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {preview.suppressedReasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-[11px] leading-4 text-slate-600">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SmartNudgeCardPreview({ card }: { card: BrowserSmartNudgeCard }): ReactElement {
  const Icon = card.type === "app_connection" ? Plug : Calendar;

  return (
    <article className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-sm font-semibold text-slate-950">{card.title}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{card.description}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold", smartNudgeTypeStyles[card.type])}>
          {card.type}
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {[card.primaryAction, card.secondaryAction].map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-not-allowed",
              action.id === card.primaryAction.id
                ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            )}
          >
            {action.id === "connect_app" || action.id === "schedule_task" ? (
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2">
        <section className="rounded-md border border-slate-200 bg-white p-2" aria-label={`${card.title} details`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Trigger</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-600">{card.triggerLabel}</p>
          <p className="mt-2 truncate font-mono text-[10px] leading-4 text-slate-500">{card.localStateKey}</p>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-2" aria-label={`${card.title} guardrails`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Guardrails</p>
          <ul className="mt-1 space-y-1">
            {card.guardrails.map((guardrail) => (
              <li key={guardrail} className="flex gap-1.5 text-[11px] leading-4 text-slate-600">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 text-teal-700" />
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ul className="mt-3 space-y-1">
        {card.details.map((detail) => (
          <li key={detail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function CoworkPreviewPanel({ preview }: { preview: BrowserCoworkPreview }): ReactElement {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4" aria-label="Cowork browser and files preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <HardDrive aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-950">Cowork Workspace Preview</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            browser research と workspace file operation を同じ review plan にまとめます。実 file write と command 実行は開始しません。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
            ready {preview.readyCount}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            review {preview.reviewCount}
          </span>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
            blocked {preview.blockedCount}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-950">{preview.title}</p>
            <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{preview.workspaceRootLabel}</p>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            {preview.operationCount} ops
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {preview.details.map((detail) => (
            <span key={detail} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600">
              {detail}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {preview.operations.map((operation) => {
          const OperationIcon =
            operation.kind === "browser_research"
              ? Search
              : operation.kind === "command_preview"
                ? Terminal
                : operation.kind === "artifact_review"
                  ? ClipboardCheck
                  : FileClock;

          return (
            <article key={operation.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <OperationIcon aria-hidden="true" className="h-4 w-4 text-slate-700" />
                    <p className="text-xs font-semibold text-slate-950">{operation.title}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-600">{operation.detail}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", coworkOperationStatusStyles[operation.status])}>
                    {operation.status}
                  </span>
                  <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", coworkRiskStyles[operation.risk])}>
                    {operation.risk}
                  </span>
                </div>
              </div>
              <dl className="mt-2 grid gap-2 text-[11px] leading-4 text-slate-600 md:grid-cols-3">
                <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                  <dt className="font-semibold uppercase tracking-normal text-slate-500">Input</dt>
                  <dd className="mt-0.5 truncate">{operation.inputLabel}</dd>
                </div>
                <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                  <dt className="font-semibold uppercase tracking-normal text-slate-500">Output</dt>
                  <dd className="mt-0.5 truncate">{operation.outputLabel}</dd>
                </div>
                <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                  <dt className="font-semibold uppercase tracking-normal text-slate-500">Scope</dt>
                  <dd className="mt-0.5 truncate">{operation.scopeLabel}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Cowork artifact drafts">
          <div className="flex items-center gap-2">
            <FileClock aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Artifact Drafts</p>
          </div>
          <div className="mt-2 space-y-2">
            {preview.artifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-md border border-slate-200 bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{artifact.title}</p>
                  <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {artifact.format}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{artifact.fileName}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-600">{artifact.reason}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-3" aria-label="Cowork guardrails">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guardrails</p>
          </div>
          <ul className="mt-2 space-y-1">
            {preview.guardrails.map((guardrail) => (
              <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-700" />
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!preview.canRun}
            title="この切片では plan review だけを表示します。"
            className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:cursor-not-allowed"
          >
            <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
            {preview.primaryActionLabel}
          </button>
        </section>
      </div>
    </section>
  );
}

function WorkflowGraphDraftPanel({ draft }: { draft: BrowserWorkflowGraphDraft }): ReactElement {
  return (
    <section className="rounded-md border border-sky-200 bg-white p-4" aria-label="Workflow Graph Draft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <h3 className="text-sm font-semibold text-slate-950">Workflow Graph Draft</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{draft.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
            {draft.nodeCount} nodes
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            {draft.approvalGateCount} gates
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-950">{draft.title}</p>
            <p className="mt-1 truncate text-[11px] leading-4 text-slate-500">{draft.workspaceName}</p>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            {draft.source}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {draft.details.map((detail) => (
            <span key={detail} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600">
              {detail}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {draft.nodes.map((node, index) => {
          const nextEdge = draft.edges.find((edge) => edge.fromNodeId === node.id);

          return (
            <div key={node.id}>
              <article className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-md border border-border bg-slate-50 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-semibold text-sky-800 ring-1 ring-border">
                  {node.step}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-950">{node.title}</p>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", workflowNodeStatusStyles[node.status])}>
                        {node.status}
                      </span>
                      {node.approvalRequired ? (
                        <span className="rounded-md border border-amber-200 bg-white px-2 py-1 text-[10px] font-semibold text-amber-800">
                          approval
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{node.detail}</p>
                  <dl className="mt-2 grid gap-2 text-[11px] leading-4 text-slate-600 md:grid-cols-3">
                    <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                      <dt className="font-semibold uppercase tracking-normal text-slate-500">Tool</dt>
                      <dd className="mt-0.5 truncate">{node.toolLabel}</dd>
                    </div>
                    <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                      <dt className="font-semibold uppercase tracking-normal text-slate-500">Input</dt>
                      <dd className="mt-0.5 truncate">{node.inputLabel}</dd>
                    </div>
                    <div className="min-w-0 rounded-md bg-white px-2 py-1.5 ring-1 ring-slate-200">
                      <dt className="font-semibold uppercase tracking-normal text-slate-500">Output</dt>
                      <dd className="mt-0.5 truncate">{node.outputLabel}</dd>
                    </div>
                  </dl>
                </div>
              </article>
              {nextEdge && index < draft.nodes.length - 1 ? (
                <div className="ml-4 flex items-center gap-2 py-1 text-[10px] font-semibold uppercase tracking-normal text-slate-400">
                  <span className="h-4 w-px bg-slate-300" aria-hidden="true" />
                  <span className="truncate">{nextEdge.label}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <ul className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          {draft.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-start gap-2 md:justify-end">
          <button
            type="button"
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 text-xs font-medium text-sky-800 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
          >
            <Network aria-hidden="true" className="h-3.5 w-3.5" />
            Review graph
          </button>
          <button
            type="button"
            disabled={!draft.canSave}
            title={draft.canSave ? "workflow draft を保存できます。" : "local workflow store はまだ接続していません。"}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-medium text-slate-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed"
          >
            <ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />
            {draft.saveLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function AgentSoulPreviewPanel({
  preview,
  instructionDraft,
  onInstructionDraftChange
}: {
  preview: BrowserSoulPreview;
  instructionDraft: string;
  onInstructionDraftChange: (value: string) => void;
}): ReactElement {
  return (
    <div className="rounded-md border border-violet-200 bg-white p-4" aria-label="Agent Soul preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BrainCircuit aria-hidden="true" className="h-4 w-4 text-violet-700" />
            <h3 className="text-sm font-semibold text-slate-950">{preview.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview.localOnlyNotice}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1">
          {preview.stats.map((stat) => (
            <span key={stat.label} className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-800">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileClock aria-hidden="true" className="h-4 w-4 text-slate-700" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SOUL.md</p>
            </div>
            <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{preview.filePath}</p>
          </div>
          <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            {preview.lineCount}/{preview.lineLimit} lines
          </span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">{preview.memorySeparationNotice}</p>
      </div>

      <form className="mt-3 space-y-2" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="soul-instruction-draft" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Soul instruction draft
        </label>
        <textarea
          id="soul-instruction-draft"
          value={instructionDraft}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onInstructionDraftChange(event.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-violet-200 bg-white px-3 py-2 text-xs leading-5 text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-violet-700 focus:ring-2 focus:ring-violet-100"
        />
        <div className="rounded-md border border-violet-200 bg-violet-50 p-3" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", soulSectionStyles[preview.changePreview.targetSectionId])}>
              {preview.changePreview.targetSectionLabel}
            </span>
            <span className="rounded-md border border-violet-200 bg-white px-2 py-1 text-[11px] font-semibold text-violet-800">
              {preview.changePreview.canApply ? "review ready" : "draft required"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-700">{preview.changePreview.summary}</p>
        </div>
      </form>

      <div className="mt-3 grid gap-2">
        {preview.sections.map((section) => (
          <article key={section.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section.title}</p>
              <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold", soulSectionStyles[section.id])}>
                {section.lines.length} lines
              </span>
            </div>
            <ul className="mt-2 space-y-1">
              {section.lines.map((line) => (
                <li key={line} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-700" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {preview.actions.map((action) => {
          const Icon = action.id === "reset_default" ? RefreshCw : action.id === "open_markdown" ? FileClock : ClipboardCheck;

          return (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-violet-200 bg-violet-50 text-violet-800 hover:bg-white"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              )}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-3 space-y-1">
        {preview.guardrails.map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-700" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrowserSkillsCatalogPanel({ preview }: { preview: BrowserSkillsCatalogPreview }): ReactElement {
  return (
    <div className="rounded-md border border-sky-200 bg-white p-4" aria-label="Skills Catalog Preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <h3 className="text-sm font-semibold text-slate-950">{preview.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Task-specific instruction sets を local Markdown preview として扱い、SOUL.md / Memory と分離します。
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-1">
          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800">
            total: {preview.totalCount}
          </span>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
            active: {preview.activeCount}
          </span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
            available: {preview.availableCount}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            review: {preview.reviewCount}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="min-w-0 rounded-md border border-sky-200 bg-sky-50 p-3" aria-label="Recommended skill">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-sky-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Recommended Skill</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">{preview.recommendedSkillTitle}</p>
          <p className="mt-1 truncate font-mono text-[11px] leading-4 text-sky-900">{preview.recommendedSkillId}</p>
        </section>

        <section className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Skills catalog details">
          <div className="flex items-center gap-2">
            <FileClock aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Local Catalog</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {preview.details.map((detail) => (
              <span key={detail} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                {detail}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        {preview.skills.map((skill) => (
          <article key={skill.id} className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-950">{skill.title}</p>
                <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{skill.localFilePath}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", skillCategoryStyles[skill.category])}>
                  {skill.category}
                </span>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", skillStatusStyles[skill.status])}>
                  {skill.status}
                </span>
                <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", skillRiskStyles[skill.risk])}>
                  {skill.risk}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">{skill.description}</p>
            <ul className="mt-2 space-y-1">
              {skill.instructionPreview.map((line) => (
                <li key={line} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1">
              {skill.appliesToModes.map((mode) => (
                <span key={mode} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
                  {mode}
                </span>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-slate-200 bg-white p-2">
              <p className="text-[11px] font-semibold text-slate-700">Output contract</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">{skill.outputContract}</p>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">{skill.reviewReason}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {preview.actions.map((action) => {
          const Icon = action.id === "open_instruction" ? FileClock : action.id === "export_markdown" ? Copy : ClipboardCheck;

          return (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-sky-200 bg-sky-50 text-sky-800 hover:bg-white"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              )}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-3 grid gap-1 xl:grid-cols-2">
        {preview.guardrails.map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemoryPreviewPanel({
  preview,
  query,
  onQueryChange
}: {
  preview: BrowserMemoryPreview;
  query: string;
  onQueryChange: (query: string) => void;
}): ReactElement {
  return (
    <div className="rounded-md border border-emerald-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <HardDrive aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-semibold text-slate-950">{preview.title}</h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview.localOnlyNotice}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          {preview.stats.map((stat) => (
            <span key={stat.label} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      </div>

      <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={(event) => event.preventDefault()}>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Memory recall query</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)}
            placeholder="workspace / OCI GenAI / clean-room / current page"
            className="h-8 w-full rounded-md border border-emerald-200 bg-white pl-8 pr-3 text-xs text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <button
          type="button"
          aria-label="Clear recall search"
          disabled={query.length === 0}
          onClick={() => onQueryChange("")}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
          Clear
        </button>
        <span className="inline-flex h-8 items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-800">
          {preview.recallMatches.length} recall matches
        </span>
      </form>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MemoryTierPanel title="CORE.md" filePath={preview.coreFilePath} entries={preview.coreEntries} />
        <MemoryTierPanel title="Daily note" filePath={preview.dailyFilePath} entries={preview.dailyEntries} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <section className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-3" aria-label="Memory recall results">
          <div className="flex items-center gap-2">
            <BrainCircuit aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recall Before Answer</p>
          </div>
          <div className="mt-3 space-y-2">
            {preview.recallMatches.map((match) => (
              <div key={match.id} className="rounded-md border border-slate-200 bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{match.title}</p>
                  <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {match.tier} / {match.scoreLabel}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{match.snippet}</p>
              </div>
            ))}
            {preview.recallMatches.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
                matching memory はありません。query を変えるか、page / capture から daily note 候補を作成します。
              </p>
            ) : null}
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3" aria-label="Memory review actions">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review Actions</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.actions.map((action) => {
              const Icon = action.id === "forget_review" ? Trash2 : action.id === "promote_to_core" ? HardDrive : ClipboardCheck;

              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={!action.enabled}
                  title={action.reason}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed",
                    action.enabled
                      ? "cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white"
                      : "border-slate-200 bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1">
            {preview.guardrails.map((guardrail) => (
              <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                <span>{guardrail}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function MemoryTierPanel({ title, filePath, entries }: { title: string; filePath: string; entries: BrowserMemoryEntry[] }): ReactElement {
  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3" aria-label={`${title} memory entries`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileClock aria-hidden="true" className="h-4 w-4 text-slate-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] leading-4 text-slate-500">{filePath}</p>
        </div>
        <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
          {entries.length} entries
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-950">{entry.title}</p>
              <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", memoryEntryStatusStyles[entry.status])}>
                {entry.status}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600">{entry.body}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">{entry.kind}</span>
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">{entry.retentionLabel}</span>
              {entry.metadata.map((item) => (
                <span key={item.label} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SummaryBadge({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: BrowserAgentPlan["steps"][number]["risk"];
}): ReactElement {
  return (
    <span className={cn("rounded-md border px-2 py-1 text-[11px] font-semibold", stepToneStyles[tone])}>
      {label} {value}
    </span>
  );
}

function ModeList({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 text-sky-700" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-5 text-slate-600">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniListPanel({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 text-sky-700" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-xs leading-5 text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatConnector(connector: { name: string; scope: string; status: string }): string {
  return `${connector.name}: ${connector.status} / ${connector.scope}`;
}

function formatScheduledTask(task: { name: string; cadence: string; status: string }): string {
  return `${task.name}: ${task.cadence} / ${task.status}`;
}
