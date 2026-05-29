import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAgentPlan, type BrowserAgentPlanContext } from "./agentActions";
import { createBrowserAgentRunPreview } from "./agentRuns";

const context: BrowserAgentPlanContext = {
  workspaceName: "金融向け RAG 提案",
  playbookTitle: "RAG Chatbot on Oracle AI Database 26ai",
  currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
  currentTitle: "Oracle AI Vector Search Documentation",
  sourceType: "oracle_docs"
};

const fixedStartedAt = "2026-05-28T09:30:00.000Z";

test("createBrowserAgentRunPreview completes safe steps and skips unapproved review steps", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    task: "現在ページから PoC readiness を整理する"
  });

  const run = createBrowserAgentRunPreview(plan, [], fixedStartedAt);

  assert.equal(run.status, "needs_approval");
  assert.equal(run.steps.filter((step) => step.status === "completed").length, 3);
  assert.equal(run.steps.filter((step) => step.status === "skipped").length, 2);
  assert.ok(run.events.some((event) => event.level === "approval" && event.message.includes("承認がない")));
});

test("createBrowserAgentRunPreview includes approved review steps in the dry-run", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    task: "現在ページから PoC readiness を整理する"
  });
  const approvalStepIds = plan.steps.filter((step) => step.approval === "required").map((step) => step.id);

  const run = createBrowserAgentRunPreview(plan, approvalStepIds, fixedStartedAt);

  assert.equal(run.status, "completed");
  assert.equal(run.steps.filter((step) => step.status === "approved").length, 2);
  assert.equal(run.steps.filter((step) => step.status === "skipped").length, 0);
  assert.ok(run.id.startsWith("agent-run-20260528093000-"));
});

test("createBrowserAgentRunPreview stops blocked actions even when approval ids are provided", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    sourceType: "oci_console",
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    task: "古い policy を削除して権限変更を送信する"
  });
  const approvalStepIds = plan.steps.map((step) => step.id);

  const run = createBrowserAgentRunPreview(plan, approvalStepIds, fixedStartedAt);

  assert.equal(run.status, "blocked");
  assert.ok(run.steps.some((step) => step.status === "blocked"));
  assert.ok(run.events.some((event) => event.level === "blocked"));
});
