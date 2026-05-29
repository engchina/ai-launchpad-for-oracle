import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  answerKnowledgeQuestion,
  createKnowledgeChunks,
  searchKnowledge,
  type KnowledgeChunk
} from "./knowledge";
import type { CapturedPage } from "../data/mockData";

function createCapture(overrides: Partial<CapturedPage>): CapturedPage {
  return {
    id: "capture-page",
    workspaceId: "workspace",
    kind: "page",
    title: "OCI GenAI Enterprise AI",
    url: "https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm",
    sourceType: "oracle_docs",
    summary: "OCI GenAI endpoint、model、API key 管理を確認して grounded answer を生成する手順。",
    savedAt: "2026-05-14T00:00:00.000Z",
    ...overrides
  };
}

test("createKnowledgeChunks converts selected captures in requested order", () => {
  const page = createCapture({ id: "page" });
  const selection = createCapture({
    id: "selection",
    kind: "selection",
    title: "OCI GenAI prompt grounding",
    selectedText: "Enterprise AI PoC では API key owner と prompt context の確認が必要です。"
  });

  const chunks = createKnowledgeChunks([page, selection], ["selection", "missing", "page"]);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].captureId, "selection");
  assert.match(chunks[0].text, /prompt context/);
  assert.equal(chunks[1].captureId, "page");
});

test("searchKnowledge ranks keyword matches and returns source evidence", () => {
  const chunks: KnowledgeChunk[] = createKnowledgeChunks(
    [
      createCapture({ id: "genai", summary: "GenAI endpoint、model、API key の demo flow。" }),
      createCapture({
        id: "agent",
        title: "OCI Generative AI Agents",
        url: "https://docs.oracle.com/agents",
        summary: "Agent endpoint と tool policy の checklist。"
      })
    ],
    ["agent", "genai"]
  );

  const results = searchKnowledge("genai endpoint demo", chunks);

  assert.equal(results[0].chunk.captureId, "genai");
  assert.ok(results[0].score > 0);
  assert.deepEqual(results[0].matchedTerms.sort(), ["demo", "endpoint", "genai"]);
  assert.match(results[0].excerpt, /GenAI endpoint/);
});

test("answerKnowledgeQuestion reports no-match without inventing sources", () => {
  const chunks = createKnowledgeChunks([createCapture({ id: "genai" })], ["genai"]);
  const answer = answerKnowledgeQuestion("Autonomous NL2SQL profile", chunks);

  assert.equal(answer.status, "no_match");
  assert.equal(answer.adapter, "oci-genai-enterprise-ai");
  assert.equal(answer.adapterStatus, "ready");
  assert.equal(typeof answer.latencyMs, "number");
  assert.equal(answer.results.length, 0);
  assert.match(answer.answer, /根拠は、現在の captures からは見つかりませんでした/);
});

test("answerKnowledgeQuestion returns grounded OCI GenAI Enterprise AI answer", () => {
  const chunks = createKnowledgeChunks([createCapture({ id: "genai" })], ["genai"]);
  const answer = answerKnowledgeQuestion("GenAI endpoint の確認事項", chunks);

  assert.equal(answer.status, "answered");
  assert.equal(answer.adapter, "oci-genai-enterprise-ai");
  assert.equal(answer.adapterStatus, "ready");
  assert.equal(answer.results.length, 1);
  assert.match(answer.answer, /OCI GenAI Enterprise AI/);
  assert.match(answer.answer, /GenAI endpoint/);
});
