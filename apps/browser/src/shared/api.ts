import type { IngestTextDocumentResult } from "./documentIngestion";
import type { BrowserMcpRequest, BrowserMcpResponse } from "./browserMcpProtocol";
import type {
  BrowserMcpApprovalDecision,
  BrowserMcpApprovalDecisionPayload,
  BrowserMcpApprovalDecisionStatus
} from "./browserMcpApprovalDecision";
import type { BrowserSchedulerTaskDraft, BrowserSchedulerTaskPayload } from "./browserSchedulerRegistry";
import type { OracleVectorSearchExecutionPayload, OracleVectorSearchExecutionResult } from "./oracleVectorSearch";
import type { RagAskPayload, RagAskResult } from "./rag";

export type PageSourceType = "oracle_docs" | "oci_console" | "livelabs" | "github" | "other";
export type CaptureKind = "page" | "selection" | "screenshot";
export type BrowserViewCommand = "reload" | "force_reload" | "reset_zoom" | "zoom_in" | "zoom_out";

export type {
  IngestTextDocumentPayload,
  IngestTextDocumentResult,
  KnowledgeDocument,
  SupportedTextDocumentExtension
} from "./documentIngestion";

export type {
  OracleVectorSearchExecutionPayload,
  OracleVectorSearchExecutionResult,
  OracleVectorSearchPlan
} from "./oracleVectorSearch";

export type {
  OracleVectorSearchConfig,
  RagAdapterHealth,
  RagAdapterId,
  RagAdapterStatus,
  RagAskPayload,
  RagAskResult,
  RagChunk,
  RagSearchResult,
  RagSourceKind
} from "./rag";

export type {
  BrowserAgentAction,
  BrowserAgentActionKind,
  BrowserAgentActionRisk,
  BrowserAgentApprovalState,
  BrowserAgentPlan,
  BrowserAgentPlanContext,
  BrowserAgentPlanStep,
  BrowserAgentStepStatus,
  CreateBrowserAgentPlanPayload
} from "./agentActions";

export type {
  BrowserAgentRun,
  BrowserAgentRunEvent,
  BrowserAgentRunEventLevel,
  BrowserAgentRunStatus,
  BrowserAgentRunStep,
  BrowserAgentRunStepStatus
} from "./agentRuns";

export type {
  BrowserToolApproval,
  BrowserToolCatalogSummary,
  BrowserToolCategory,
  BrowserToolCategorySummary,
  BrowserToolDefinition,
  BrowserToolRuntimeScope,
  BrowserToolSafety
} from "./browserToolCatalog";

export type {
  BrowserToolInvocationAuditEvent,
  BrowserToolInvocationDraft,
  BrowserToolInvocationEventLevel,
  BrowserToolInvocationPayload,
  BrowserToolInvocationPreview,
  BrowserToolInvocationStatus
} from "./browserToolInvocation";

export type {
  BrowserToolExecutionMode,
  BrowserToolExecutionOutput,
  BrowserToolExecutionPreview,
  BrowserToolExecutionStatus
} from "./browserToolExecutor";

export type { BrowserMcpApprovalQueueItem, BrowserMcpApprovalQueueItemStatus } from "./browserMcpApprovalQueue";

export type {
  BrowserMcpApprovalDecision,
  BrowserMcpApprovalDecisionPayload,
  BrowserMcpApprovalDecisionStatus,
  BrowserMcpExecutionConfirmation
} from "./browserMcpApprovalDecision";

export type {
  BrowserMcpErrorResponse,
  BrowserMcpMethod,
  BrowserMcpRequest,
  BrowserMcpRequestBase,
  BrowserMcpResponse,
  BrowserMcpSuccessResponse,
  BrowserMcpToolDescriptor,
  BrowserMcpToolsCallRequest,
  BrowserMcpToolsCallResult,
  BrowserMcpToolsListRequest,
  BrowserMcpToolsListResult
} from "./browserMcpProtocol";

export type {
  BrowserMcpRunHistoryEntry,
  BrowserMcpRunHistorySchedulePolicy,
  BrowserMcpRunHistoryStage
} from "./browserMcpRunHistory";

export type {
  BrowserScheduleCadence,
  BrowserSchedulerApprovalPolicy,
  BrowserSchedulerRegistryPreview,
  BrowserSchedulerTaskDraft,
  BrowserSchedulerTaskPayload,
  BrowserSchedulerTaskSource,
  BrowserSchedulerTaskStatus
} from "./browserSchedulerRegistry";

export type CapturedPagePayload = {
  workspaceId: string;
  url: string;
  title: string;
  sourceType: PageSourceType;
  summary?: string;
};

