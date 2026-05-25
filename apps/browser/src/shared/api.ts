import type { IngestTextDocumentResult } from "./documentIngestion";
import type { OracleVectorSearchExecutionPayload, OracleVectorSearchExecutionResult } from "./oracleVectorSearch";
import type { RagAskPayload, RagAskResult } from "./rag";

export type PageSourceType = "oracle_docs" | "oci_console" | "livelabs" | "github" | "other";

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

export type CapturedPagePayload = {
  workspaceId: string;
  url: string;
  title: string;
  sourceType: PageSourceType;
  summary?: string;
};

export type CapturedPageResult = {
  ok: true;
  id: string;
  savedAt: string;
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
  selectedText: string;
};

export type SaveScreenshotPayload = {
  workspaceId: string;
  url: string;
  title: string;
  screenshotDataUrl?: string;
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

export type AiLaunchpadApi = {
  browserApi: {
    savePage: (payload: CapturedPagePayload) => Promise<CapturedPageResult>;
    saveSelection: (payload: SaveSelectionPayload) => Promise<CapturedPageResult>;
    saveScreenshot: (payload: SaveScreenshotPayload) => Promise<CapturedPageResult>;
    askPage: (payload: AskPagePayload) => Promise<AskPageResult>;
  };
  ragAdapter: {
    askKnowledge: (payload: RagAskPayload) => Promise<RagAskResult>;
  };
  documentIngestion: {
    importTextDocument: () => Promise<IngestTextDocumentResult | null>;
  };
  localConnector: {
    health: () => Promise<LocalConnectorHealth>;
    ociCheckConfig: () => Promise<OciCheckConfigResult>;
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) => Promise<OracleVectorSearchExecutionResult>;
  };
};
