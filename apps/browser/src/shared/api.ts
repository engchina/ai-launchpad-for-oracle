import type { IngestTextDocumentResult } from "./documentIngestion";
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
    generatePocAssets: (payload: GeneratePocAssetsPayload) => Promise<GeneratePocAssetsResult>;
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) => Promise<OracleVectorSearchExecutionResult>;
  };
};
