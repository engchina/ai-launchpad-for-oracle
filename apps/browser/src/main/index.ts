import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import type {
  AskPagePayload,
  CapturedPagePayload,
  OracleVectorSearchExecutionPayload,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";
import { ingestTextDocument, MAX_TEXT_DOCUMENT_BYTES } from "../shared/documentIngestion";
import { answerRagQuestion } from "../shared/rag";
import { LocalConnectorProcessClient } from "./localConnectorProcessClient";

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

const localConnector = new LocalConnectorProcessClient();

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

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.oracle.ai-launchpad.browser");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("browser:save-page", (_, payload: CapturedPagePayload) => ({
    ok: true,
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    payload
  }));

  ipcMain.handle("browser:save-selection", (_, payload: SaveSelectionPayload) => ({
    ok: true,
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    payload
  }));

  ipcMain.handle("browser:save-screenshot", (_, payload: SaveScreenshotPayload) => ({
    ok: true,
    id: randomUUID(),
    savedAt: new Date().toISOString(),
    payload
  }));

  ipcMain.handle("browser:ask-page", (_, payload: AskPagePayload) => ({
    answer: `${payload.title} の内容を、現在のワークスペース向けに要約しました。Oracle AI Database、OCI Generative AI、PoC 準備に関係する前提条件と手順を優先して確認してください。`,
    sources: [
      {
        title: payload.title,
        url: payload.url
      }
    ]
  }));

  ipcMain.handle("rag:ask-knowledge", (_, payload: RagAskPayload) => answerRagQuestion(payload));

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

    return ingestTextDocument({
      fileName: basename(filePath),
      sourcePath: filePath,
      text,
      documentId: `document-${randomUUID()}`,
      importedAt: new Date().toISOString()
    });
  });

  ipcMain.handle("local-connector:health", () => localConnector.health());

  ipcMain.handle("local-connector:oci-check-config", () => localConnector.ociCheckConfig());

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
