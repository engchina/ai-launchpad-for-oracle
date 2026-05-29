import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserWorkflowGraphDraft } from "./browserWorkflowGraph";

test("createBrowserWorkflowGraphDraft creates a review-only playbook workflow graph", () => {
  const draft = createBrowserWorkflowGraphDraft({
    workspaceName: "金融向け RAG 提案",
    playbookTitle: "Oracle Vector PoC",
    currentTitle: "Oracle AI Vector Search Documentation",
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/"
  });

  assert.equal(draft.source, "playbook_blueprint");
  assert.equal(draft.workspaceName, "金融向け RAG 提案");
  assert.equal(draft.nodeCount, 6);
  assert.equal(draft.edgeCount, 5);
  assert.equal(draft.approvalGateCount, 3);
  assert.equal(draft.canSave, false);
  assert.equal(draft.nodes[0]?.kind, "observe");
  assert.equal(draft.nodes.at(-1)?.kind, "record");
  assert.equal(draft.edges[0]?.fromNodeId, draft.nodes[0]?.id);
  assert.equal(draft.edges[0]?.toNodeId, draft.nodes[1]?.id);
  assert.equal(draft.details.includes("source: playbook_blueprint"), true);
  assert.match(draft.guardrails.join("\n"), /BrowserOS source/);
  assert.match(draft.guardrails.join("\n"), /OCI call は開始しない/);
});

test("createBrowserWorkflowGraphDraft carries assistant context evidence into compare and plan nodes", () => {
  const draft = createBrowserWorkflowGraphDraft({
    source: "assistant_context",
    sourceContextId: "context-page-search-1",
    workspaceName: "Oracle Launchpad",
    playbookTitle: "Page search handoff",
    currentTitle: "Oracle Docs",
    currentUrl: "https://docs.oracle.com",
    promptPreview: "Attached browser context を Council / Workflow Graph の draft に変換してください。",
    evidenceLabels: ["Page title: Oracle Docs", "Capture: Vector note", "Workspace: Sales PoC", "Ignored: extra"]
  });
  const compareNode = draft.nodes.find((node) => node.kind === "compare");
  const planNode = draft.nodes.find((node) => node.kind === "plan");

  assert.equal(draft.source, "assistant_context");
  assert.equal(draft.sourceContextId, "context-page-search-1");
  assert.match(draft.description, /attached browser context/);
  assert.match(compareNode?.detail ?? "", /Page title: Oracle Docs/);
  assert.match(compareNode?.detail ?? "", /Capture: Vector note/);
  assert.doesNotMatch(compareNode?.detail ?? "", /Ignored: extra/);
  assert.equal(planNode?.approvalRequired, true);
  assert.equal(planNode?.status, "needs_review");
  assert.equal(draft.details.includes("source: assistant_context"), true);
});
