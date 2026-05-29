import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { AddressInfo } from "node:net";
import type { BrowserMcpLocalConnectorResult } from "../shared/api";
import {
  BROWSER_MCP_HTTP_ENDPOINT_PATH,
  BROWSER_MCP_HTTP_STREAM_PATH,
  createBrowserMcpHttpServer,
  handleBrowserMcpHttpRoute
} from "./localConnectorBrowserMcpHttp";

const workspaceName = "Oracle PoC Workspace";
const handledAt = "2026-05-28T14:00:00.000Z";

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}

async function closeServer(server: ReturnType<typeof createBrowserMcpHttpServer>): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

test("handleBrowserMcpHttpRoute exposes local health metadata", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "GET",
    pathname: "/health",
    handledAt
  });
  const body = parseJsonBody<Record<string, unknown>>(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.bridge, "browser-mcp");
  assert.equal(body.transport, "http");
  assert.equal(body.endpointPath, BROWSER_MCP_HTTP_ENDPOINT_PATH);
  assert.equal(body.streamPath, BROWSER_MCP_HTTP_STREAM_PATH);
  assert.equal(result.auditEvent?.kind, "health_check");
  assert.equal(result.auditEvent?.status, "ok");
});

test("handleBrowserMcpHttpRoute exposes SSE status preview", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "GET",
    pathname: "/sse",
    handledAt
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["content-type"], "text/event-stream; charset=utf-8");
  assert.match(result.body, /event: endpoint\.status/);
  assert.match(result.body, /"transport":"sse"/);
  assert.equal(result.auditEvent?.kind, "stream_preview");
});

test("handleBrowserMcpHttpRoute maps tools/list to Local Connector response", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "POST",
    pathname: "/mcp",
    handledAt,
    body: JSON.stringify({
      id: "http-list",
      method: "tools/list",
      workspaceName
    })
  });
  const body = parseJsonBody<BrowserMcpLocalConnectorResult>(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.summary.status, "ok");
  assert.equal(body.summary.toolCount, body.response.ok && body.response.method === "tools/list" ? body.response.result.tools.length : 0);
  assert.equal(result.auditEvent?.kind, "mcp_request");
  assert.equal(result.auditEvent?.mcpMethod, "tools/list");
});

test("handleBrowserMcpHttpRoute rejects invalid JSON before protocol handling", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "POST",
    pathname: "/mcp",
    handledAt,
    body: "{"
  });
  const body = parseJsonBody<{ ok: boolean; error: { code: string } }>(result.body);

  assert.equal(result.statusCode, 400);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "invalid_json");
  assert.equal(result.auditEvent?.kind, "http_error");
  assert.equal(result.auditEvent?.errorCode, "invalid_json");
});

test("handleBrowserMcpHttpRoute rejects non-POST MCP requests", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "GET",
    pathname: "/mcp",
    handledAt
  });
  const body = parseJsonBody<{ ok: boolean; error: { code: string } }>(result.body);

  assert.equal(result.statusCode, 405);
  assert.equal(body.error.code, "method_not_allowed");
});

test("createBrowserMcpHttpServer handles approval-gated tool calls", async () => {
  const auditEvents: unknown[] = [];
  const server = createBrowserMcpHttpServer({
    now: () => handledAt,
    onAuditEvent: (event) => {
      auditEvents.push(event);
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        id: "http-call",
        method: "tools/call",
        workspaceName,
        createdAt: handledAt,
        params: {
          toolId: "navigate",
          input: { url: "https://docs.oracle.com/" },
          requestedBy: "mcp_client"
        }
      })
    });
    const body = (await response.json()) as BrowserMcpLocalConnectorResult;

    assert.equal(response.status, 200);
    assert.equal(body.summary.status, "ok");
    assert.equal(body.summary.executionStatus, "waiting_approval");
    assert.equal(body.response.ok, true);
    assert.equal(body.response.method, "tools/call");
    assert.equal(auditEvents.length, 1);
    assert.deepEqual(auditEvents[0], {
      kind: "mcp_request",
      status: "waiting_approval",
      occurredAt: handledAt,
      httpMethod: "POST",
      path: "/mcp",
      httpStatus: 200,
      requestId: "http-call",
      workspaceName,
      mcpMethod: "tools/call",
      toolId: "navigate",
      toolCount: undefined,
      executionStatus: "waiting_approval",
      approvalDecisionId: undefined,
      approvalDecisionStatus: undefined,
      errorCode: undefined,
      message: "tools/call handled by Browser MCP bridge."
    });
  } finally {
    await closeServer(server);
  }
});

test("handleBrowserMcpHttpRoute applies approval decisions to guarded tool calls", () => {
  const result = handleBrowserMcpHttpRoute({
    method: "POST",
    pathname: "/mcp",
    handledAt,
    approvalDecisions: [
      {
        id: "decision-approved",
        auditEventId: "audit-approved",
        status: "approved_preview",
        decidedAt: "2026-05-28T14:01:00.000Z",
        requestId: "http-approved-call",
        workspaceName,
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "approved"
      }
    ],
    body: JSON.stringify({
      id: "http-approved-call",
      method: "tools/call",
      workspaceName,
      createdAt: handledAt,
      params: {
        toolId: "navigate",
        input: { url: "https://docs.oracle.com/" },
        requestedBy: "mcp_client"
      }
    })
  });
  const body = parseJsonBody<BrowserMcpLocalConnectorResult>(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.summary.executionStatus, "completed");
  assert.equal(body.summary.approvalDecisionStatus, "approved_preview");
  assert.equal(result.auditEvent?.status, "ok");
  assert.equal(result.auditEvent?.approvalDecisionId, "decision-approved");
  assert.equal(result.auditEvent?.approvalDecisionStatus, "approved_preview");
});

test("createBrowserMcpHttpServer serves SSE status preview", async () => {
  const server = createBrowserMcpHttpServer({
    now: () => handledAt
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/sse`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
    assert.match(body, /endpoint\.status/);
  } finally {
    await closeServer(server);
  }
});
