import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyBrowserAgentApprovals,
  classifyBrowserAgentAction,
  createBrowserAgentPlan,
  type BrowserAgentPlanContext
} from "./agentActions";

const context: BrowserAgentPlanContext = {
  workspaceName: "金融向け RAG 提案",
  playbookTitle: "RAG Chatbot on Oracle AI Database 26ai",
  currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
  currentTitle: "Oracle AI Vector Search Documentation",
  sourceType: "oracle_docs"
};

test("createBrowserAgentPlan separates safe steps from approval-gated steps", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    task: "このページから PoC readiness を整理して follow-up を作る"
  });

  assert.equal(plan.steps.length, 5);
  assert.equal(plan.approvalSummary.safe, 3);
  assert.equal(plan.approvalSummary.review, 2);
  assert.equal(plan.approvalSummary.blocked, 0);
  assert.deepEqual(
    plan.steps.filter((step) => step.approval === "required").map((step) => step.action.kind),
    ["ask_oci_genai", "generate_poc_assets"]
  );
});

test("createBrowserAgentPlan adds schedule and MCP approval steps only when requested", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    task: "毎日 Oracle Docs update を監視して MCP connector scope も準備する"
  });

  assert.equal(plan.steps.at(-2)?.action.kind, "schedule_task");
  assert.equal(plan.steps.at(-1)?.action.kind, "prepare_mcp_scope");
  assert.equal(plan.approvalSummary.review, 4);
});

test("destructive browser tasks are blocked instead of approved", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    sourceType: "oci_console",
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    task: "古い policy を削除して権限変更を送信する"
  });
  const blocked = plan.steps.find((step) => step.action.kind === "destructive_browser_action");

  assert.ok(blocked);
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.approval, "blocked");
  assert.match(blocked.rationale, /破壊的/);
});

test("classifyBrowserAgentAction blocks destructive OCI Console descriptions", () => {
  const result = classifyBrowserAgentAction(
    {
      kind: "save_capture",
      label: "Update policy",
      target: "OCI Console",
      description: "change policy and submit"
    },
    {
      ...context,
      sourceType: "oci_console"
    }
  );

  assert.equal(result.risk, "blocked");
  assert.equal(result.approval, "blocked");
});

test("applyBrowserAgentApprovals marks unapproved review steps as skipped", () => {
  const plan = createBrowserAgentPlan({
    ...context,
    task: "PoC follow-up を作る"
  });
  const reviewStep = plan.steps.find((step) => step.approval === "required");
  assert.ok(reviewStep);

  const result = applyBrowserAgentApprovals(plan, [reviewStep.id]);
  const approvedStep = result.steps.find((step) => step.id === reviewStep.id);
  const skippedSteps = result.steps.filter((step) => step.approval === "required" && step.id !== reviewStep.id);

  assert.equal(approvedStep?.status, "approved");
  assert.ok(skippedSteps.every((step) => step.status === "skipped"));
});
