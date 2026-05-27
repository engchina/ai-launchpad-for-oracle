import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import type {
  AskPagePayload,
  CapturedPagePayload,
  OracleVectorSearchExecutionPayload,
  RagAskResult,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";
import { ingestTextDocument, MAX_TEXT_DOCUMENT_BYTES } from "../shared/documentIngestion";
import { answerRagQuestion, createOracleVectorSearchRagAnswer, normalizeRagQuestion } from "../shared/rag";
import { BrowserWorkspaceService } from "./browserWorkspaceService";
import { LocalConnectorProcessClient } from "./localConnectorProcessClient";
import {
  clearStoredKnowledgeDocuments,
  listStoredKnowledgeDocuments,
  saveKnowledgeDocument
} from "./localKnowledgeStore";

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

const localConnector = new LocalConnectorProcessClient();
const browserWorkspaceService = new BrowserWorkspaceService(getLocalStoreBaseDir);

function getLocalStoreBaseDir(): string {
  return app.getPath("userData");
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    title: "AI Launchpad for Oracle",
    backgroundColor: "#F8FAFC",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-attach-webview", (_, webPreferences) => {
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

async function handleAskKnowledge(payload: RagAskPayload): Promise<RagAskResult> {
  if (payload.adapter !== "oracle-vector-search") {
    return answerRagQuestion(payload);
  }

  const startedAt = performance.now();
  const question = normalizeRagQuestion(payload.question);

  try {
    const oracleVectorSearch = await localConnector.oracleVectorSearch({
      question,
      config: payload.oracleVectorSearch,
      maxResults: payload.maxResults
    });

    return createOracleVectorSearchRagAnswer(
      {
        ...payload,
        question
      },
      oracleVectorSearch,
      Math.round(performance.now() - startedAt)
    );
  } catch {
    return {
      question,
      answer: "Local Connector の Oracle Vector Search 呼び出しに失敗しました。worker process と IPC 設定を確認してください。",
      results: [],
      status: "adapter_unavailable",
      adapter: "oracle-vector-search",
      adapterStatus: "unavailable",
      latencyMs: Math.round(performance.now() - startedAt)
    };
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.oracle.ai-launchpad.browser");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("browser:list-captures", () => browserWorkspaceService.listCaptures());

  ipcMain.handle("browser:save-page", (_, payload: CapturedPagePayload) => browserWorkspaceService.savePage(payload));

  ipcMain.handle("browser:save-selection", (_, payload: SaveSelectionPayload) => browserWorkspaceService.saveSelection(payload));

  ipcMain.handle("browser:save-screenshot", (_, payload: SaveScreenshotPayload) => browserWorkspaceService.saveScreenshot(payload));

  ipcMain.handle("browser:clear-captures", () => browserWorkspaceService.clearCaptures());

  ipcMain.handle("browser:ask-page", (_, payload: AskPagePayload) => browserWorkspaceService.askPage(payload));

  ipcMain.handle("rag:ask-knowledge", (_, payload: RagAskPayload) => handleAskKnowledge(payload));

  ipcMain.handle("document:list-text-documents", async () => ({
    documents: await listStoredKnowledgeDocuments(getLocalStoreBaseDir())
  }));

  ipcMain.handle("document:import-text", async () => {
    const result = await dialog.showOpenDialog({
      title: "Knowledge に追加する文書を選択",
      properties: ["openFile"],
      filters: [
        {
          name: "Text documents",
          extensions: ["md", "txt"]
        }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const fileStat = await stat(filePath);
    if (fileStat.size > MAX_TEXT_DOCUMENT_BYTES) {
      return {
        ok: false,
        code: "file_too_large",
        message: `文書サイズが上限 ${Math.round(MAX_TEXT_DOCUMENT_BYTES / 1024)} KB を超えています。`
      };
    }

    const text = await readFile(filePath, "utf8");

    const ingestionResult = ingestTextDocument({
      fileName: basename(filePath),
      sourcePath: filePath,
      text,
      documentId: `document-${randomUUID()}`,
      importedAt: new Date().toISOString()
    });

    if (ingestionResult.ok) {
      return saveKnowledgeDocument(getLocalStoreBaseDir(), ingestionResult);
    }

    return ingestionResult;
  });

  ipcMain.handle("document:clear-text-documents", async () => {
    await clearStoredKnowledgeDocuments(getLocalStoreBaseDir());
    return {
      ok: true,
      clearedAt: new Date().toISOString()
    };
  });

  ipcMain.handle("local-connector:health", () => localConnector.health());

  ipcMain.handle("local-connector:oci-check-config", () => localConnector.ociCheckConfig());

  ipcMain.handle("local-connector:sqlcl-check", () => localConnector.sqlclCheck());

  ipcMain.handle("local-connector:adb-wallet-check", () => localConnector.adbWalletCheck());

  ipcMain.handle("local-connector:object-storage-check", () => localConnector.objectStorageCheck());

  ipcMain.handle("local-connector:generate-poc-assets", (_, payload) => localConnector.generatePocAssets(payload));

  ipcMain.handle("local-connector:oracle-vector-search", (_, payload: OracleVectorSearchExecutionPayload) =>
    localConnector.oracleVectorSearch(payload)
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  localConnector.dispose();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
