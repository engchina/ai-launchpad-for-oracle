import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StoredKnowledgeDocument } from "../shared/api";

type KnowledgeStoreFile = {
  version: 1;
  documents: StoredKnowledgeDocument[];
};

function getStoreDir(baseDir: string): string {
  return join(baseDir, "knowledge-store");
}

function getStorePath(baseDir: string): string {
  return join(getStoreDir(baseDir), "documents.json");
}

async function readStore(baseDir: string): Promise<KnowledgeStoreFile> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as KnowledgeStoreFile;
    return {
      version: 1,
      documents: Array.isArray(parsed.documents) ? parsed.documents : []
    };
  } catch {
    return {
      version: 1,
      documents: []
    };
  }
}

async function writeStore(baseDir: string, store: KnowledgeStoreFile): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function listStoredKnowledgeDocuments(baseDir: string): Promise<StoredKnowledgeDocument[]> {
  return (await readStore(baseDir)).documents;
}

export async function saveKnowledgeDocument(baseDir: string, entry: StoredKnowledgeDocument): Promise<StoredKnowledgeDocument> {
  const store = await readStore(baseDir);
  const documents = [entry, ...store.documents.filter((item) => item.document.id !== entry.document.id)];
  await writeStore(baseDir, {
    version: 1,
    documents
  });
  return entry;
}

export async function clearStoredKnowledgeDocuments(baseDir: string): Promise<void> {
  await rm(getStoreDir(baseDir), { recursive: true, force: true });
}
