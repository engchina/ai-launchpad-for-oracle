import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserWorkflowRecorderPreview } from "./browserWorkflowRecorder";

test("createBrowserWorkflowRecorderPreview creates a local workflow recorder draft", () => {
  const preview = createBrowserWorkflowRecorderPreview({
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    currentTitle: "Oracle AI Vector Search Documentation",
    workspaceName: "金融向け RAG 提案",
    sourceType: "oracle_docs",
    playbookTitle: "Oracle Vector PoC workflow",
    prompt: "Create a repeatable daily workflow from captured evidence.",
    captureCount: 2,
    knowledgeChunkCount: 5,
    providerLabel: "OCI GenAI Enterprise AI Project"
  });

  assert.equal(preview.title, "Workflow Recorder Preview");
  assert.equal(preview.hostname, "docs.oracle.com");
  assert.equal(preview.capturedCount, 2);
  assert.ok(preview.suggestedCount >= 1);
  assert.ok(preview.approvalGateCount >= 1);
  assert.equal(preview.actions.find((action) => action.id === "test_workflow")?.enabled, false);
  assert.match(preview.graphSummary, /steps/);
  assert.match(preview.guardrails.join("\n"), /recording session は開始しません/);
});

test("createBrowserWorkflowRecorderPreview suggests loop and form nodes for repeatable form tasks", () => {
  const preview = createBrowserWorkflowRecorderPreview({
    currentUrl: "https://example.com/workflows",
    currentTitle: "Workflow intake",
    workspaceName: "Partner outreach",
    sourceType: "other",
    prompt: "Read contacts from a spreadsheet and fill the form for each row."
  });

  assert.ok(preview.steps.some((step) => step.kind === "loop"));
  assert.ok(preview.steps.some((step) => step.kind === "fill"));
  assert.ok(preview.reviewCount >= 2);
});

test("createBrowserWorkflowRecorderPreview blocks sensitive OCI Console workflows", () => {
  const preview = createBrowserWorkflowRecorderPreview({
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    workspaceName: "OCI tenant setup",
    sourceType: "oci_console",
    prompt: "Delete old resources after entering wallet token."
  });
  const approvalStep = preview.steps.find((step) => step.kind === "approval");

  assert.equal(approvalStep?.status, "blocked");
  assert.ok(preview.blockedCount >= 1);
  assert.equal(preview.actions.find((action) => action.id === "save_workflow")?.enabled, false);
});

test("createBrowserWorkflowRecorderPreview redacts secret-like labels", () => {
  const preview = createBrowserWorkflowRecorderPreview({
    currentUrl: "https://example.com",
    currentTitle: "Admin task",
    workspaceName: "API key = super-secret-value",
    sourceType: "other",
    prompt: "Create a workflow from the current page."
  });

  assert.match(preview.workspaceName, /\[redacted\]/);
  assert.doesNotMatch(preview.workspaceName, /super-secret-value/);
});
