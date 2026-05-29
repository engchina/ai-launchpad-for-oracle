import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  shell,
  type Input,
  type MenuItemConstructorOptions,
  type WebContents
} from "electron";
import type {
  AskPagePayload,
  BrowserViewCommand,
  CapturedPagePayload,
  OracleVectorSearchExecutionPayload,
  RagAskResult,
  RagAskPayload,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";
import { ingestTextDocument, MAX_TEXT_DOCUMENT_BYTES } from "../shared/documentIngestion";
import { answerRagQuestion, createOracleVectorSearchRagAnswer, normalizeRagQuestion } from "../shared/rag";
import {
  getNextBrowserViewZoomFactor,
  resolveBrowserViewZoomShortcut,
  type BrowserViewZoomCommand
} from "../shared/browserViewZoom";
import { BrowserWorkspaceService } from "./browserWorkspaceService";
import { LocalConnectorProcessClient } from "./localConnectorProcessClient";
import {
  clearStoredKnowledgeDocuments,
  listStoredKnowledgeDocuments,
  saveKnowledgeDocument
} from "./localKnowledgeStore";
import { generateOciGenAiAnswer, type GenAiContext } from "./ociGenAiExecutor";

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

const localConnector = new LocalConnectorProcessClient();
const browserWorkspaceService = new BrowserWorkspaceService(getLocalStoreBaseDir);

function getLocalStoreBaseDir(): string {
  return app.getPath("userData");
}

function sendBrowserViewCommand(mainWindow: BrowserWindow, command: BrowserViewCommand): void {
  if (mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send("browser:view-command", command);
}

function applyAppZoomCommand(mainWindow: BrowserWindow, command: BrowserViewZoomCommand): void {
  if (mainWindow.isDestroyed()) {
    return;
  }

  const currentZoomFactor = mainWindow.webContents.getZoomFactor();
  const nextZoomFactor = getNextBrowserViewZoomFactor(currentZoomFactor, command);

  mainWindow.webContents.setZoomFactor(nextZoomFactor);
  sendBrowserViewCommand(mainWindow, command);
}

function findShortcutTargetWindow(contents: WebContents): BrowserWindow | null {
  const directWindow = BrowserWindow.fromWebContents(contents);
  if (directWindow) {
    return directWindow;
  }

  return BrowserWindow.fromWebContents(contents.hostWebContents);
}

function registerBrowserViewZoomShortcuts(contents: WebContents): void {
  contents.on("before-input-event", (event, input: Input) => {
    const command = resolveBrowserViewZoomShortcut(input, { isMac: process.platform === "darwin" });
    if (!command) {
      return;
    }

    const targetWindow = findShortcutTargetWindow(contents);
    if (!targetWindow) {
      return;
    }

    event.preventDefault();
    applyAppZoomCommand(targetWindow, command);
  });
}

function configureApplicationMenu(mainWindow: BrowserWindow): void {
  const viewMenu: MenuItemConstructorOptions = {
    label: "View",
    submenu: [
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: () => sendBrowserViewCommand(mainWindow, "reload")
      },
      {
        label: "Force Reload",
        accelerator: "CmdOrCtrl+Shift+R",
        click: () => sendBrowserViewCommand(mainWindow, "force_reload")
      },
      {
        label: "Toggle Developer Tools",
        accelerator: "CmdOrCtrl+Shift+I",
        click: () => mainWindow.webContents.toggleDevTools()
      },
      { type: "separator" },
      {
        label: "Actual Size",
        accelerator: "CmdOrCtrl+0",
        click: () => applyAppZoomCommand(mainWindow, "reset_zoom")
      },
      {
        label: "Zoom In",
        accelerator: "CmdOrCtrl+Plus",
        click: () => applyAppZoomCommand(mainWindow, "zoom_in")
      },
      {
        label: "Zoom Out",
        accelerator: "CmdOrCtrl+-",
        click: () => applyAppZoomCommand(mainWindow, "zoom_out")
      },
      { type: "separator" },
      {
        label: "Toggle Full Screen",
        accelerator: "F11",
        click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
      }
    ]
  };
  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" } satisfies MenuItemConstructorOptions] : []),
    { role: "fileMenu" },
    { role: "editMenu" },
    viewMenu,
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: "Oracle AI",
          click: () => {
            void shell.openExternal("https://www.oracle.com/artificial-intelligence/");
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    title: "AI Launchpad for Oracle",
    icon: join(__dirname, "../renderer/app-icon.png"),
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

  configureApplicationMenu(mainWindow);

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function collectGenAiContexts(result: RagAskResult): GenAiContext[] {
  const fromResults: GenAiContext[] = result.results.map((item) => ({
    title: item.chunk.title,
    ...(item.chunk.sourceUrl ? { sourceUrl: item.chunk.sourceUrl } : {}),
    text: item.excerpt || item.chunk.text
  }));
  const fromRows: GenAiContext[] = (result.oracleVectorSearch?.rows ?? []).map((row) => ({
    ...(row.title ? { title: row.title } : {}),
    ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
    text: row.chunkText
  }));
  return [...fromResults, ...fromRows].filter((context) => context.text.trim().length > 0);
}

// 検索済み context がある場合のみ、OCI GenAI で回答本文を実生成に差し替える。
// 無効・未設定・失敗時は deterministic answer をそのまま返す。
async function enrichAnswerWithOciGenAi(result: RagAskResult): Promise<RagAskResult> {
  const contexts = collectGenAiContexts(result);
  if (contexts.length === 0) {
    return result;
  }

  const generation = await generateOciGenAiAnswer(result.question, contexts, process.env);
  if (!generation.ok) {
    return result;
  }

  return { ...result, answer: generation.answer, answerProvider: "oci-genai" };
}

async function handleAskKnowledge(payload: RagAskPayload): Promise<RagAskResult> {
  if (payload.adapter !== "oracle-vector-search") {
    return enrichAnswerWithOciGenAi(answerRagQuestion(payload));
  }

  const startedAt = performance.now();
  const question = normalizeRagQuestion(payload.question);

  try {
    const oracleVectorSearch = await localConnector.oracleVectorSearch({
      question,
      config: payload.oracleVectorSearch,
      maxResults: payload.maxResults
    });

    const baseResult = createOracleVectorSearchRagAnswer(
      {
        ...payload,
        question
      },
      oracleVectorSearch,
      Math.round(performance.now() - startedAt)
    );

    return await enrichAnswerWithOciGenAi(baseResult);
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

  app.on("web-contents-created", (_, contents) => {
    registerBrowserViewZoomShortcuts(contents);
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
