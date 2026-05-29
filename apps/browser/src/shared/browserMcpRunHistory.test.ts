import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserMcpAuditEvent } from "./api";
import type { BrowserMcpApprovalDecision } from "./browserMcpApprovalDecision";
import { createBrowserMcpRunHistory } from "./browserMcpRunHistory";

const fixedOccurredAt = "2026-05-28T12:00:00.000Z";

const waitingEvent: BrowserMcpAuditEvent = {
  id: "audit-waiting",
  kind: "mcp_request",
  status: "waiting_approval",
  occurredAt: fixedOccurredAt,
  sessionId: "session-1",
  requestId: "request-1",
  workspaceName: "Oracle PoC Workspace",
  mcpMethod: "tools/call",
  toolId: "navigate",
  executionStatus: "waiting_approval"
};

const approvedDecision: BrowserMcpApprovalDecision = {
  id: "decision-approved",
  auditEventId: "audit-waiting",
  status: "approved_preview",
  decidedAt: "2026-05-28T12:01:00.000Z",
  sessionId: "session-1",
  requestId: "request-1",
  workspaceName: "Oracle PoC Workspace",
  mcpMethod: "tools/call",
  toolId: "navigate",
  policyReason: "approval required",
  confirmationSummary: "approved"
};

test("createBrowserMcpRunHistory maps waiting MCP requests to approval gate entries", () => {
  const history = createBrowserMcpRunHistory([waitingEvent]);

  assert.equal(history.length, 1);
  assert.equal(history[0].stage, "approval_gate");
  assert.equal(history[0].status, "needs_approval");
  assert.equal(history[0].run.status, "needs_approval");
  assert.equal(history[0].run.steps[0]?.status, "skipped");
  assert.equal(history[0].schedulerPolicy, "manual_preview_only");
});

test("createBrowserMcpRunHistory connects approved retry results to completed run history", () => {
  const history = createBrowserMcpRunHistory([
    {
      ...waitingEvent,
      id: "audit-approved",
      status: "ok",
      requestId: "request-approved",
      executionStatus: "completed",
      approvalDecisionId: "decision-approved",
      approvalDecisionStatus: "approved_preview"
    }
  ]);

  assert.equal(history[0].stage, "recorded");
  assert.equal(history[0].status, "completed");
  assert.equal(history[0].approvalDecisionStatus, "approved_preview");
  assert.equal(history[0].run.steps[0]?.status, "approved");
  assert.match(history[0].run.events[0]?.message ?? "", /guarded dry-run executor/);
});

test("createBrowserMcpRunHistory uses latest stored decision for preview history", () => {
  const history = createBrowserMcpRunHistory([waitingEvent], [
    {
      ...approvedDecision,
      id: "decision-revoked",
      status: "revoked_preview",
      decidedAt: "2026-05-28T12:02:00.000Z"
    },
    approvedDecision
  ]);

  assert.equal(history[0].status, "needs_approval");
  assert.equal(history[0].approvalDecisionStatus, "revoked_preview");
  assert.equal(history[0].run.steps[0]?.status, "skipped");
});

test("createBrowserMcpRunHistory ignores non-MCP audit events", () => {
  const history = createBrowserMcpRunHistory([
    {
      id: "audit-health",
      kind: "health_check",
      status: "ok",
      occurredAt: fixedOccurredAt
    }
  ]);

  assert.deepEqual(history, []);
});

test("createBrowserMcpRunHistory maps blocked requests to blocked run entries", () => {
  const history = createBrowserMcpRunHistory([
    {
      ...waitingEvent,
      id: "audit-blocked",
      status: "blocked",
      executionStatus: "blocked"
    }
  ]);

  assert.equal(history[0].status, "blocked");
  assert.equal(history[0].run.status, "blocked");
  assert.equal(history[0].run.steps[0]?.status, "blocked");
  assert.equal(history[0].run.events[0]?.level, "blocked");
});
