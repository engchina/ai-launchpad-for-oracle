import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { BrowserMcpLocalConnectorResult } from "../shared/api";
import { BrowserMcpHttpEndpointController } from "./browserMcpHttpEndpointController";

const workspaceName = "Oracle PoC Workspace";

async function withTempStore(action: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "ai-launchpad-browser-mcp-controller-"));
  try {
    await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("BrowserMcpHttpEndpointController starts stopped and binds only after opt-in", () => {
  const controller = new BrowserMcpHttpEndpointController();
  const state = controller.status();

  assert.equal(state.status, "stopped");
  assert.equal(state.config.host, "127.0.0.1");
  assert.equal(state.config.port, 9239);
  assert.equal(state.config.streamPath, "/sse");
  assert.equal(state.url, undefined);
});

test("BrowserMcpHttpEndpointController starts, serves health, and stops", async () => {
  await withTempStore(async (dir) => {
    const controller = new BrowserMcpHttpEndpointController({
      getStoreBaseDir: () => dir
    });

    try {
      const running = await controller.start({ port: 0 });
      assert.equal(running.status, "running");
      assert.equal(running.config.host, "127.0.0.1");
      assert.ok(running.config.port > 0);
      assert.ok(running.sessionId);
      assert.equal(running.url, `http://127.0.0.1:${running.config.port}/mcp`);
      assert.equal(running.healthUrl, `http://127.0.0.1:${running.config.port}/health`);
      assert.equal(running.streamUrl, `http://127.0.0.1:${running.config.port}/sse`);

      const response = await fetch(running.healthUrl);
      const body = (await response.json()) as Record<string, unknown>;

      assert.equal(response.status, 200);
      assert.equal(body.ok, true);
      assert.equal(body.bridge, "browser-mcp");

      const stopped = await controller.stop();
      assert.equal(stopped.status, "stopped");
      assert.equal(stopped.url, undefined);

      const audit = await controller.listAuditEvents();
      assert.equal(audit.events.length, 3);
      assert.equal(audit.events[0].kind, "endpoint_stopped");
      assert.equal(audit.events[1].kind, "health_check");
      assert.equal(audit.events[2].kind, "endpoint_started");
      assert.equal(audit.events[1].sessionId, running.sessionId);
    } finally {
      await controller.dispose();
    }
  });
});

test("BrowserMcpHttpEndpointController serves SSE status preview", async () => {
  const controller = new BrowserMcpHttpEndpointController();

  try {
    const running = await controller.start({ port: 0 });
    const response = await fetch(running.streamUrl ?? "");
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/event-stream/);
    assert.match(body, /endpoint\.status/);
  } finally {
    await controller.dispose();
  }
});

test("BrowserMcpHttpEndpointController keeps an already running endpoint stable", async () => {
  const controller = new BrowserMcpHttpEndpointController();

  try {
    const first = await controller.start({ port: 0 });
    const second = await controller.start({ port: 0 });

    assert.equal(first.status, "running");
    assert.deepEqual(second, first);
  } finally {
    await controller.dispose();
  }
});

test("BrowserMcpHttpEndpointController serves Browser MCP calls", async () => {
  await withTempStore(async (dir) => {
    const controller = new BrowserMcpHttpEndpointController({
      getStoreBaseDir: () => dir
    });

    try {
      const running = await controller.start({ port: 0 });
      const response = await fetch(running.url ?? "", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          id: "endpoint-tools-list",
          method: "tools/list",
          workspaceName
        })
      });
      const body = (await response.json()) as BrowserMcpLocalConnectorResult;

      assert.equal(response.status, 200);
      assert.equal(body.summary.status, "ok");
      assert.equal(body.response.ok, true);
      assert.equal(body.response.method, "tools/list");

      const audit = await controller.listAuditEvents();
      assert.equal(audit.events[0].kind, "mcp_request");
      assert.equal(audit.events[0].requestId, "endpoint-tools-list");
      assert.equal(audit.events[0].toolCount, body.response.ok && body.response.method === "tools/list" ? body.response.result.tools.length : 0);
    } finally {
      await controller.dispose();
    }
  });
});

test("BrowserMcpHttpEndpointController applies stored approval decisions to retried MCP calls", async () => {
  await withTempStore(async (dir) => {
    const controller = new BrowserMcpHttpEndpointController({
      getStoreBaseDir: () => dir
    });

    try {
      const running = await controller.start({ port: 0 });
      await controller.saveApprovalDecision({
        auditEventId: "audit-approved-call",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:01:00.000Z",
        sessionId: running.sessionId,
        requestId: "endpoint-approved-call",
        workspaceName,
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "approved"
      });

      const response = await fetch(running.url ?? "", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          id: "endpoint-approved-call",
          method: "tools/call",
          workspaceName,
          createdAt: "2026-05-28T12:02:00.000Z",
          params: {
            toolId: "navigate",
            input: { url: "https://docs.oracle.com/" },
            requestedBy: "mcp_client"
          }
        })
      });
      const body = (await response.json()) as BrowserMcpLocalConnectorResult;

      assert.equal(response.status, 200);
      assert.equal(body.summary.executionStatus, "completed");
      assert.equal(body.summary.approvalDecisionStatus, "approved_preview");

      const audit = await controller.listAuditEvents();
      assert.equal(audit.events[0].kind, "mcp_request");
      assert.equal(audit.events[0].status, "ok");
      assert.equal(audit.events[0].approvalDecisionStatus, "approved_preview");
    } finally {
      await controller.dispose();
    }
  });
});

test("BrowserMcpHttpEndpointController clears audit events", async () => {
  await withTempStore(async (dir) => {
    const controller = new BrowserMcpHttpEndpointController({
      getStoreBaseDir: () => dir
    });

    try {
      await controller.start({ port: 0 });
      assert.ok((await controller.listAuditEvents()).events.length > 0);
      const cleared = await controller.clearAuditEvents();
      assert.equal(cleared.ok, true);
      assert.deepEqual(await controller.listAuditEvents(), { events: [] });
    } finally {
      await controller.dispose();
    }
  });
});

test("BrowserMcpHttpEndpointController persists approval decisions separately from audit events", async () => {
  await withTempStore(async (dir) => {
    const controller = new BrowserMcpHttpEndpointController({
      getStoreBaseDir: () => dir
    });

    const saved = await controller.saveApprovalDecision({
      auditEventId: "audit-1",
      status: "approved_preview",
      decidedAt: "2026-05-28T12:00:00.000Z",
      sessionId: "session-1",
      requestId: "request-1",
      workspaceName,
      mcpMethod: "tools/call",
      toolId: "navigate",
      policyReason: "approval required",
      confirmationSummary: "approved"
    });

    assert.equal(saved.decision.auditEventId, "audit-1");
    assert.equal(saved.decision.status, "approved_preview");
    assert.deepEqual(await controller.listApprovalDecisions(), {
      decisions: [saved.decision]
    });
    assert.deepEqual(await controller.listAuditEvents(), { events: [] });

    const cleared = await controller.clearApprovalDecisions();
    assert.equal(cleared.ok, true);
    assert.deepEqual(await controller.listApprovalDecisions(), { decisions: [] });
  });
});

test("BrowserMcpHttpEndpointController reports invalid port as endpoint error", async () => {
  const controller = new BrowserMcpHttpEndpointController();
  const state = await controller.start({ port: 70_000 });

  assert.equal(state.status, "error");
  assert.match(state.error ?? "", /port/);
  await controller.dispose();
});
