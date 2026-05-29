import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserMemoryPreview, type BrowserMemoryPreviewPayload } from "./browserMemory";

const payload: BrowserMemoryPreviewPayload = {
  workspaceName: "Oracle PoC Workspace",
  playbookTitle: "RAG Chatbot on Oracle AI Database 26ai",
  currentTitle: "Oracle AI Vector Search",
  currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
  captureCount: 3,
  knowledgeChunkCount: 8,
  now: "2026-05-28T15:30:00.000Z"
};

test("createBrowserMemoryPreview separates core facts from daily notes", () => {
  const preview = createBrowserMemoryPreview(payload);

  assert.equal(preview.coreFilePath, "~/.ai-launchpad-for-oracle/memory/CORE.md");
  assert.equal(preview.dailyFilePath, "~/.ai-launchpad-for-oracle/memory/2026-05-28.md");
  assert.equal(preview.coreEntries.every((entry) => entry.tier === "core" && entry.retentionLabel === "permanent"), true);
  assert.equal(preview.dailyEntries.every((entry) => entry.tier === "daily"), true);
  assert.equal(preview.dailyEntries.some((entry) => entry.retentionLabel === "expires in 30 days"), true);
});

test("createBrowserMemoryPreview searches recall matches before answering", () => {
  const preview = createBrowserMemoryPreview({
    ...payload,
    query: "OCI GenAI"
  });

  assert.equal(preview.query, "OCI GenAI");
  assert.equal(preview.recallMatches.length, 1);
  assert.equal(preview.recallMatches[0].tier, "core");
  assert.match(preview.recallMatches[0].snippet, /OCI Generative AI/);
});

test("createBrowserMemoryPreview exposes promote and forget review actions", () => {
  const preview = createBrowserMemoryPreview(payload);

  assert.equal(preview.actions.find((action) => action.id === "promote_to_core")?.enabled, true);
  assert.equal(preview.actions.find((action) => action.id === "forget_review")?.enabled, true);
  assert.equal(preview.actions.find((action) => action.id === "open_markdown")?.enabled, false);
  assert.equal(preview.guardrails.some((guardrail) => guardrail.includes("secret")), true);
});

test("createBrowserMemoryPreview returns recent recall when query is empty", () => {
  const preview = createBrowserMemoryPreview(payload);

  assert.equal(preview.recallMatches.length, 4);
  assert.equal(preview.recallMatches[0].scoreLabel, "recent 1");
});
