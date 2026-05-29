import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAiModeOnboardingPreview } from "./browserAiModeOnboarding";

test("createBrowserAiModeOnboardingPreview summarizes BrowserOS-like AI entry modes with OCI provider", () => {
  const preview = createBrowserAiModeOnboardingPreview({
    workspaceName: "FY26 Oracle PoC",
    providerLabel: "OCI GenAI Enterprise AI Project",
    pageContextReady: true,
    agentApprovalReady: true,
    graphDraftReady: false
  });

  assert.equal(preview.title, "Three Ways to Use AI");
  assert.equal(preview.workspaceName, "FY26 Oracle PoC");
  assert.equal(preview.providerLabel, "OCI GenAI Enterprise AI Project");
  assert.deepEqual(
    preview.modes.map((mode) => mode.id),
    ["chat", "agent", "graph"]
  );
  assert.equal(preview.modes[0]?.status, "ready");
  assert.equal(preview.modes[1]?.status, "needs_review");
  assert.equal(preview.modes[2]?.status, "planned");
  assert.equal(preview.quickStart.length, 4);
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("BrowserOS")));
});

test("createBrowserAiModeOnboardingPreview downgrades context and automation when prerequisites are missing", () => {
  const preview = createBrowserAiModeOnboardingPreview({
    pageContextReady: false,
    agentApprovalReady: false,
    graphDraftReady: true
  });

  const modesById = new Map(preview.modes.map((mode) => [mode.id, mode]));

  assert.equal(modesById.get("chat")?.status, "needs_review");
  assert.equal(modesById.get("agent")?.status, "planned");
  assert.equal(modesById.get("graph")?.status, "needs_review");
  assert.deepEqual(
    preview.stats.map((stat) => stat.value),
    ["3", "OCI", "review", "planned"]
  );
  assert.match(preview.localOnlyNotice, /preview/);
});
