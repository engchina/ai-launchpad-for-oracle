import { contextBridge, ipcRenderer } from "electron";
import type {
  AiLaunchpadApi,
  AskPagePayload,
  CapturedPagePayload,
  OracleVectorSearchExecutionPayload,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";

const api: AiLaunchpadApi = {
  browserApi: {
    savePage: (payload: CapturedPagePayload) => ipcRenderer.invoke("browser:save-page", payload),
    saveSelection: (payload: SaveSelectionPayload) => ipcRenderer.invoke("browser:save-selection", payload),
    saveScreenshot: (payload: SaveScreenshotPayload) => ipcRenderer.invoke("browser:save-screenshot", payload),
    askPage: (payload: AskPagePayload) => ipcRenderer.invoke("browser:ask-page", payload)
  },
  ragAdapter: {
    askKnowledge: (payload: RagAskPayload) => ipcRenderer.invoke("rag:ask-knowledge", payload)
  },
  documentIngestion: {
    importTextDocument: () => ipcRenderer.invoke("document:import-text")
  },
  localConnector: {
    health: () => ipcRenderer.invoke("local-connector:health"),
    ociCheckConfig: () => ipcRenderer.invoke("local-connector:oci-check-config"),
    oracleVectorSearch: (payload: OracleVectorSearchExecutionPayload) =>
      ipcRenderer.invoke("local-connector:oracle-vector-search", payload)
  }
};

contextBridge.exposeInMainWorld("aiLaunchpad", api);
