import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import type {
  AiLaunchpadApi,
  AskPagePayload,
  BrowserMcpApprovalDecisionPayload,
  BrowserMcpEndpointStartPayload,
  BrowserMcpRequest,
  BrowserSchedulerTaskPayload,
  BrowserViewCommand,
  CapturedPagePayload,
  GeneratePocAssetsPayload,
  OracleVectorSearchExecutionPayload,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";

const api: AiLaunchpadApi = {
  browserViewCommands: {
    onCommand: (handler: (command: BrowserViewCommand) => void) => {
      const listener = (_event: IpcRendererEvent, command: BrowserViewCommand): void => {
        handler(command);
      };

      ipcRenderer.on("browser:view-command", listener);
      return () => {
        ipcRenderer.removeListener("browser:view-command", listener);
      };
    }
  },
  browserApi: {
    listCaptures: () => ipcRenderer.invoke("browser:list-captures"),
    savePage: (payload: CapturedPagePayload) => ipcRenderer.invoke("browser:save-page", payload),
    saveSelection: (payload: SaveSelectionPayload) => ipcRenderer.invoke("browser:save-selection", payload),
    saveScreenshot: (payload: SaveScreenshotPayload) => ipcRenderer.invoke("browser:save-screenshot", payload),
    clearCaptures: () => ipcRenderer.invoke("browser:clear-captures"),
    askPage: (payload: AskPagePayload) => ipcRenderer.invoke("browser:ask-page", payload)
  },
  ragAdapter: {
    askKnowledge: (payload: RagAskPayload) => ipcRenderer.invoke("rag:ask-knowledge", payload)
  },
  documentIngestion: {
    listTextDocuments: () => ipcRenderer.invoke("document:list-text-documents"),
    importTextDocument: () => ipcRenderer.invoke("document:import-text"),
    clearTextDocuments: () => ipcRenderer.invoke("document:clear-text-documents")
  },
  localConnector: {
    health: () => ipcRenderer.invoke("local-connector:health"),
    ociCheckConfig: () => ipcRenderer.invoke("local-connector:oci-check-config"),
    sqlclCheck: () => ipcRenderer.invoke("local-connector:sqlcl-check"),
    adbWalletCheck: () => ipcRenderer.invoke("local-connector:adb-wallet-check"),
    objectStorageCheck: () => ipcRenderer.invoke("local-connector:object-storage-check"),
    browserMcpRequest: (payload: BrowserMcpRequest) => ipcRenderer.invoke("local-connector:browser-mcp-request", payload),
    generatePocAssets: (payload: GeneratePocAssetsPayload) => ipcRenderer.invoke("local-connector:generate-poc-assets", payload),
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) =>
      ipcRenderer.invoke("local-connector:oracle-vector-search", payload)
  },
  browserMcpEndpoint: {
    status: () => ipcRenderer.invoke("browser-mcp-endpoint:status"),
    start: (payload?: BrowserMcpEndpointStartPayload) => ipcRenderer.invoke("browser-mcp-endpoint:start", payload),
    stop: () => ipcRenderer.invoke("browser-mcp-endpoint:stop"),
    auditEvents: () => ipcRenderer.invoke("browser-mcp-endpoint:audit-events"),
    clearAuditEvents: () => ipcRenderer.invoke("browser-mcp-endpoint:clear-audit-events"),
    approvalDecisions: () => ipcRenderer.invoke("browser-mcp-endpoint:approval-decisions"),
    saveApprovalDecision: (payload: BrowserMcpApprovalDecisionPayload) =>
      ipcRenderer.invoke("browser-mcp-endpoint:save-approval-decision", payload),
    clearApprovalDecisions: () => ipcRenderer.invoke("browser-mcp-endpoint:clear-approval-decisions")
  },
  schedulerRegistry: {
    listTasks: () => ipcRenderer.invoke("scheduler-registry:list-tasks"),
    saveTask: (payload: BrowserSchedulerTaskPayload) => ipcRenderer.invoke("scheduler-registry:save-task", payload),
    clearTasks: () => ipcRenderer.invoke("scheduler-registry:clear-tasks")
  }
};

contextBridge.exposeInMainWorld("aiLaunchpad", api);
