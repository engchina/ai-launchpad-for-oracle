import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BrowserMcpAuditEvent, BrowserMcpAuditEventPayload } from "../shared/api";

type BrowserMcpAuditStoreFile = {
  version: 1;
  events: BrowserMcpAuditEvent[];
};

const storeFileName = "browser-mcp-audit.json";
const defaultMaxEvents = 200;

function getStoreDir(baseDir: string): string {
  return join(baseDir, "browser-mcp-audit-store");
}

function getStorePath(baseDir: string): string {
  return join(getStoreDir(baseDir), storeFileName);
}

async function readStore(baseDir: string): Promise<BrowserMcpAuditStoreFile> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as BrowserMcpAuditStoreFile;
    return {
      version: 1,
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return {
      version: 1,
      events: []
    };
  }
}

async function writeStore(baseDir: string, store: BrowserMcpAuditStoreFile): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function createAuditEvent(payload: BrowserMcpAuditEventPayload): BrowserMcpAuditEvent {
  return {
    ...payload,
    id: payload.id ?? randomUUID()
  };
}

export async function appendBrowserMcpAuditEvent(
  baseDir: string,
  payload: BrowserMcpAuditEventPayload,
  maxEvents = defaultMaxEvents
): Promise<BrowserMcpAuditEvent> {
  const event = createAuditEvent(payload);
  const store = await readStore(baseDir);
  const events = [event, ...store.events.filter((item) => item.id !== event.id)].slice(0, maxEvents);
  await writeStore(baseDir, {
    version: 1,
    events
  });
  return event;
}

export async function listBrowserMcpAuditEvents(baseDir: string, limit = defaultMaxEvents): Promise<BrowserMcpAuditEvent[]> {
  return (await readStore(baseDir)).events.slice(0, limit);
}

export async function clearBrowserMcpAuditEvents(baseDir: string): Promise<void> {
  await rm(getStoreDir(baseDir), { recursive: true, force: true });
}
