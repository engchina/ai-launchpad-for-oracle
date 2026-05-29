import * as assert from "node:assert/strict";
import { test } from "node:test";
import { approveBrowserToolInvocation, createBrowserToolInvocationPreview } from "./browserToolInvocation";
import { executeBrowserToolDryRun } from "./browserToolExecutor";

const fixedCreatedAt = "2026-05-28T11:00:00.000Z";
const workspaceName = "金融向け RAG 提案";

test("executeBrowserToolDryRun completes ready read-only tools", () => {
  const invocation = createBrowserToolInvocationPreview({
    toolId: "extract_text",
    requestedBy: "agent_plan",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  const execution = executeBrowserToolDryRun(invocation.draft, fixedCreatedAt);

  assert.equal(execution.status, "completed");
  assert.equal(execution.mode, "dry_run");
  assert.match(execution.output.summary, /read-only dry-run/);
  assert.equal(execution.events[0]?.level, "info");
});

test("executeBrowserToolDryRun stops write tools until approval", () => {
  const invocation = createBrowserToolInvocationPreview({
    toolId: "navigate",
    input: { url: "https://docs.oracle.com/" },
    requestedBy: "user_preview",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  const execution = executeBrowserToolDryRun(invocation.draft, fixedCreatedAt);

  assert.equal(execution.status, "waiting_approval");
  assert.equal(execution.events[0]?.level, "approval");
  assert.equal(execution.output.data.requiredApproval, true);
});

test("executeBrowserToolDryRun records approved write tools as dry-run only", () => {
  const invocation = createBrowserToolInvocationPreview({
    toolId: "navigate",
    input: { url: "https://docs.oracle.com/" },
    requestedBy: "user_preview",
    workspaceName,
    createdAt: fixedCreatedAt
  });
  const approved = approveBrowserToolInvocation(invocation.draft);

  const execution = executeBrowserToolDryRun(approved.draft, fixedCreatedAt);

  assert.equal(execution.status, "completed");
  assert.equal(execution.output.data.dryRunOnly, true);
});

test("executeBrowserToolDryRun preserves blocked tool decisions", () => {
  const invocation = createBrowserToolInvocationPreview({
    toolId: "history_delete",
    requestedBy: "mcp_client",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  const execution = executeBrowserToolDryRun(invocation.draft, fixedCreatedAt);

  assert.equal(execution.status, "blocked");
  assert.equal(execution.events[0]?.level, "blocked");
  assert.equal(execution.output.data.blocked, true);
});

test("executeBrowserToolDryRun keeps unknown tools out of executor paths", () => {
  const invocation = createBrowserToolInvocationPreview({
    toolId: "external.unknown",
    requestedBy: "scheduler",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  const execution = executeBrowserToolDryRun(invocation.draft, fixedCreatedAt);

  assert.equal(execution.status, "unknown_tool");
  assert.equal(execution.events[0]?.level, "blocked");
});
