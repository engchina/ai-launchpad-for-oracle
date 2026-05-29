import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";
import {
  clearOciGenAiApiKey,
  loadOciGenAiRuntimeSettings,
  loadOciGenAiSettings,
  saveOciGenAiSettings,
  type OciGenAiSecretCodec
} from "./ociGenAiSettingsStore";

const fakeSafeStorageCodec: OciGenAiSecretCodec = {
  kind: "electron-safe-storage",
  encrypt: (plainText) => Buffer.from(`safe:${plainText}`, "utf8").toString("base64"),
  decrypt: (storedValue) => {
    const decoded = Buffer.from(storedValue, "base64").toString("utf8");
    return decoded.startsWith("safe:") ? decoded.slice("safe:".length) : null;
  }
};

async function withTempStore<T>(run: (baseDir: string) => Promise<T>): Promise<T> {
  const baseDir = await mkdtemp(join(tmpdir(), "ai-launchpad-settings-"));
  try {
    return await run(baseDir);
  } finally {
    await rm(baseDir, { recursive: true, force: true });
  }
}

test("OCI GenAI settings は初期状態で必須項目の不足を返す", async () => {
  await withTempStore(async (baseDir) => {
    const settings = await loadOciGenAiSettings(baseDir, fakeSafeStorageCodec);
    assert.equal(settings.config.enabled, true);
    assert.equal(settings.hasApiKey, false);
    assert.equal(settings.readiness.ready, false);
    assert.deepEqual(settings.readiness.missing, ["Base URL", "Model", "API key"]);
  });
});

test("OCI GenAI settings は API key を state に返さず runtime だけで復号する", async () => {
  await withTempStore(async (baseDir) => {
    const saved = await saveOciGenAiSettings(
      baseDir,
      {
        baseUrl: "https://inference.example/v1/",
        model: " cohere.command-r ",
        project: " ocid1.generativeaiproject.oc1.example ",
        apiKey: "sk-test"
      },
      fakeSafeStorageCodec
    );

    assert.equal(saved.config.baseUrl, "https://inference.example/v1");
    assert.equal(saved.config.model, "cohere.command-r");
    assert.equal(saved.config.project, "ocid1.generativeaiproject.oc1.example");
    assert.equal(saved.hasApiKey, true);
    assert.equal(saved.readiness.ready, true);
    assert.equal(JSON.stringify(saved).includes("sk-test"), false);

    const runtime = await loadOciGenAiRuntimeSettings(baseDir, fakeSafeStorageCodec);
    assert.deepEqual(runtime, {
      enabled: true,
      baseUrl: "https://inference.example/v1",
      model: "cohere.command-r",
      project: "ocid1.generativeaiproject.oc1.example",
      apiKey: "sk-test"
    });
  });
});

test("OCI GenAI settings は空の API key 保存で既存 secret を維持する", async () => {
  await withTempStore(async (baseDir) => {
    await saveOciGenAiSettings(
      baseDir,
      {
        baseUrl: "https://inference.example/v1",
        model: "cohere.command-r",
        project: "",
        apiKey: "sk-test"
      },
      fakeSafeStorageCodec
    );

    const saved = await saveOciGenAiSettings(
      baseDir,
      {
        baseUrl: "https://inference.example/v1",
        model: "cohere.command-r-plus",
        project: "ocid1.generativeaiproject.oc1.updated",
        apiKey: ""
      },
      fakeSafeStorageCodec
    );
    const runtime = await loadOciGenAiRuntimeSettings(baseDir, fakeSafeStorageCodec);

    assert.equal(saved.hasApiKey, true);
    assert.equal(runtime?.apiKey, "sk-test");
    assert.equal(runtime?.model, "cohere.command-r-plus");
    assert.equal(runtime?.project, "ocid1.generativeaiproject.oc1.updated");
  });
});

test("OCI GenAI settings は API key を個別に clear できる", async () => {
  await withTempStore(async (baseDir) => {
    await saveOciGenAiSettings(
      baseDir,
      {
        baseUrl: "https://inference.example/v1",
        model: "cohere.command-r",
        project: "",
        apiKey: "sk-test"
      },
      fakeSafeStorageCodec
    );

    const cleared = await clearOciGenAiApiKey(baseDir, fakeSafeStorageCodec);
    const runtime = await loadOciGenAiRuntimeSettings(baseDir, fakeSafeStorageCodec);

    assert.equal(cleared.hasApiKey, false);
    assert.equal(cleared.readiness.ready, false);
    assert.deepEqual(cleared.readiness.missing, ["API key"]);
    assert.equal(runtime?.apiKey, "");
  });
});