export type CapturedPageRecord = {
  id: string;
  workspaceId: string;
  kind: CaptureKind;
  title: string;
  url: string;
  sourceType: PageSourceType;
  summary?: string;
  selectedText?: string;
  screenshotDataUrl?: string;
  screenshotPath?: string;
  savedAt: string;
};

export type CapturedPageResult = {
  ok: true;
  id: string;
  savedAt: string;
  capture: CapturedPageRecord;
};

export type ListCapturesResult = {
  captures: CapturedPageRecord[];
};

export type ClearCapturesResult = {
  ok: true;
  clearedAt: string;
};

export type AskPagePayload = {
  workspaceId: string;
  url: string;
  title: string;
  prompt: string;
};

export type AskPageResult = {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
};

export type SaveSelectionPayload = {
  workspaceId: string;
  url: string;
  title?: string;
  sourceType?: PageSourceType;
  selectedText: string;
};

export type SaveScreenshotPayload = {
  workspaceId: string;
  url: string;
  title: string;
  sourceType?: PageSourceType;
  screenshotDataUrl?: string;
};

export type StoredKnowledgeDocument = Extract<IngestTextDocumentResult, { ok: true }>;

export type ListTextDocumentsResult = {
  documents: StoredKnowledgeDocument[];
};

export type ClearTextDocumentsResult = {
  ok: true;
  clearedAt: string;
};

export type LocalConnectorStatus = "mock-ready" | "ready" | "unavailable";
export type LocalConnectorMode = "not-connected" | "connected" | "error";

export type LocalConnectorHealth = {
  status: LocalConnectorStatus;
  connector: "local-connector";
  mode: LocalConnectorMode;
  message?: string;
};

export type BrowserMcpLocalConnectorSummary = {
  connector: "local-connector";
  bridge: "browser-mcp";
  requestId: string;
  method: string;
  status: "ok" | "error";
  handledAt: string;
  toolCount?: number;
  executionStatus?: string;
  approvalDecisionStatus?: BrowserMcpApprovalDecisionStatus;
  errorCode?: string;
};

export type BrowserMcpLocalConnectorResult = {
  summary: BrowserMcpLocalConnectorSummary;
  response: BrowserMcpResponse;
};

export type BrowserMcpEndpointStatus = "stopped" | "starting" | "running" | "error";

export type BrowserMcpEndpointConfig = {
  host: "127.0.0.1";
  port: number;
  endpointPath: string;
  healthPath: string;
  streamPath: string;
};

export type BrowserMcpEndpointStartPayload = {
  port?: number;
  endpointPath?: string;
  healthPath?: string;
  streamPath?: string;
};

export type BrowserMcpEndpointState = {
  status: BrowserMcpEndpointStatus;
  config: BrowserMcpEndpointConfig;
  message: string;
  url?: string;
  healthUrl?: string;
  streamUrl?: string;
  sessionId?: string;
  startedAt?: string;
  stoppedAt?: string;
  error?: string;
};

export type BrowserMcpAuditEventKind =
  | "endpoint_started"
  | "endpoint_stopped"
  | "endpoint_error"
  | "health_check"
  | "stream_preview"
  | "mcp_request"
  | "http_error";

export type BrowserMcpAuditEventStatus = "ok" | "error" | "waiting_approval" | "blocked";

export type BrowserMcpAuditEvent = {
  id: string;
  kind: BrowserMcpAuditEventKind;
  status: BrowserMcpAuditEventStatus;
  occurredAt: string;
  sessionId?: string;
  httpMethod?: string;
  path?: string;
  httpStatus?: number;
  requestId?: string;
  workspaceName?: string;
  mcpMethod?: string;
  toolId?: string;
  toolCount?: number;
  executionStatus?: string;
  approvalDecisionId?: string;
  approvalDecisionStatus?: BrowserMcpApprovalDecisionStatus;
  errorCode?: string;
  message?: string;
};

export type BrowserMcpAuditEventPayload = Omit<BrowserMcpAuditEvent, "id"> & {
  id?: string;
};

export type ListBrowserMcpAuditEventsResult = {
  events: BrowserMcpAuditEvent[];
};

export type ClearBrowserMcpAuditEventsResult = {
  ok: true;
  clearedAt: string;
};

export type ListBrowserMcpApprovalDecisionsResult = {
  decisions: BrowserMcpApprovalDecision[];
};

export type SaveBrowserMcpApprovalDecisionResult = {
  decision: BrowserMcpApprovalDecision;
};

export type ClearBrowserMcpApprovalDecisionsResult = {
  ok: true;
  clearedAt: string;
};

export type ListBrowserSchedulerTasksResult = {
  tasks: BrowserSchedulerTaskDraft[];
};

export type SaveBrowserSchedulerTaskResult = {
  task: BrowserSchedulerTaskDraft;
};

