import type { IngestTextDocumentResult } from "./documentIngestion";
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

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseUrl: string;
  downloadUrl: string | null;
  assetName: string | null;
  releaseNotes: string;
  publishedAt: string | null;
}

export type AvailableRelease = UpdateCheckResult & {
  hasUpdate: true;
};

export type LocalConnectorStatus = "mock-ready" | "ready" | "unavailable";
export type LocalConnectorMode = "not-connected" | "connected" | "error";

export type LocalConnectorHealth = {
  status: LocalConnectorStatus;
  connector: "local-connector";
  mode: LocalConnectorMode;
  message?: string;
};

export type PocAssetKind =
  | "readme"
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
  genAiModel?: string;
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

export type OciGenAiSettingsStorageKind = "electron-safe-storage" | "local-file";

export type OciGenAiSettingsConfig = {
  enabled: boolean;
  baseUrl: string;
  model: string;
  project: string;
};

export type OciGenAiSettingsReadiness = {
  ready: boolean;
  missing: string[];
};

export type OciGenAiSettingsState = {
  config: OciGenAiSettingsConfig;
  hasApiKey: boolean;
  storageKind: OciGenAiSettingsStorageKind;
  updatedAt?: string;
  readiness: OciGenAiSettingsReadiness;
};

export type SaveOciGenAiSettingsPayload = Pick<OciGenAiSettingsConfig, "baseUrl" | "model" | "project"> & {
  apiKey?: string;
};

export type SaveOciGenAiSettingsResult = {
  ok: true;
  settings: OciGenAiSettingsState;
};

export type TestOciGenAiSettingsResult = {
  ok: boolean;
  settings: OciGenAiSettingsState;
  testedAt: string;
  message: string;
};

export type ClearOciGenAiApiKeyResult = {
  ok: true;
  settings: OciGenAiSettingsState;
  clearedAt: string;
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
    generatePocAssets: (payload: GeneratePocAssetsPayload) => Promise<GeneratePocAssetsResult>;
  };
  ociGenAiSettings: {
    load: () => Promise<OciGenAiSettingsState>;
    save: (payload: SaveOciGenAiSettingsPayload) => Promise<SaveOciGenAiSettingsResult>;
    test: () => Promise<TestOciGenAiSettingsResult>;
    clearApiKey: () => Promise<ClearOciGenAiApiKeyResult>;
  };
  updateApi: {
    checkForAppUpdate: () => Promise<UpdateCheckResult>;
    openUpdateUrl: (url: string) => Promise<void>;
  };
};
