import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserMcpAuditEvent } from "./api";
import { createBrowserMcpApprovalQueue } from "./browserMcpApprovalQueue";
import {
  createBrowserMcpApprovalDecision,
  createBrowserMcpExecutionConfirmation,
  findBrowserMcpApprovalDecisionForRequest,
  getApprovedBrowserMcpAuditEventIds
} from "./browserMcpApprovalDecision";

const waitingEvent: BrowserMcpAuditEvent = {
  id: "audit-1",
  kind: "mcp_request",
  status: "waiting_approval",
  occurredAt: "2026-05-28T12:00:00.000Z",
  sessionId: "session-1",
  requestId: "request-1",
  workspaceName: "Oracle PoC Workspace",
  mcpMethod: "tools/call",
  toolId: "navigate",
  executionStatus: "waiting_approval"
};

test("createBrowserMcpExecutionConfirmation separates policy reason from queue item", () => {
  const [item] = createBrowserMcpApprovalQueue([waitingEvent]);
  const confirmation = createBrowserMcpExecutionConfirmation(item ? [item] : []);

  assert.ok(confirmation);
  assert.equal(confirmation.auditEventId, "audit-1");
  assert.equal(confirmation.decisionStatus, "waiting_approval");
  assert.equal(confirmation.actionLabel, "Approve preview");
  assert.match(confirmation.policyReason, /user approval/);
  assert.match(confirmation.finalConfirmation, /run history preview/);
});

test("createBrowserMcpApprovalDecision records approved preview metadata", () => {
  const [item] = createBrowserMcpApprovalQueue([waitingEvent], ["audit-1"]);
  assert.ok(item);

  const decision = createBrowserMcpApprovalDecision(item, "approved_preview", "2026-05-28T12:01:00.000Z");

  assert.equal(decision.auditEventId, "audit-1");
  assert.equal(decision.status, "approved_preview");
  assert.equal(decision.toolId, "navigate");
  assert.equal(decision.workspaceName, "Oracle PoC Workspace");
  assert.match(decision.policyReason, /tools\/call/);
  assert.match(decision.confirmationSummary, /実 browser 操作はまだ実行しません/);
});

test("getApprovedBrowserMcpAuditEventIds uses the latest decision per audit event", () => {
  assert.deepEqual(
    getApprovedBrowserMcpAuditEventIds([
      {
        id: "decision-1",
        auditEventId: "audit-1",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:00:00.000Z",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "approved"
      },
      {
        id: "decision-2",
        auditEventId: "audit-1",
        status: "revoked_preview",
        decidedAt: "2026-05-28T12:01:00.000Z",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "revoked"
      },
      {
        id: "decision-3",
        auditEventId: "audit-2",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:02:00.000Z",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "extract_text",
        policyReason: "read only",
        confirmationSummary: "approved"
      }
    ]),
    ["audit-2"]
  );
});

test("findBrowserMcpApprovalDecisionForRequest returns latest matching request decision", () => {
  const decision = findBrowserMcpApprovalDecisionForRequest(
    {
      id: "request-1",
      method: "tools/call",
      workspaceName: "Oracle PoC Workspace",
      params: {
        toolId: "navigate"
      }
    },
    [
      {
        id: "decision-old",
        auditEventId: "audit-1",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:00:00.000Z",
        requestId: "request-1",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "approved"
      },
      {
        id: "decision-new",
        auditEventId: "audit-1",
        status: "revoked_preview",
        decidedAt: "2026-05-28T12:02:00.000Z",
        requestId: "request-1",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "revoked"
      }
    ]
  );

  assert.equal(decision?.id, "decision-new");
  assert.equal(decision?.status, "revoked_preview");
});
