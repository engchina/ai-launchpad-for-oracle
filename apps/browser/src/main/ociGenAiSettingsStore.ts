import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  OciGenAiSettingsConfig,
  OciGenAiSettingsReadiness,
  OciGenAiSettingsState,
  OciGenAiSettingsStorageKind,
  SaveOciGenAiSettingsPayload
} from "../shared/api";
import type { OciGenAiRuntimeSettings } from "./ociGenAiExecutor";

export type OciGenAiSecretCodec = {
  kind: OciGenAiSettingsStorageKind;
  encrypt: (plainText: string) => string;
  decrypt: (storedValue: string) => string | null;
};

type StoredOciGenAiApiKey = {
  encoding: OciGenAiSettingsStorageKind;
  value: string;
};

type StoredOciGenAiSettings = {
  version: 1;
  config: OciGenAiSettingsConfig;
  apiKey?: StoredOciGenAiApiKey;
  updatedAt?: string;
};

const storeFileName = "oci-genai-settings.json";

const defaultConfig: OciGenAiSettingsConfig = {
  enabled: true,
  baseUrl: "",
  model: "",
  project: ""
};

const plainTextCodec: OciGenAiSecretCodec = {
  kind: "local-file",
  encrypt: (plainText) => plainText,
  decrypt: (storedValue) => storedValue
};

function getStorePath(baseDir: string): string {
  return join(baseDir, "settings", storeFileName);
}

function getCodec(codec?: OciGenAiSecretCodec): OciGenAiSecretCodec {
  return codec ?? plainTextCodec;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    url.pathname = url.pathname.replace(/\/+$/u, "");
    return url.toString().replace(/\/$/u, "");
  } catch {
    throw new Error("OCI GenAI endpoint は URL 形式で入力してください。");
  }
}

export function normalizeOciGenAiSettingsConfig(
  payload: Pick<OciGenAiSettingsConfig, "baseUrl" | "model" | "project"> & { enabled?: boolean }
): OciGenAiSettingsConfig {
  return {
    enabled: true,
    baseUrl: normalizeBaseUrl(payload.baseUrl),
    model: payload.model.trim(),
    project: payload.project.trim()
  };
}

export function resolveOciGenAiSettingsReadiness(
  config: OciGenAiSettingsConfig,
  hasApiKey: boolean
): OciGenAiSettingsReadiness {
  const missing: string[] = [];
  if (!config.baseUrl) {
    missing.push("Base URL");
  }
  if (!config.model) {
    missing.push("Model");
  }
  if (!hasApiKey) {
    missing.push("API key");
  }

  return {
    ready: missing.length === 0,
    missing
  };
}

function createState(
  config: OciGenAiSettingsConfig,
  hasApiKey: boolean,
  storageKind: OciGenAiSettingsStorageKind,
  updatedAt?: string
): OciGenAiSettingsState {
  return {
    config,
    hasApiKey,
    storageKind,
    ...(updatedAt ? { updatedAt } : {}),
    readiness: resolveOciGenAiSettingsReadiness(config, hasApiKey)
  };
}

async function readStore(baseDir: string): Promise<StoredOciGenAiSettings> {
  try {
    const content = await readFile(getStorePath(baseDir), "utf8");
    const parsed = JSON.parse(content) as Partial<StoredOciGenAiSettings>;
    return {
      version: 1,
      config: normalizeOciGenAiSettingsConfig({
        enabled: parsed.config?.enabled === true,
        baseUrl: parsed.config?.baseUrl ?? "",
        model: parsed.config?.model ?? "",
        project: parsed.config?.project ?? ""
      }),
      ...(parsed.apiKey?.value ? { apiKey: parsed.apiKey } : {}),
      ...(parsed.updatedAt ? { updatedAt: parsed.updatedAt } : {})
    };
  } catch {
    return {
      version: 1,
      config: defaultConfig
    };
  }
}

async function writeStore(baseDir: string, store: StoredOciGenAiSettings): Promise<void> {
  const storePath = getStorePath(baseDir);
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function readStoredApiKey(store: StoredOciGenAiSettings, codec: OciGenAiSecretCodec): string | null {
  if (!store.apiKey?.value) {
    return null;
  }

  if (store.apiKey.encoding === "local-file") {
    return store.apiKey.value.trim() || null;
  }

  if (store.apiKey.encoding !== codec.kind) {
    return null;
  }

  return codec.decrypt(store.apiKey.value)?.trim() || null;
}

export async function loadOciGenAiSettings(
  baseDir: string,
  codec?: OciGenAiSecretCodec
): Promise<OciGenAiSettingsState> {
  const activeCodec = getCodec(codec);
  const store = await readStore(baseDir);
  const apiKey = readStoredApiKey(store, activeCodec);
  return createState(store.config, Boolean(apiKey), activeCodec.kind, store.updatedAt);
}

export async function saveOciGenAiSettings(
  baseDir: string,
  payload: SaveOciGenAiSettingsPayload,
  codec?: OciGenAiSecretCodec
): Promise<OciGenAiSettingsState> {
  const activeCodec = getCodec(codec);
  const previous = await readStore(baseDir);
  const nextStore: StoredOciGenAiSettings = {
    version: 1,
    config: normalizeOciGenAiSettingsConfig(payload),
    ...(previous.apiKey ? { apiKey: previous.apiKey } : {}),
    updatedAt: new Date().toISOString()
  };

  const nextApiKey = payload.apiKey?.trim();
  if (nextApiKey) {
    nextStore.apiKey = {
      encoding: activeCodec.kind,
      value: activeCodec.encrypt(nextApiKey)
    };
  }

  await writeStore(baseDir, nextStore);
  const apiKey = readStoredApiKey(nextStore, activeCodec);
  return createState(nextStore.config, Boolean(apiKey), activeCodec.kind, nextStore.updatedAt);
}

export async function clearOciGenAiApiKey(
  baseDir: string,
  codec?: OciGenAiSecretCodec
): Promise<OciGenAiSettingsState> {
  const activeCodec = getCodec(codec);
  const previous = await readStore(baseDir);
  const nextStore: StoredOciGenAiSettings = {
    version: 1,
    config: previous.config,
    updatedAt: new Date().toISOString()
  };
  await writeStore(baseDir, nextStore);
  return createState(nextStore.config, false, activeCodec.kind, nextStore.updatedAt);
}

export async function loadOciGenAiRuntimeSettings(
  baseDir: string,
  codec?: OciGenAiSecretCodec
): Promise<OciGenAiRuntimeSettings> {
  const activeCodec = getCodec(codec);
  const store = await readStore(baseDir);

  return {
    enabled: true,
    baseUrl: store.config.baseUrl,
    model: store.config.model,
    project: store.config.project,
    apiKey: readStoredApiKey(store, activeCodec) ?? ""
  };
}
