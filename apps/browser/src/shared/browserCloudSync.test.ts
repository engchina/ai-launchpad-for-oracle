import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserCloudSyncPreview } from "./browserCloudSync";

test("createBrowserCloudSyncPreview starts signed out and local-first", () => {
  const preview = createBrowserCloudSyncPreview({
    workspaceName: "金融向け RAG 提案",
    playbookTitle: "RAG Chatbot on Oracle AI Database 26ai",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 2,
    knowledgeChunkCount: 8
  });

  assert.equal(preview.title, "Cloud Sync Preview");
  assert.equal(preview.status, "signed_out");
  assert.equal(preview.statusLabel, "Signed out / local only");
  assert.equal(preview.syncCandidateCount, 4);
  assert.equal(preview.localOnlyCount, 6);
  assert.equal(preview.excludedCount, 1);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
  assert.match(preview.guardrails.join("\n"), /cloud sync request を開始しない/);
});

test("createBrowserCloudSyncPreview marks conversations model settings and tasks as sync candidates", () => {
  const preview = createBrowserCloudSyncPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 0,
    knowledgeChunkCount: 0,
    scheduledTaskCount: 3,
    signedIn: true
  });
  const candidates = preview.scopes.filter((scope) => scope.decision === "sync_candidate").map((scope) => scope.id);

  assert.deepEqual(candidates, ["conversations", "model_settings", "scheduled_tasks", "profile"]);
  assert.equal(preview.status, "ready");
  assert.equal(preview.scopes.find((scope) => scope.id === "scheduled_tasks")?.itemCount, 3);
  assert.equal(preview.actions.find((action) => action.id === "sign_in_preview")?.enabled, false);
});

test("createBrowserCloudSyncPreview keeps memory soul workflows and run outputs local", () => {
  const preview = createBrowserCloudSyncPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 4,
    knowledgeChunkCount: 6
  });
  const localOnlyIds = preview.scopes.filter((scope) => scope.decision === "local_only").map((scope) => scope.id);

  assert.ok(localOnlyIds.includes("workspace_folders"));
  assert.ok(localOnlyIds.includes("mcp_servers"));
  assert.ok(localOnlyIds.includes("workflows"));
  assert.ok(localOnlyIds.includes("run_outputs"));
  assert.ok(localOnlyIds.includes("memory_soul"));
  assert.ok(localOnlyIds.includes("captures"));
});

test("createBrowserCloudSyncPreview always excludes credentials and wallets", () => {
  const preview = createBrowserCloudSyncPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 1,
    knowledgeChunkCount: 1,
    signedIn: true,
    syncPaused: true
  });
  const credentialScope = preview.scopes.find((scope) => scope.id === "credentials");

  assert.equal(preview.status, "paused");
  assert.equal(credentialScope?.decision, "excluded");
  assert.match(credentialScope?.detail ?? "", /private key/);
  assert.equal(preview.actions.find((action) => action.id === "sync_now")?.enabled, false);
});
