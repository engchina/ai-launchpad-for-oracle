import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserSmartNudgesPreview, type BrowserSmartNudgePreviewPayload } from "./browserSmartNudges";

const basePayload: BrowserSmartNudgePreviewPayload = {
  mode: "agent",
  workspaceName: "金融向け RAG 提案",
  task: "Create a follow-up email and a daily readiness digest for the current Oracle PoC page."
};

test("createBrowserSmartNudgesPreview suggests an app connection before external actions", () => {
  const preview = createBrowserSmartNudgesPreview(basePayload);
  const appCard = preview.cards.find((card) => card.type === "app_connection");

  assert.equal(preview.modeLabel, "Agent");
  assert.equal(preview.suggestedCount, 2);
  assert.equal(preview.suppressedCount, 0);
  assert.equal(preview.enabledActionCount, 4);
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("提案だけ")));
  assert.ok(appCard, "app connection card should be present");
  assert.equal(appCard.primaryAction.id, "connect_app");
  assert.equal(appCard.secondaryAction.id, "use_manual_browser");
  assert.match(appCard.localStateKey, /declinedApps/);
  assert.ok(appCard.guardrails.some((guardrail) => guardrail.includes("認可後")));
});

test("createBrowserSmartNudgesPreview suppresses declined apps locally", () => {
  const preview = createBrowserSmartNudgesPreview({
    ...basePayload,
    declinedAppIds: ["business_email"]
  });

  assert.equal(preview.cards.some((card) => card.type === "app_connection"), false);
  assert.equal(preview.suggestedCount, 1);
  assert.equal(preview.suppressedCount, 1);
  assert.ok(preview.suppressedReasons.some((reason) => reason.includes("declined")));
});

test("createBrowserSmartNudgesPreview suggests scheduling repeatable work", () => {
  const preview = createBrowserSmartNudgesPreview(basePayload);
  const scheduleCard = preview.cards.find((card) => card.type === "schedule_suggestion");

  assert.ok(scheduleCard, "schedule suggestion card should be present");
  assert.equal(scheduleCard.primaryAction.id, "schedule_task");
  assert.equal(scheduleCard.secondaryAction.id, "maybe_later");
  assert.ok(scheduleCard.details.some((detail) => detail.includes("PoC readiness digest")));
});

test("createBrowserSmartNudgesPreview hides nudges in read-only chat mode", () => {
  const preview = createBrowserSmartNudgesPreview({
    ...basePayload,
    mode: "chat"
  });

  assert.equal(preview.cards.length, 0);
  assert.ok(preview.suppressedReasons.some((reason) => reason.includes("Chat mode")));
});

test("createBrowserSmartNudgesPreview hides nudges during scheduled background runs", () => {
  const preview = createBrowserSmartNudgesPreview({
    ...basePayload,
    mode: "schedule"
  });

  assert.equal(preview.cards.length, 0);
  assert.ok(preview.suppressedReasons.some((reason) => reason.includes("background run")));
});
