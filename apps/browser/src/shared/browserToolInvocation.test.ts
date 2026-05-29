import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserToolCatalog } from "./browserToolCatalog";
import { approveBrowserToolInvocation, createBrowserToolInvocationPreview } from "./browserToolInvocation";

const fixedCreatedAt = "2026-05-28T10:15:00.000Z";
const workspaceName = "金融向け RAG 提案";

test("read-only tools produce ready invocation drafts", () => {
  const preview = createBrowserToolInvocationPreview({
    toolId: "extract_text",
    requestedBy: "agent_plan",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  assert.equal(preview.draft.status, "ready");
  assert.equal(preview.draft.approval, "not_required");
  assert.equal(preview.events[0]?.level, "info");
});

test("browser write tools require approval before execution", () => {
  const preview = createBrowserToolInvocationPreview({
    toolId: "navigate",
    input: { url: "https://docs.oracle.com/" },
    requestedBy: "user_preview",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  assert.equal(preview.draft.status, "waiting_approval");
  assert.equal(preview.draft.approval, "required");
  assert.equal(preview.events[0]?.level, "approval");

  const approved = approveBrowserToolInvocation(preview.draft);
  assert.equal(approved.draft.status, "approved");
  assert.equal(approved.events[0]?.level, "approval");
});

test("destructive tools are blocked by default", () => {
  const preview = createBrowserToolInvocationPreview({
    toolId: "history_delete_range",
    input: { since: "2026-05-01" },
    requestedBy: "mcp_client",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  assert.equal(preview.draft.status, "blocked");
  assert.equal(preview.draft.approval, "blocked_by_default");
  assert.equal(preview.events[0]?.level, "blocked");
});

test("unknown tools are blocked and audited", () => {
  const preview = createBrowserToolInvocationPreview({
    toolId: "external.delete_all",
    requestedBy: "scheduler",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  assert.equal(preview.draft.status, "unknown_tool");
  assert.equal(preview.draft.safety, "unknown");
  assert.match(preview.events[0]?.message ?? "", /catalog/);
});

test("tool ids can be addressed by generated id or compatible name", () => {
  const navigate = createBrowserToolCatalog().find((tool) => tool.compatibleName === "navigate");
  assert.ok(navigate);

  const preview = createBrowserToolInvocationPreview({
    toolId: navigate.id,
    requestedBy: "agent_plan",
    workspaceName,
    createdAt: fixedCreatedAt
  });

  assert.equal(preview.draft.compatibleName, "navigate");
  assert.ok(preview.draft.id.startsWith("tool-call-20260528101500-"));
});