export type ClearBrowserSchedulerTasksResult = {
  ok: true;
  clearedAt: string;
};

export type OciCheckConfigResult = {
  status: "ready" | "not-configured" | "invalid" | "unavailable";
  message: string;
  profile?: string;
  configPath?: string;
  keyFilePath?: string;
  missingFields?: string[];
  checks?: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>;
};

export type SqlclCheckResult = {
  status: "ready" | "not-configured" | "unavailable";
  message: string;
  executablePath?: string;
  checks?: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>;
};

export type AdbWalletCheckResult = {
  status: "ready" | "not-configured" | "invalid" | "unavailable";
  message: string;
  walletPath?: string;
  checks?: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>;
};

export type ObjectStorageCheckResult = {
  status: "ready" | "not-configured" | "invalid" | "unavailable";
  message: string;
  namespace?: string;
  bucketName?: string;
  region?: string;
  checks?: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>;
};

export type PocAssetKind =
  | "readme"
  | "sql"
  | "python"
  | "terraform"
  | "checklist"
  | "proposal"
  | "email"
  | "diagram"
  | "env"
  | "troubleshooting"
  | "demo"
  | "handover";

export type GeneratePocAssetsPayload = {
  workspaceName?: string;
  playbookTitle?: string;
  useCase?: string;
  dbSchema?: string;
  vectorTable?: string;
  objectStorageNamespace?: string;
  objectStorageBucket?: string;
  ociRegion?: string;
  embeddingModel?: string;
};

export type GeneratedPocAsset = {
  kind: PocAssetKind;
  fileName: string;
  title: string;
  content: string;
};

export type GeneratePocAssetsResult = {
  status: "generated";
  message: string;
  generatedAt: string;
  assets: GeneratedPocAsset[];
  warnings: string[];
};

export type AiLaunchpadApi = {
  browserViewCommands: {
    onCommand: (handler: (command: BrowserViewCommand) => void) => () => void;
  };
  browserApi: {
    listCaptures: () => Promise<ListCapturesResult>;
    savePage: (payload: CapturedPagePayload) => Promise<CapturedPageResult>;
    saveSelection: (payload: SaveSelectionPayload) => Promise<CapturedPageResult>;
    saveScreenshot: (payload: SaveScreenshotPayload) => Promise<CapturedPageResult>;
    clearCaptures: () => Promise<ClearCapturesResult>;
    askPage: (payload: AskPagePayload) => Promise<AskPageResult>;
  };
  ragAdapter: {
    askKnowledge: (payload: RagAskPayload) => Promise<RagAskResult>;
  };
  documentIngestion: {
    listTextDocuments: () => Promise<ListTextDocumentsResult>;
    importTextDocument: () => Promise<IngestTextDocumentResult | null>;
    clearTextDocuments: () => Promise<ClearTextDocumentsResult>;
  };
  localConnector: {
    health: () => Promise<LocalConnectorHealth>;
    ociCheckConfig: () => Promise<OciCheckConfigResult>;
    sqlclCheck: () => Promise<SqlclCheckResult>;
    adbWalletCheck: () => Promise<AdbWalletCheckResult>;
    objectStorageCheck: () => Promise<ObjectStorageCheckResult>;
    browserMcpRequest: (payload: BrowserMcpRequest) => Promise<BrowserMcpLocalConnectorResult>;
    generatePocAssets: (payload: GeneratePocAssetsPayload) => Promise<GeneratePocAssetsResult>;
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) => Promise<OracleVectorSearchExecutionResult>;
  };
  browserMcpEndpoint: {
    status: () => Promise<BrowserMcpEndpointState>;
    start: (payload?: BrowserMcpEndpointStartPayload) => Promise<BrowserMcpEndpointState>;
    stop: () => Promise<BrowserMcpEndpointState>;
    auditEvents: () => Promise<ListBrowserMcpAuditEventsResult>;
    clearAuditEvents: () => Promise<ClearBrowserMcpAuditEventsResult>;
    approvalDecisions: () => Promise<ListBrowserMcpApprovalDecisionsResult>;
    saveApprovalDecision: (payload: BrowserMcpApprovalDecisionPayload) => Promise<SaveBrowserMcpApprovalDecisionResult>;
    clearApprovalDecisions: () => Promise<ClearBrowserMcpApprovalDecisionsResult>;
  };
  schedulerRegistry: {
    listTasks: () => Promise<ListBrowserSchedulerTasksResult>;
    saveTask: (payload: BrowserSchedulerTaskPayload) => Promise<SaveBrowserSchedulerTaskResult>;
    clearTasks: () => Promise<ClearBrowserSchedulerTasksResult>;
  };
};
