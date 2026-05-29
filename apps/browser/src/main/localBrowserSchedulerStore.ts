import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BrowserSchedulerTaskDraft, BrowserSchedulerTaskPayload } from "../shared/browserSchedulerRegistry";

type BrowserSchedulerStoreFile = {
  version: 1;
  tasks: BrowserSchedulerTaskDraft[];
};

const storeFileName = "browser-scheduler-tasks.json";
const defaultMaxTasks = 100;

function getStoreDir(baseDir: string): string {
  return join(baseDir, "browser-scheduler-store");
}

function getStorePath(baseDir: string): string {
  return join(getStoreDir(baseDir), storeFileName);
}

async function readStore(baseDir: string): Promise<BrowserSchedulerStoreFile> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as BrowserSchedulerStoreFile;
    return {
      version: 1,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : []
    };
  } catch {
    return {
      version: 1,
      tasks: []
    };
  }
}

async function writeStore(baseDir: string, store: BrowserSchedulerStoreFile): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function createTask(payload: BrowserSchedulerTaskPayload): BrowserSchedulerTaskDraft {
  return {
    ...payload,
    id: payload.id ?? `browser-scheduler-${randomUUID()}`
  };
}

export async function upsertBrowserSchedulerTask(
  baseDir: string,
  payload: BrowserSchedulerTaskPayload,
  maxTasks = defaultMaxTasks
): Promise<BrowserSchedulerTaskDraft> {
  const task = createTask(payload);
  const store = await readStore(baseDir);
  const tasks = [task, ...store.tasks.filter((item) => item.id !== task.id && item.sourceRunHistoryId !== task.sourceRunHistoryId)].slice(
    0,
    maxTasks
  );

  await writeStore(baseDir, {
    version: 1,
    tasks
  });

  return task;
}

export async function listBrowserSchedulerTasks(baseDir: string, limit = defaultMaxTasks): Promise<BrowserSchedulerTaskDraft[]> {
  return (await readStore(baseDir)).tasks.slice(0, limit);
}

export async function clearBrowserSchedulerTasks(baseDir: string): Promise<void> {
  await rm(getStoreDir(baseDir), { recursive: true, force: true });
}
