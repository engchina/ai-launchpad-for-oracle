import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserProviderSettingsPreview } from "./browserProviderSettings";

test("createBrowserProviderSettingsPreview keeps OCI GenAI as the default provider", () => {
  const preview = createBrowserProviderSettingsPreview({
    workspaceName: "Oracle PoC Workspace",
    activeProviderLabel: "OCI GenAI Enterprise",
    connectorStatus: "ready",
    knowledgeChunkCount: 2,
    captureCount: 1
  });

  assert.equal(preview.title, "AI Provider Settings Preview");
  assert.equal(preview.activeProviderLabel, "OCI GenAI Enterprise");
  assert.equal(preview.items.find((item) => item.kind === "primary_provider")?.decision, "ready");
  assert.match(preview.guardrails.join("\n"), /OCI GenAI Enterprise AI Project/);
});

test("createBrowserProviderSettingsPreview blocks external BYOK providers and secrets", () => {
  const preview = createBrowserProviderSettingsPreview({
    workspaceName: "Oracle PoC Workspace",
    activeProviderLabel: "Claude api_key=abc123 token=session"
  });
  const byok = preview.items.find((item) => item.kind === "external_byok");
  const secrets = preview.items.find((item) => item.kind === "secrets");

  assert.equal(byok?.decision, "blocked");
  assert.equal(secrets?.decision, "blocked");
  assert.doesNotMatch(preview.activeProviderLabel, /abc123|session/);
  assert.match(preview.activeProviderLabel, /REDACTED/);
});

test("createBrowserProviderSettingsPreview sends missing connector and empty evidence to review", () => {
  const preview = createBrowserProviderSettingsPreview({
    workspaceName: "Oracle PoC Workspace",
    connectorStatus: "preview",
    knowledgeChunkCount: 0,
    captureCount: 0
  });

  assert.equal(preview.items.find((item) => item.kind === "primary_provider")?.decision, "review");
  assert.equal(preview.items.find((item) => item.kind === "grounding")?.decision, "review");
  assert.equal(preview.actions.find((action) => action.id === "test_provider")?.enabled, false);
});

test("createBrowserProviderSettingsPreview keeps local keyword fallback ready", () => {
  const preview = createBrowserProviderSettingsPreview({
    workspaceName: "Oracle PoC Workspace"
  });
  const localFallback = preview.items.find((item) => item.kind === "local_fallback");

  assert.equal(localFallback?.decision, "ready");
  assert.match(localFallback?.valueLabel ?? "", /offline preview/);
  assert.equal(preview.actions.find((action) => action.id === "review_provider_settings")?.enabled, true);
});
