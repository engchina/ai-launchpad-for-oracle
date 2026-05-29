import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserCliControlPreview } from "./browserCliControl";

test("createBrowserCliControlPreview builds safe CLI command previews", () => {
  const preview = createBrowserCliControlPreview({
    workspaceName: "金融向け RAG 提案",
    playbookTitle: "RAG Chatbot on Oracle AI Database 26ai",
    currentUrl: "https://docs.oracle.com/en/cloud/paas/base-database/",
    currentTitle: "Oracle Base Database Service",
    providerLabel: "OCI GenAI Enterprise",
    mcpEndpointStatus: "preview",
    captureCount: 2,
    knowledgeChunkCount: 8
  });

  assert.equal(preview.title, "CLI Control Preview");
  assert.equal(preview.commands.length, 5);
  assert.equal(preview.readyCount, 2);
  assert.equal(preview.reviewCount, 2);
  assert.equal(preview.blockedCount, 1);
  assert.match(preview.commands.find((command) => command.id === "open_current_page")?.command ?? "", /launchpad open/);
  assert.match(preview.commands.find((command) => command.id === "ask_current_page")?.command ?? "", /OCI GenAI Enterprise/);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source \/ CLI implementation reuse/);
});

test("createBrowserCliControlPreview keeps workflow schedule and MCP execution review-only", () => {
  const preview = createBrowserCliControlPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    currentUrl: "https://example.com/",
    currentTitle: "Example",
    providerLabel: "OCI GenAI Enterprise",
    mcpEndpointStatus: "running",
    captureCount: 0,
    knowledgeChunkCount: 0
  });
  const workflowCommand = preview.commands.find((command) => command.id === "draft_workflow");
  const scheduleCommand = preview.commands.find((command) => command.id === "draft_schedule");
  const mcpCommand = preview.commands.find((command) => command.id === "mcp_status");

  assert.equal(workflowCommand?.status, "review");
  assert.equal(scheduleCommand?.risk, "review");
  assert.equal(mcpCommand?.status, "review");
  assert.equal(preview.actions.find((action) => action.id === "execute_commands")?.enabled, false);
});

test("createBrowserCliControlPreview blocks MCP command when endpoint is not ready", () => {
  const preview = createBrowserCliControlPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    currentUrl: "https://example.com/",
    currentTitle: "Example",
    providerLabel: "OCI GenAI Enterprise",
    mcpEndpointStatus: "stopped",
    captureCount: 1,
    knowledgeChunkCount: 1
  });
  const mcpCommand = preview.commands.find((command) => command.id === "mcp_status");

  assert.equal(mcpCommand?.status, "blocked");
  assert.equal(mcpCommand?.risk, "blocked");
  assert.match(mcpCommand?.detail ?? "", /blocked/);
});

test("createBrowserCliControlPreview redacts sensitive URL parameters", () => {
  const preview = createBrowserCliControlPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    currentUrl: "https://example.com/report?token=abc123&wallet=/tmp/wallet.zip&region=ap-tokyo-1",
    currentTitle: "Example",
    providerLabel: "OCI GenAI Enterprise",
    mcpEndpointStatus: "preview",
    captureCount: 1,
    knowledgeChunkCount: 1
  });
  const commandText = preview.commands.map((command) => command.command).join("\n");

  assert.doesNotMatch(commandText, /abc123/);
  assert.doesNotMatch(commandText, /wallet\.zip/);
  assert.match(commandText, /redacted=1/);
});
