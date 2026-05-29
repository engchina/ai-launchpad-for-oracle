import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserMcpResponse } from "../shared/api";
import { handleLocalConnectorBrowserMcp } from "./localConnectorBrowserMcp";

const workspaceName = "Oracle PoC Workspace";
const handledAt = "2026-05-28T13:00:00.000Z";

function assertToolsListResponse(
  response: BrowserMcpResponse
): asserts response is Extract<BrowserMcpResponse, { method: "tools/list"; ok: true }> {
  assert.equal(response.ok, true);
  assert.equal(response.method, "tools/list");
}

function assertToolsCallResponse(
  response: BrowserMcpResponse
): asserts response is Extract<BrowserMcpResponse, { method: "tools/call"; ok: true }> {
  assert.equal(response.ok, true);
  assert.equal(response.method, "tools/call");
}

test("handleLocalConnectorBrowserMcp returns tools list with bridge summary", () => {
  const result = handleLocalConnectorBrowserMcp(
    {
      id: "local-list",
      method: "tools/list",
      workspaceName
    },
    handledAt
  );

  assertToolsListResponse(result.response);
  assert.equal(result.summary.connector, "local-connector");
  assert.equal(result.summary.bridge, "browser-mcp");
  assert.equal(result.summary.status, "ok");
  assert.equal(result.summary.handledAt, handledAt);
  assert.equal(result.summary.toolCount, result.response.result.tools.length);
});

test("handleLocalConnectorBrowserMcp preserves approval-gated call status", () => {
  const result = handleLocalConnectorBrowserMcp(
    {
      id: "local-call",
      method: "tools/call",
      workspaceName,
      createdAt: handledAt,
      params: {
        toolId: "navigate",
        input: { url: "https://docs.oracle.com/" },
        requestedBy: "mcp_client"
      }
    },
    handledAt
  );

  assertToolsCallResponse(result.response);
  assert.equal(result.response.result.invocation.status, "waiting_approval");
  assert.equal(result.summary.executionStatus, "waiting_approval");
});

test("handleLocalConnectorBrowserMcp applies stored approval decisions", () => {
  const result = handleLocalConnectorBrowserMcp(
    {
      id: "local-approved-call",
      method: "tools/call",
      workspaceName,
      createdAt: handledAt,
      params: {
        toolId: "navigate",
        input: { url: "https://docs.oracle.com/" },
        requestedBy: "mcp_client"
      }
    },
    handledAt,
    {
      approvalDecisions: [
        {
          id: "decision-approved",
          auditEventId: "audit-approved",
          status: "approved_preview",
          decidedAt: "2026-05-28T13:01:00.000Z",
          requestId: "local-approved-call",
          workspaceName,
          mcpMethod: "tools/call",
          toolId: "navigate",
          policyReason: "approval required",
          confirmationSummary: "approved"
        }
      ]
    }
  );

  assertToolsCallResponse(result.response);
  assert.equal(result.response.result.invocation.status, "approved");
  assert.equal(result.summary.executionStatus, "completed");
  assert.equal(result.response.result.approvalDecision?.status, "approved_preview");
});

test("handleLocalConnectorBrowserMcp summarizes protocol errors", () => {
  const result = handleLocalConnectorBrowserMcp(
    {
      id: "local-unknown",
      method: "resources/list",
      workspaceName
    },
    handledAt
  );

  assert.equal(result.response.ok, false);
  assert.equal(result.summary.status, "error");
  assert.equal(result.summary.errorCode, "unknown_method");
});
