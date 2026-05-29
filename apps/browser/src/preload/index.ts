import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import type {
  AiLaunchpadApi,
  BrowserViewCommand,
  CapturedPagePayload,
  GeneratePocAssetsPayload,
  SaveOciGenAiSettingsPayload,
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
    clearCaptures: () => ipcRenderer.invoke("browser:clear-captures")
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
    generatePocAssets: (payload: GeneratePocAssetsPayload) => ipcRenderer.invoke("local-connector:generate-poc-assets", payload)
  },
  ociGenAiSettings: {
    load: () => ipcRenderer.invoke("oci-genai-settings:load"),
    save: (payload: SaveOciGenAiSettingsPayload) => ipcRenderer.invoke("oci-genai-settings:save", payload),
    test: () => ipcRenderer.invoke("oci-genai-settings:test"),
    clearApiKey: () => ipcRenderer.invoke("oci-genai-settings:clear-api-key")
  },
  updateApi: {
    checkForAppUpdate: () => ipcRenderer.invoke("update:check-for-update"),
    openUpdateUrl: (url: string) => ipcRenderer.invoke("update:open-url", url)
  }
};

contextBridge.exposeInMainWorld("aiLaunchpad", api);
