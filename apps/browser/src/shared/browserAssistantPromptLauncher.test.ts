import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAssistantPromptLauncherPreview } from "./browserAssistantPromptLauncher";

test("createBrowserAssistantPromptLauncherPreview maps BrowserOS-like assistant examples to clean-room modes", () => {
  const preview = createBrowserAssistantPromptLauncherPreview({
    providerLabel: "OCI GenAI Enterprise AI Project",
    pageContextReady: true,
    selectionReady: true,
    formApprovalReady: false
  });

  assert.equal(preview.title, "Try Assistant Prompts");
  assert.equal(preview.providerLabel, "OCI GenAI Enterprise AI Project");
  assert.deepEqual(
    preview.templates.map((template) => template.id),
    ["summarize_page", "extract_table", "translate_selection", "fill_form_guarded", "save_report"]
  );
  assert.equal(preview.templates.find((template) => template.id === "fill_form_guarded")?.risk, "blocked");
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("BrowserOS")));
});

test("createBrowserAssistantPromptLauncherPreview summarizes prompt modes and review gates", () => {
  const preview = createBrowserAssistantPromptLauncherPreview({
    pageContextReady: false,
    selectionReady: false,
    formApprovalReady: true
  });

  assert.deepEqual(
    preview.metrics.map((metric) => metric.value),
    ["5", "3", "5", "0"]
  );
  assert.equal(preview.templates.find((template) => template.id === "summarize_page")?.risk, "review");
  assert.equal(preview.templates.find((template) => template.id === "fill_form_guarded")?.risk, "review");
  assert.match(preview.subtitle, /clean-room prompt launcher/);
});

test("createBrowserAssistantPromptLauncherPreview redacts provider secrets", () => {
  const preview = createBrowserAssistantPromptLauncherPreview({
    providerLabel: "OCI token=abc123 api_key=secret-value"
  });

  assert.doesNotMatch(preview.providerLabel, /abc123|secret-value/);
  assert.match(preview.providerLabel, /REDACTED/);
});
