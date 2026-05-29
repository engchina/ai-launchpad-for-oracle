import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserMcpAuditEvent } from "./api";
import { createBrowserMcpApprovalQueue } from "./browserMcpApprovalQueue";

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

test("createBrowserMcpApprovalQueue maps waiting MCP audit events into queue items", () => {
  const queue = createBrowserMcpApprovalQueue([
    {
      id: "audit-health",
      kind: "health_check",
      status: "ok",
      occurredAt: "2026-05-28T11:59:00.000Z"
    },
    waitingEvent
  ]);

  assert.equal(queue.length, 1);
  assert.equal(queue[0].auditEventId, "audit-1");
  assert.equal(queue[0].toolId, "navigate");
  assert.equal(queue[0].status, "waiting_approval");
  assert.equal(queue[0].runPreview.status, "needs_approval");
  assert.equal(queue[0].runPreview.steps[0]?.status, "skipped");
  assert.match(queue[0].rationale, /MCP boundary/);
});

test("createBrowserMcpApprovalQueue marks approved preview without executing the tool", () => {
  const queue = createBrowserMcpApprovalQueue([waitingEvent], ["audit-1"]);

  assert.equal(queue.length, 1);
  assert.equal(queue[0].status, "approved_preview");
  assert.equal(queue[0].runPreview.status, "completed");
  assert.equal(queue[0].runPreview.steps[0]?.status, "approved");
  assert.match(queue[0].runPreview.events[0]?.message ?? "", /承認済み preview/);
});

test("createBrowserMcpApprovalQueue ignores completed and error MCP requests", () => {
  const queue = createBrowserMcpApprovalQueue([
    {
      ...waitingEvent,
      id: "audit-ok",
      status: "ok"
    },
    {
      ...waitingEvent,
      id: "audit-error",
      status: "error"
    }
  ]);

  assert.deepEqual(queue, []);
});
