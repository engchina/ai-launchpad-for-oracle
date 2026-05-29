import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserQuickStartOnboardingPreview } from "./browserQuickStartOnboarding";

test("createBrowserQuickStartOnboardingPreview creates BrowserOS-like setup steps with OCI provider", () => {
  const preview = createBrowserQuickStartOnboardingPreview({
    providerLabel: "OCI GenAI Enterprise AI Project",
    signedIn: false,
    chromeImportReviewed: false,
    assistantReady: true
  });

  assert.equal(preview.title, "Quick Start Preview");
  assert.equal(preview.providerLabel, "OCI GenAI Enterprise AI Project");
  assert.deepEqual(
    preview.steps.map((step) => step.id),
    ["sign_in", "import_chrome", "configure_ai", "try_assistant"]
  );
  assert.equal(preview.steps.find((step) => step.id === "configure_ai")?.status, "ready");
  assert.match(preview.steps.find((step) => step.id === "import_chrome")?.detail ?? "", /password/);
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("BrowserOS")));
});

test("createBrowserQuickStartOnboardingPreview summarizes ready review and blocked states", () => {
  const preview = createBrowserQuickStartOnboardingPreview({
    signedIn: true,
    chromeImportReviewed: true,
    assistantReady: false
  });

  assert.deepEqual(
    preview.metrics.map((metric) => metric.value),
    ["4", "3", "0", "1"]
  );
  assert.equal(preview.steps.find((step) => step.id === "sign_in")?.status, "ready");
  assert.equal(preview.steps.find((step) => step.id === "try_assistant")?.status, "blocked");
  assert.match(preview.subtitle, /clean-room checklist/);
});
