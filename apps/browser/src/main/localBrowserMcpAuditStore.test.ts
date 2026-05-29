import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  appendBrowserMcpAuditEvent,
  clearBrowserMcpAuditEvents,
  listBrowserMcpAuditEvents
} from "./localBrowserMcpAuditStore";

async function withTempStore(action: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "ai-launchpad-browser-mcp-audit-"));
  try {
    await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("Browser MCP audit store persists newest events first", async () => {
  await withTempStore(async (dir) => {
    const first = await appendBrowserMcpAuditEvent(dir, {
      kind: "endpoint_started",
      status: "ok",
      occurredAt: "2026-05-28T10:00:00.000Z",
      sessionId: "session-1"
    });
    const second = await appendBrowserMcpAuditEvent(dir, {
      kind: "mcp_request",
      status: "waiting_approval",
      occurredAt: "2026-05-28T10:01:00.000Z",
      sessionId: "session-1",
      requestId: "request-1",
      mcpMethod: "tools/call",
      toolId: "navigate"
    });

    const events = await listBrowserMcpAuditEvents(dir);
    assert.equal(events.length, 2);
    assert.equal(events[0].id, second.id);
    assert.equal(events[1].id, first.id);
    assert.equal(events[0].toolId, "navigate");
  });
});

test("Browser MCP audit store enforces max events and clears store", async () => {
  await withTempStore(async (dir) => {
    await appendBrowserMcpAuditEvent(
      dir,
      {
        kind: "health_check",
        status: "ok",
        occurredAt: "2026-05-28T10:00:00.000Z"
      },
      1
    );
    await appendBrowserMcpAuditEvent(
      dir,
      {
        kind: "stream_preview",
        status: "ok",
        occurredAt: "2026-05-28T10:01:00.000Z"
      },
      1
    );

    assert.equal((await listBrowserMcpAuditEvents(dir)).length, 1);
    await clearBrowserMcpAuditEvents(dir);
    assert.deepEqual(await listBrowserMcpAuditEvents(dir), []);
  });
});
