import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  answerKnowledgeQuestion,
  createKnowledgeChunks,
  searchKnowledge,
  type KnowledgeChunk
} from "./knowledge";
import { executeOracleVectorSearchDryRun, getRagAdapterHealth, normalizeOracleVectorSearchConfig } from "../../../shared/rag";
import type { CapturedPage } from "../data/mockData";

function createCapture(overrides: Partial<CapturedPage>): CapturedPage {
  return {
    id: "capture-page",
    workspaceId: "workspace",
    kind: "page",
    title: "Oracle AI Vector Search",
    url: "https://docs.oracle.com/vector-search",
    sourceType: "oracle_docs",
    summary: "Vector index と embedding model を使って similarity query を実行する手順。",
    savedAt: "2026-05-14T00:00:00.000Z",
    ...overrides
  };
}

test("createKnowledgeChunks converts selected captures in requested order", () => {
  const page = createCapture({ id: "page" });
  const selection = createCapture({
    id: "selection",
    kind: "selection",
    title: "OCI Generative AI Agents",
    selectedText: "RAG Tool は Object Storage と policy の確認が必要です。"
  });

  const chunks = createKnowledgeChunks([page, selection], ["selection", "missing", "page"]);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].captureId, "selection");
  assert.match(chunks[0].text, /Object Storage/);
  assert.equal(chunks[1].captureId, "page");
});

test("searchKnowledge ranks keyword matches and returns source evidence", () => {
  const chunks: KnowledgeChunk[] = createKnowledgeChunks(
    [
      createCapture({ id: "vector", summary: "Vector index、embedding、similarity query の demo flow。" }),
      createCapture({
        id: "agent",
        title: "OCI Generative AI Agents",
        url: "https://docs.oracle.com/agents",
        summary: "Agent endpoint と Object Storage policy の readiness checklist。"
      })
    ],
    ["agent", "vector"]
  );

  const results = searchKnowledge("vector index demo", chunks);

  assert.equal(results[0].chunk.captureId, "vector");
  assert.ok(results[0].score > 0);
  assert.deepEqual(results[0].matchedTerms.sort(), ["demo", "index", "vector"]);
  assert.match(results[0].excerpt, /Vector index/);
});

test("answerKnowledgeQuestion reports no-match without inventing sources", () => {
  const chunks = createKnowledgeChunks([createCapture({ id: "vector" })], ["vector"]);
  const answer = answerKnowledgeQuestion("Autonomous NL2SQL profile", chunks);

  assert.equal(answer.status, "no_match");
  assert.equal(answer.adapter, "local-keyword");
  assert.equal(answer.adapterStatus, "ready");
  assert.equal(typeof answer.latencyMs, "number");
  assert.equal(answer.results.length, 0);
  assert.match(answer.answer, /一致する根拠/);
});

test("answerKnowledgeQuestion exposes Oracle Vector Search skeleton as unavailable", () => {
  const chunks = createKnowledgeChunks([createCapture({ id: "vector" })], ["vector"]);
  const answer = answerKnowledgeQuestion("vector index", chunks, 3, "oracle-vector-search");

  assert.equal(answer.status, "adapter_unavailable");
  assert.equal(answer.adapter, "oracle-vector-search");
  assert.equal(answer.adapterStatus, "not_configured");
  assert.equal(answer.results.length, 0);
  assert.match(answer.answer, /設定が不足/);
});

test("Oracle Vector Search config normalizes configured state and topK", () => {
  const config = normalizeOracleVectorSearchConfig({
    connectionName: "adb-sales-demo",
    tableName: "AI_LAUNCHPAD_CHUNKS",
    vectorColumn: "VECTOR_EMBEDDING",
    textColumn: "CHUNK_TEXT",
    embeddingModel: "cohere.embed-multilingual-v3.0",
    topK: 99
  });
  const health = getRagAdapterHealth("oracle-vector-search", config);
  const chunks = createKnowledgeChunks([createCapture({ id: "vector" })], ["vector"]);
  const answer = answerKnowledgeQuestion("vector index", chunks, 3, "oracle-vector-search", config);

  assert.equal(config.configured, true);
  assert.equal(config.topK, 20);
  assert.equal(health.status, "dry_run");
  assert.equal(answer.status, "adapter_dry_run");
  assert.equal(answer.adapterStatus, "dry_run");
  assert.match(answer.answer, /dry-run/);
  assert.match(answer.oracleVectorSearch?.plan?.sqlPreview ?? "", /VECTOR_DISTANCE/);
  assert.match(answer.oracleVectorSearch?.plan?.sqlPreview ?? "", /FETCH FIRST 3 ROWS ONLY/);
});

test("Oracle Vector Search execution contract rejects unsafe identifiers", () => {
  const result = executeOracleVectorSearchDryRun({
    question: "vector index",
    config: {
      connectionName: "adb-sales-demo",
      tableName: "AI_LAUNCHPAD_CHUNKS;DROP_TABLE",
      vectorColumn: "VECTOR_EMBEDDING",
      textColumn: "CHUNK_TEXT",
      embeddingModel: "cohere.embed-multilingual-v3.0",
      topK: 5
    }
  });

  assert.equal(result.status, "invalid_config");
  assert.equal(result.plan, undefined);
  assert.match(result.validationErrors?.join(" ") ?? "", /Oracle identifier/);
});
