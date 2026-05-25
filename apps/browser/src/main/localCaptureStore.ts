import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  CapturedPagePayload,
  CapturedPageRecord,
  SaveScreenshotPayload,
  SaveSelectionPayload
} from "../shared/api";

type CaptureStoreFile = {
  version: 1;
  captures: CapturedPageRecord[];
};

const storeFileName = "captures.json";

function getStoreDir(baseDir: string): string {
  return join(baseDir, "capture-store");
}

function getStorePath(baseDir: string): string {
  return join(getStoreDir(baseDir), storeFileName);
}

function getScreenshotDir(baseDir: string): string {
  return join(getStoreDir(baseDir), "screenshots");
}

function toFileUrl(filePath: string): string {
  return `file://${filePath.replace(/\\/g, "/")}`;
}

async function readStore(baseDir: string): Promise<CaptureStoreFile> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as CaptureStoreFile;
    return {
      version: 1,
      captures: Array.isArray(parsed.captures) ? parsed.captures : []
    };
  } catch {
    return {
      version: 1,
      captures: []
    };
  }
}

async function writeStore(baseDir: string, store: CaptureStoreFile): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function createBaseCapture(
  payload: Pick<CapturedPageRecord, "workspaceId" | "title" | "url" | "sourceType"> &
    Partial<Pick<CapturedPageRecord, "summary" | "selectedText">>,
  kind: CapturedPageRecord["kind"]
): CapturedPageRecord {
  return {
    id: randomUUID(),
    workspaceId: payload.workspaceId,
    kind,
    title: payload.title,
    url: payload.url,
    sourceType: payload.sourceType,
    summary: payload.summary,
    selectedText: payload.selectedText,
    savedAt: new Date().toISOString()
  };
}

function extensionForDataUrl(dataUrl: string): string {
  const mime = dataUrl.match(/^data:([^;,]+)/)?.[1] ?? "";
  if (mime === "image/jpeg") {
    return "jpg";
  }

  if (mime === "image/webp") {
    return "webp";
  }

  if (mime === "image/svg+xml") {
    return "svg";
  }

  return "png";
}

function bufferFromDataUrl(dataUrl: string): Buffer | null {
  const match = /^data:([^,]+),(.*)$/s.exec(dataUrl);
  if (!match) {
    return null;
  }

  const metadata = match[1];
  const data = match[2];
  if (metadata.includes(";base64")) {
    return Buffer.from(data, "base64");
  }

  return Buffer.from(decodeURIComponent(data), "utf8");
}

async function writeScreenshot(baseDir: string, captureId: string, dataUrl?: string): Promise<
  | {
      path: string;
      url: string;
    }
  | undefined
> {
  if (!dataUrl) {
    return undefined;
  }

  const imageBuffer = bufferFromDataUrl(dataUrl);
  if (!imageBuffer) {
    return undefined;
  }

  const screenshotDir = getScreenshotDir(baseDir);
  await mkdir(screenshotDir, { recursive: true });
  const screenshotPath = join(screenshotDir, `${captureId}.${extensionForDataUrl(dataUrl)}`);
  await writeFile(screenshotPath, imageBuffer);
  return {
    path: screenshotPath,
    url: toFileUrl(screenshotPath)
  };
}

async function upsertCapture(baseDir: string, capture: CapturedPageRecord): Promise<CapturedPageRecord> {
  const store = await readStore(baseDir);
  const captures = [capture, ...store.captures.filter((item) => item.id !== capture.id)];
  await writeStore(baseDir, {
    version: 1,
    captures
  });
  return capture;
}

export async function listStoredCaptures(baseDir: string): Promise<CapturedPageRecord[]> {
  return (await readStore(baseDir)).captures;
}

export async function savePageCapture(baseDir: string, payload: CapturedPagePayload): Promise<CapturedPageRecord> {
  return upsertCapture(baseDir, createBaseCapture(payload, "page"));
}

export async function saveSelectionCapture(baseDir: string, payload: SaveSelectionPayload): Promise<CapturedPageRecord> {
  const capture = createBaseCapture(
    {
      workspaceId: payload.workspaceId,
      title: `選択: ${payload.title ?? payload.url}`,
      url: payload.url,
      sourceType: payload.sourceType ?? "other",
      selectedText: payload.selectedText
    },
    "selection"
  );
  return upsertCapture(baseDir, capture);
}

export async function saveScreenshotCapture(baseDir: string, payload: SaveScreenshotPayload): Promise<CapturedPageRecord> {
  const capture = createBaseCapture(
    {
      workspaceId: payload.workspaceId,
      title: `スクリーンショット: ${payload.title}`,
      url: payload.url,
      sourceType: payload.sourceType ?? "other"
    },
    "screenshot"
  );
  const screenshot = await writeScreenshot(baseDir, capture.id, payload.screenshotDataUrl);
  return upsertCapture(baseDir, {
    ...capture,
    screenshotDataUrl: screenshot?.url ?? payload.screenshotDataUrl,
    screenshotPath: screenshot?.path
  });
}

export async function clearStoredCaptures(baseDir: string): Promise<void> {
  await rm(getStoreDir(baseDir), { recursive: true, force: true });
}
