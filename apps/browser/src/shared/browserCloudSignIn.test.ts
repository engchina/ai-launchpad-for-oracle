import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserCloudSignInPreview } from "./browserCloudSignIn";
import { createBrowserCloudSyncPreview } from "./browserCloudSync";

test("createBrowserCloudSignInPreview maps BrowserOS-like sign-in methods without starting auth", () => {
  const syncPreview = createBrowserCloudSyncPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 2,
    knowledgeChunkCount: 5
  });
  const preview = createBrowserCloudSignInPreview(syncPreview);

  assert.equal(preview.title, "Cloud Sign In Preview");
  assert.equal(preview.workspaceName, "Oracle Launchpad");
  assert.deepEqual(
    preview.methods.map((method) => method.id),
    ["magic_link", "google_oauth", "oracle_sso"]
  );
  assert.equal(preview.methods[0]?.status, "available");
  assert.equal(preview.steps.find((step) => step.id === "start-auth")?.status, "blocked");
  assert.match(preview.localOnlyNotice, /認証 UX の preview/);
  assert.match(preview.guardrails.join("\n"), /network request/);
});

test("createBrowserCloudSignInPreview summarizes sync local and excluded buckets", () => {
  const syncPreview = createBrowserCloudSyncPreview({
    workspaceName: "FY26 Readiness",
    playbookTitle: "Vector Search",
    activeProviderLabel: "OCI GenAI Enterprise",
    captureCount: 4,
    knowledgeChunkCount: 8,
    scheduledTaskCount: 2,
    signedIn: true,
    syncPaused: true
  });
  const preview = createBrowserCloudSignInPreview(syncPreview);

  assert.equal(preview.statusLabel, "Signed in / sync paused");
  assert.deepEqual(
    preview.syncBuckets.map((bucket) => bucket.value),
    ["4", "6", "1"]
  );
  assert.deepEqual(preview.excludedLabels, ["Credentials and wallets"]);
  assert.match(preview.steps.find((step) => step.id === "review-sync")?.detail ?? "", /4 sync candidates/);
});
