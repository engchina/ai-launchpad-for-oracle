import { contextBridge, ipcRenderer } from "electron";
import type {
  AiLaunchpadApi,
  AskPagePayload,
  CapturedPagePayload,
  GeneratePocAssetsPayload,
  OracleVectorSearchExecutionPayload,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";

const api: AiLaunchpadApi = {
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
    generatePocAssets: (payload: GeneratePocAssetsPayload) => ipcRenderer.invoke("local-connector:generate-poc-assets", payload),
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) =>
      ipcRenderer.invoke("local-connector:oracle-vector-search", payload)
  }
};

contextBridge.exposeInMainWorld("aiLaunchpad", api);
