import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserCoworkPreview } from "./browserCowork";

test("createBrowserCoworkPreview creates a workspace-scoped browser and file plan", () => {
  const preview = createBrowserCoworkPreview({
    workspaceName: "金融向け RAG 提案",
    playbookTitle: "Oracle Vector PoC",
    currentTitle: "Oracle AI Vector Search Documentation",
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    task: "現在ページから顧客向け research report を作成する。",
    captureCount: 2,
    knowledgeChunkCount: 8
  });

  assert.equal(preview.workspaceName, "金融向け RAG 提案");
  assert.equal(preview.operationCount, 5);
  assert.equal(preview.readyCount, 2);
  assert.equal(preview.reviewCount, 2);
  assert.equal(preview.blockedCount, 1);
  assert.equal(preview.canRun, false);
  assert.equal(preview.details.includes("captures: 2"), true);
  assert.equal(preview.details.includes("knowledge chunks: 8"), true);
  assert.equal(preview.artifacts.length, 2);
  assert.match(preview.artifacts[0]?.fileName ?? "", /^reports\//);
  assert.match(preview.guardrails.join("\n"), /workspace 配下だけ/);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
});

test("createBrowserCoworkPreview keeps writes and commands review-only or blocked", () => {
  const preview = createBrowserCoworkPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "Proposal follow-up",
    currentTitle: "OCI Console",
    currentUrl: "https://cloud.oracle.com/",
    task: "read files and run a command",
    captureCount: 0,
    knowledgeChunkCount: 0
  });
  const fileWrite = preview.operations.find((operation) => operation.kind === "file_write");
  const command = preview.operations.find((operation) => operation.kind === "command_preview");

  assert.equal(fileWrite?.status, "needs_review");
  assert.equal(fileWrite?.approvalRequired, true);
  assert.equal(command?.status, "blocked");
  assert.equal(command?.risk, "blocked");
  assert.equal(command?.approvalRequired, true);
  assert.equal(preview.artifacts.every((artifact) => artifact.canWrite === false), true);
  assert.match(command?.outputLabel ?? "", /explicit approval/);
});
