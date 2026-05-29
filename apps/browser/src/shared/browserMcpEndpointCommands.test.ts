import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserMcpEndpointState } from "./api";
import {
  createBrowserMcpClientCommands,
  createBrowserMcpClientOnboardingPreview,
  getBrowserMcpEndpointDisplayUrl
} from "./browserMcpEndpointCommands";

test("getBrowserMcpEndpointDisplayUrl uses running URL when present", () => {
  const state: BrowserMcpEndpointState = {
    status: "running",
    config: {
      host: "127.0.0.1",
      port: 9239,
      endpointPath: "/mcp",
      healthPath: "/health",
      streamPath: "/sse"
    },
    message: "running",
    url: "http://127.0.0.1:9239/mcp",
    healthUrl: "http://127.0.0.1:9239/health"
  };

  assert.equal(getBrowserMcpEndpointDisplayUrl(state), "http://127.0.0.1:9239/mcp");
});

test("getBrowserMcpEndpointDisplayUrl derives URL for stopped endpoint", () => {
  const state: BrowserMcpEndpointState = {
    status: "stopped",
    config: {
      host: "127.0.0.1",
      port: 9239,
      endpointPath: "/mcp",
      healthPath: "/health",
      streamPath: "/sse"
    },
    message: "stopped"
  };

  assert.equal(getBrowserMcpEndpointDisplayUrl(state), "http://127.0.0.1:9239/mcp");
});

test("createBrowserMcpClientCommands creates stable external client commands", () => {
  const commands = createBrowserMcpClientCommands("http://127.0.0.1:9239/mcp");

  assert.deepEqual(
    commands.map((command) => command.id),
    ["codex", "claude-code", "gemini-cli", "openclaw", "claude-desktop"]
  );
  assert.match(commands[0].command, /^codex mcp add/);
  assert.match(commands[1].command, /--transport http/);
  assert.match(commands[2].command, /--scope user/);
  assert.match(commands[3].command, /"url": "http:\/\/127\.0\.0\.1:9239\/mcp"/);
  assert.match(commands[4].command, /"mcp-remote"/);
});

test("createBrowserMcpClientOnboardingPreview summarizes ready MCP client setup", () => {
  const state: BrowserMcpEndpointState = {
    status: "running",
    config: {
      host: "127.0.0.1",
      port: 9239,
      endpointPath: "/mcp",
      healthPath: "/health",
      streamPath: "/sse"
    },
    message: "running",
    url: "http://127.0.0.1:9239/mcp"
  };
  const preview = createBrowserMcpClientOnboardingPreview(state);

  assert.equal(preview.title, "MCP Client Onboarding Preview");
  assert.equal(preview.endpointUrl, "http://127.0.0.1:9239/mcp");
  assert.equal(preview.clients.length, 5);
  assert.equal(preview.clients.find((client) => client.id === "codex")?.status, "ready");
  assert.equal(preview.clients.find((client) => client.id === "openclaw")?.status, "copy_required");
  assert.equal(preview.toolCategories.reduce((sum, category) => sum + category.count, 0), 53);
  assert.equal(preview.externalAppGroups.some((group) => group.label === "Oracle Enterprise"), true);
  assert.match(preview.customMcpServer.sseUrlPlaceholder, /\/sse$/);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
});

test("createBrowserMcpClientOnboardingPreview gates clients when endpoint is stopped", () => {
  const state: BrowserMcpEndpointState = {
    status: "stopped",
    config: {
      host: "127.0.0.1",
      port: 9239,
      endpointPath: "/mcp",
      healthPath: "/health",
      streamPath: "/sse"
    },
    message: "stopped"
  };
  const preview = createBrowserMcpClientOnboardingPreview(state);

  assert.equal(preview.endpointUrl, "http://127.0.0.1:9239/mcp");
  assert.equal(preview.clients.every((client) => client.status === "endpoint_stopped"), true);
  assert.equal(preview.setupSteps.find((step) => step.id === "copy-url")?.status, "endpoint_stopped");
});
