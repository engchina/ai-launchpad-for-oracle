import * as assert from "node:assert/strict";
import { test } from "node:test";
import { handleBrowserMcpRequest, type BrowserMcpResponse } from "./browserMcpProtocol";

const workspaceName = "金融向け RAG 提案";
const fixedCreatedAt = "2026-05-28T12:00:00.000Z";

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

test("handleBrowserMcpRequest lists tool descriptors and summary", () => {
  const response = handleBrowserMcpRequest({
    id: "req-list",
    method: "tools/list",
    workspaceName
  });

  assertToolsListResponse(response);
  assert.ok(response.result.tools.length >= 53);
  assert.ok(response.result.tools.some((tool) => tool.name === "navigate"));
  assert.equal(response.result.summary.totalTools, response.result.tools.length);
});

test("handleBrowserMcpRequest filters tools by category", () => {
  const response = handleBrowserMcpRequest({
    id: "req-list-nav",
    method: "tools/list",
    workspaceName,
    params: { category: "navigation" }
  });

  assertToolsListResponse(response);
  assert.ok(response.result.tools.length > 0);
  assert.ok(response.result.tools.every((tool) => tool.category === "navigation"));
});

test("handleBrowserMcpRequest calls read-only tools through dry-run executor", () => {
  const response = handleBrowserMcpRequest({
    id: "req-call-read",
    method: "tools/call",
    workspaceName,
    createdAt: fixedCreatedAt,
    params: {
      toolId: "extract_text",
      requestedBy: "mcp_client"
    }
  });

  assertToolsCallResponse(response);
  assert.equal(response.result.invocation.status, "ready");
  assert.equal(response.result.execution.status, "completed");
  assert.equal(response.result.events.length, 2);
});

test("handleBrowserMcpRequest keeps write tools waiting for approval", () => {
  const response = handleBrowserMcpRequest({
    id: "req-call-write",
    method: "tools/call",
    workspaceName,
    createdAt: fixedCreatedAt,
    params: {
      toolId: "navigate",
      input: { url: "https://docs.oracle.com/" },
      requestedBy: "mcp_client"
    }
  });

  assertToolsCallResponse(response);
  assert.equal(response.result.invocation.status, "waiting_approval");
  assert.equal(response.result.execution.status, "waiting_approval");
});

test("handleBrowserMcpRequest applies approved decisions to guarded dry-run executor", () => {
  const response = handleBrowserMcpRequest(
    {
      id: "req-call-approved",
      method: "tools/call",
      workspaceName,
      createdAt: fixedCreatedAt,
      params: {
        toolId: "navigate",
        input: { url: "https://docs.oracle.com/" },
        requestedBy: "mcp_client"
      }
    },
    undefined,
    {
      approvalDecisions: [
        {
          id: "decision-approved",
          auditEventId: "audit-approved",
          status: "approved_preview",
          decidedAt: "2026-05-28T12:01:00.000Z",
          requestId: "req-call-approved",
          workspaceName,
          mcpMethod: "tools/call",
          toolId: "navigate",
          policyReason: "approval required",
          confirmationSummary: "approved"
        }
      ]
    }
  );

  assertToolsCallResponse(response);
  assert.equal(response.result.invocation.status, "approved");
  assert.equal(response.result.execution.status, "completed");
  assert.equal(response.result.approvalDecision?.status, "approved_preview");
  assert.match(response.result.execution.output.summary, /承認済み/);
});

test("handleBrowserMcpRequest ignores revoked decisions and keeps approval gate", () => {
  const response = handleBrowserMcpRequest(
    {
      id: "req-call-revoked",
      method: "tools/call",
      workspaceName,
      createdAt: fixedCreatedAt,
      params: {
        toolId: "navigate",
        requestedBy: "mcp_client"
      }
    },
    undefined,
    {
      approvalDecisions: [
        {
          id: "decision-revoked",
          auditEventId: "audit-revoked",
          status: "revoked_preview",
          decidedAt: "2026-05-28T12:01:00.000Z",
          requestId: "req-call-revoked",
          workspaceName,
          mcpMethod: "tools/call",
          toolId: "navigate",
          policyReason: "approval required",
          confirmationSummary: "revoked"
        }
      ]
    }
  );

  assertToolsCallResponse(response);
  assert.equal(response.result.invocation.status, "waiting_approval");
  assert.equal(response.result.execution.status, "waiting_approval");
  assert.equal(response.result.approvalDecision?.status, "revoked_preview");
});

test("handleBrowserMcpRequest rejects invalid call params", () => {
  const response = handleBrowserMcpRequest({
    id: "req-invalid-call",
    method: "tools/call",
    workspaceName
  });

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "invalid_params");
});

test("handleBrowserMcpRequest reports unknown methods", () => {
  const response = handleBrowserMcpRequest({
    id: "req-unknown",
    method: "resources/list",
    workspaceName
  });

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "unknown_method");
});
