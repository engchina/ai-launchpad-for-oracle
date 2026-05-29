import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  OCI_GENAI_LIVE_ENV_FLAG,
  buildGenAiMessages,
  generateOciGenAiAnswer,
  resolveOciGenAiReadiness,
  resolveOciGenAiReadinessFromSettings,
  testOciGenAiConnection
} from "./ociGenAiExecutor";

test("resolveOciGenAiReadiness は flag 未設定なら disabled", () => {
  const readiness = resolveOciGenAiReadiness({});
  assert.deepEqual(readiness, { enabled: false, reason: "disabled", missing: [OCI_GENAI_LIVE_ENV_FLAG] });
});

test("resolveOciGenAiReadiness は flag 有効でも設定不足なら incomplete", () => {
  const readiness = resolveOciGenAiReadiness({ [OCI_GENAI_LIVE_ENV_FLAG]: "1", OCI_GENAI_BASE_URL: "https://example/v1" });
  assert.equal(readiness.enabled, false);
  assert.deepEqual(readiness, {
    enabled: false,
    reason: "incomplete",
    missing: ["OCI_GENAI_API_KEY", "OCI_GENAI_MODEL"]
  });
});

test("resolveOciGenAiReadiness は全設定が揃うと enabled", () => {
  const readiness = resolveOciGenAiReadiness({
    [OCI_GENAI_LIVE_ENV_FLAG]: "true",
    OCI_GENAI_BASE_URL: "https://inference.example/v1",
    OCI_GENAI_API_KEY: "sk-demo",
    OCI_GENAI_MODEL: "cohere.command-r"
  });
  assert.equal(readiness.enabled, true);
  if (readiness.enabled) {
    assert.equal(readiness.config.baseUrl, "https://inference.example/v1");
    assert.equal(readiness.config.model, "cohere.command-r");
  }
});

test("resolveOciGenAiReadinessFromSettings は保存済み settings を env より優先する", () => {
  const readiness = resolveOciGenAiReadinessFromSettings(
    {},
    {
      enabled: true,
      baseUrl: "https://inference.example/v1",
      apiKey: "sk-settings",
      model: "cohere.command-r-plus",
      project: "ocid1.generativeaiproject.oc1.example"
    }
  );
  assert.equal(readiness.enabled, true);
  if (readiness.enabled) {
    assert.equal(readiness.config.apiKey, "sk-settings");
    assert.equal(readiness.config.model, "cohere.command-r-plus");
    assert.equal(readiness.config.project, "ocid1.generativeaiproject.oc1.example");
  }
});

test("resolveOciGenAiReadinessFromSettings は settings の不足項目を返す", () => {
  const readiness = resolveOciGenAiReadinessFromSettings(
    {},
    {
      enabled: true,
      baseUrl: "",
      apiKey: "",
      model: "cohere.command-r",
      project: ""
    }
  );
  assert.deepEqual(readiness, {
    enabled: false,
    reason: "incomplete",
    missing: ["OCI GenAI Base URL", "OCI GenAI API key"]
  });
});

test("buildGenAiMessages は system + 根拠つき user message を生成", () => {
  const messages = buildGenAiMessages("OCI GenAI Enterprise AI の確認事項は?", [
    { title: "GenAI 概要", sourceUrl: "https://docs.example", text: "endpoint、model、API key owner を確認する。" }
  ]);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.match(messages[1].content, /# 質問/);
  assert.match(messages[1].content, /GenAI 概要/);
  assert.match(messages[1].content, /API key owner/);
});

test("buildGenAiMessages は根拠なしでもプレースホルダを入れる", () => {
  const messages = buildGenAiMessages("質問", []);
  assert.match(messages[1].content, /\(根拠なし\)/);
});

test("generateOciGenAiAnswer は無効時に fallback 理由を返す", async () => {
  const generation = await generateOciGenAiAnswer("質問", [{ text: "根拠" }], {});
  assert.equal(generation.ok, false);
  if (!generation.ok) {
    assert.match(generation.reason, new RegExp(OCI_GENAI_LIVE_ENV_FLAG));
  }
});

test("generateOciGenAiAnswer は Project がある場合 OpenAI-Project header を送る", async () => {
  const originalFetch = globalThis.fetch;
  let projectHeader = "";
  let requestedUrl = "";

  globalThis.fetch = (async (input, init) => {
    requestedUrl = String(input);
    const headers = init?.headers as Record<string, string>;
    projectHeader = headers["OpenAI-Project"] ?? "";
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "回答" } }]
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  }) as typeof fetch;

  try {
    const generation = await generateOciGenAiAnswer(
      "質問",
      [{ text: "根拠" }],
      {},
      {
        enabled: true,
        baseUrl: "https://inference.example/v1/",
        apiKey: "sk-settings",
        model: "cohere.command-r-plus",
        project: "ocid1.generativeaiproject.oc1.example"
      }
    );

    assert.deepEqual(generation, { ok: true, answer: "回答" });
    assert.equal(requestedUrl, "https://inference.example/v1/chat/completions");
    assert.equal(projectHeader, "ocid1.generativeaiproject.oc1.example");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("testOciGenAiConnection は最小 chat completion で接続を確認する", async () => {
  let requestedUrl = "";
  let requestBody = "";

  const fetchImpl = (async (input, init) => {
    requestedUrl = String(input);
    requestBody = String(init?.body ?? "");
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "OK" } }]
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  }) as typeof fetch;

  const result = await testOciGenAiConnection(
    {
      baseUrl: "https://inference.example/v1/",
      apiKey: "sk-settings",
      model: "cohere.command-r-plus",
      project: ""
    },
    fetchImpl
  );

  assert.deepEqual(result, { ok: true });
  assert.equal(requestedUrl, "https://inference.example/v1/chat/completions");
  assert.match(requestBody, /"max_tokens":16/);
});
