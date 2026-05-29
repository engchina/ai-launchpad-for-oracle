import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserSoulPreview, type BrowserSoulPreviewPayload } from "./browserSoul";

const payload: BrowserSoulPreviewPayload = {
  workspaceName: "金融向け RAG 提案",
  currentMode: "memory",
  preferredLanguage: "Japanese project UI / Chinese conversation"
};

test("createBrowserSoulPreview exposes local SOUL markdown metadata", () => {
  const preview = createBrowserSoulPreview(payload);

  assert.equal(preview.filePath, "~/.ai-launchpad-for-oracle/SOUL.md");
  assert.equal(preview.lineLimit, 150);
  assert.equal(preview.sections.length, 4);
  assert.ok(preview.localOnlyNotice.includes("実ファイル更新"));
});

test("createBrowserSoulPreview keeps behavior separate from memory facts", () => {
  const preview = createBrowserSoulPreview(payload);

  assert.match(preview.memorySeparationNotice, /SOUL\.md/);
  assert.match(preview.memorySeparationNotice, /Memory/);
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("顧客 facts")));
});

test("createBrowserSoulPreview classifies boundary instructions", () => {
  const preview = createBrowserSoulPreview({
    ...payload,
    instructionDraft: "Never send Slack messages or emails without confirming with me first."
  });

  assert.equal(preview.changePreview.targetSectionId, "boundaries");
  assert.equal(preview.changePreview.canApply, true);
  assert.equal(preview.actions.find((action) => action.id === "preview_update")?.enabled, true);
});

test("createBrowserSoulPreview classifies provider preferences", () => {
  const preview = createBrowserSoulPreview({
    ...payload,
    instructionDraft: "Prefer OCI GenAI for enterprise RAG answers."
  });

  assert.equal(preview.changePreview.targetSectionId, "preferences");
  assert.match(preview.changePreview.summary, /OCI GenAI/);
});

test("createBrowserSoulPreview disables update when instruction is empty", () => {
  const preview = createBrowserSoulPreview(payload);

  assert.equal(preview.changePreview.canApply, false);
  assert.equal(preview.actions.find((action) => action.id === "preview_update")?.enabled, false);
});
