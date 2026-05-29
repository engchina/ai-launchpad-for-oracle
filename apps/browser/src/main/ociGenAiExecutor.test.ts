import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  OCI_GENAI_LIVE_ENV_FLAG,
  buildGenAiMessages,
  generateOciGenAiAnswer,
  resolveOciGenAiReadiness
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

test("buildGenAiMessages は system + 根拠つき user message を生成", () => {
  const messages = buildGenAiMessages("Oracle Vector Search とは", [
    { title: "Vector 概要", sourceUrl: "https://docs.example", text: "VECTOR_DISTANCE で近傍検索する。" }
  ]);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.match(messages[1].content, /# 質問/);
  assert.match(messages[1].content, /Vector 概要/);
  assert.match(messages[1].content, /VECTOR_DISTANCE/);
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
