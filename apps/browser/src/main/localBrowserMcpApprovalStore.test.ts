import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  clearBrowserMcpApprovalDecisions,
  listBrowserMcpApprovalDecisions,
  upsertBrowserMcpApprovalDecision
} from "./localBrowserMcpApprovalStore";

async function withTempStore(action: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "ai-launchpad-browser-mcp-approval-"));
  try {
    await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("Browser MCP approval store persists the latest decision per audit event", async () => {
  await withTempStore(async (dir) => {
    await upsertBrowserMcpApprovalDecision(dir, {
      auditEventId: "audit-1",
      status: "approved_preview",
      decidedAt: "2026-05-28T12:00:00.000Z",
      workspaceName: "Oracle PoC Workspace",
      mcpMethod: "tools/call",
      toolId: "navigate",
      policyReason: "approval required",
      confirmationSummary: "approved"
    });
    const revoked = await upsertBrowserMcpApprovalDecision(dir, {
      auditEventId: "audit-1",
      status: "revoked_preview",
      decidedAt: "2026-05-28T12:01:00.000Z",
      workspaceName: "Oracle PoC Workspace",
      mcpMethod: "tools/call",
      toolId: "navigate",
      policyReason: "approval required",
      confirmationSummary: "revoked"
    });

    const decisions = await listBrowserMcpApprovalDecisions(dir);
    assert.equal(decisions.length, 1);
    assert.equal(decisions[0].id, revoked.id);
    assert.equal(decisions[0].status, "revoked_preview");
  });
});

test("Browser MCP approval store enforces max decisions and clears store", async () => {
  await withTempStore(async (dir) => {
    await upsertBrowserMcpApprovalDecision(
      dir,
      {
        auditEventId: "audit-1",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:00:00.000Z",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "navigate",
        policyReason: "approval required",
        confirmationSummary: "approved"
      },
      1
    );
    await upsertBrowserMcpApprovalDecision(
      dir,
      {
        auditEventId: "audit-2",
        status: "approved_preview",
        decidedAt: "2026-05-28T12:01:00.000Z",
        workspaceName: "Oracle PoC Workspace",
        mcpMethod: "tools/call",
        toolId: "extract_text",
        policyReason: "approval required",
        confirmationSummary: "approved"
      },
      1
    );

    assert.equal((await listBrowserMcpApprovalDecisions(dir)).length, 1);
    await clearBrowserMcpApprovalDecisions(dir);
    assert.deepEqual(await listBrowserMcpApprovalDecisions(dir), []);
  });
});
