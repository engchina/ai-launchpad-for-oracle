import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BrowserMcpApprovalDecision, BrowserMcpApprovalDecisionPayload } from "../shared/browserMcpApprovalDecision";

type BrowserMcpApprovalStoreFile = {
  version: 1;
  decisions: BrowserMcpApprovalDecision[];
};

const storeFileName = "browser-mcp-approvals.json";
const defaultMaxDecisions = 200;

function getStoreDir(baseDir: string): string {
  return join(baseDir, "browser-mcp-approval-store");
}

function getStorePath(baseDir: string): string {
  return join(getStoreDir(baseDir), storeFileName);
}

async function readStore(baseDir: string): Promise<BrowserMcpApprovalStoreFile> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as BrowserMcpApprovalStoreFile;
    return {
      version: 1,
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : []
    };
  } catch {
    return {
      version: 1,
      decisions: []
    };
  }
}

async function writeStore(baseDir: string, store: BrowserMcpApprovalStoreFile): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function createApprovalDecision(payload: BrowserMcpApprovalDecisionPayload): BrowserMcpApprovalDecision {
  return {
    ...payload,
    id: payload.id ?? randomUUID()
  };
}

export async function upsertBrowserMcpApprovalDecision(
  baseDir: string,
  payload: BrowserMcpApprovalDecisionPayload,
  maxDecisions = defaultMaxDecisions
): Promise<BrowserMcpApprovalDecision> {
  const decision = createApprovalDecision(payload);
  const store = await readStore(baseDir);
  const decisions = [decision, ...store.decisions.filter((item) => item.auditEventId !== decision.auditEventId)].slice(0, maxDecisions);

  await writeStore(baseDir, {
    version: 1,
    decisions
  });

  return decision;
}

export async function listBrowserMcpApprovalDecisions(baseDir: string, limit = defaultMaxDecisions): Promise<BrowserMcpApprovalDecision[]> {
  return (await readStore(baseDir)).decisions.slice(0, limit);
}

export async function clearBrowserMcpApprovalDecisions(baseDir: string): Promise<void> {
  await rm(getStoreDir(baseDir), { recursive: true, force: true });
}
