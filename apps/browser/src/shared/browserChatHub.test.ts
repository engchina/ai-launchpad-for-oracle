import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  createBrowserChatPanelPreview,
  createBrowserHubComparisonPreview,
  getNextBrowserChatProviderId,
  type BrowserChatPanelPreviewPayload
} from "./browserChatHub";

const payload: BrowserChatPanelPreviewPayload = {
  workspaceName: "Oracle PoC Workspace",
  url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
  title: "Oracle AI Vector Search",
  sourceType: "oracle_docs",
  selectedText: "Vector indexes and hybrid search are relevant to this proof of concept.",
  captureCount: 2,
  knowledgeChunkCount: 4,
  screenshotAttached: false
};

test("createBrowserChatPanelPreview keeps OCI GenAI as the default provider", () => {
  const preview = createBrowserChatPanelPreview({
    ...payload,
    activeProviderId: "local_keyword_baseline"
  });

  assert.equal(preview.activeProviderId, "local_keyword_baseline");
  assert.equal(preview.providers[0].id, "oci_genai_enterprise");
  assert.equal(preview.contextSummary, "3/4 context sources included");
  assert.equal(preview.attachments.find((attachment) => attachment.kind === "selection")?.status, "included");
  assert.equal(preview.toolbarActions.find((action) => action.id === "open_external")?.enabled, false);
  assert.match(preview.localOnlyNotice, /secret/);
});

test("createBrowserChatPanelPreview falls back to OCI GenAI for unknown provider ids", () => {
  const preview = createBrowserChatPanelPreview({
    ...payload,
    activeProviderId: "unknown_provider" as never
  });

  assert.equal(preview.activeProviderId, "oci_genai_enterprise");
  assert.equal(preview.activeProviderLabel, "OCI GenAI Project");
  assert.equal(preview.toolbarActions.find((action) => action.id === "open_external")?.enabled, true);
});

test("getNextBrowserChatProviderId cycles providers with OCI GenAI fallback", () => {
  assert.equal(getNextBrowserChatProviderId("oci_genai_enterprise"), "oracle_vector_grounding");
  assert.equal(getNextBrowserChatProviderId("oracle_vector_grounding"), "local_keyword_baseline");
  assert.equal(getNextBrowserChatProviderId("local_keyword_baseline"), "oci_genai_enterprise");
  assert.equal(getNextBrowserChatProviderId("missing" as never), "oci_genai_enterprise");
});

test("createBrowserHubComparisonPreview clamps panes to three and keeps active pane first", () => {
  const panel = createBrowserChatPanelPreview({
    ...payload,
    activeProviderId: "oracle_vector_grounding"
  });
  const hub = createBrowserHubComparisonPreview(panel, 8);

  assert.equal(hub.paneCount, 3);
  assert.deepEqual(hub.panelSelector, [1, 2, 3]);
  assert.equal(hub.panes.length, 3);
  assert.equal(hub.panes[0].providerId, "oracle_vector_grounding");
  assert.equal(hub.panes[0].selected, true);
  assert.equal(hub.panes[0].responseState, "preview_ready");
  assert.equal(hub.panes[0].sendEnabled, false);
  assert.equal(hub.panes[1].providerId, "oci_genai_enterprise");
  assert.match(hub.guardrails.join("\n"), /external BYOK/);
});

test("createBrowserHubComparisonPreview supports one-pane focused mode", () => {
  const panel = createBrowserChatPanelPreview(payload);
  const hub = createBrowserHubComparisonPreview(panel, 1);

  assert.equal(hub.paneCount, 1);
  assert.equal(hub.panes.length, 1);
  assert.equal(hub.panes[0].providerId, "oci_genai_enterprise");
  assert.match(hub.panes[0].responsePreview, /OCI GenAI Enterprise AI Project/);
  assert.ok(hub.comparisonChecks.some((check) => check.includes("page context")));
});

test("createBrowserHubComparisonPreview marks grounding lane as needing evidence without knowledge", () => {
  const panel = createBrowserChatPanelPreview({
    ...payload,
    activeProviderId: "oracle_vector_grounding",
    captureCount: 0,
    knowledgeChunkCount: 0
  });
  const hub = createBrowserHubComparisonPreview(panel, 2);

  assert.equal(hub.panes[0].providerId, "oracle_vector_grounding");
  assert.equal(hub.panes[0].responseState, "needs_evidence");
  assert.match(hub.panes[0].evidenceLabel, /missing/);
  assert.equal(hub.panes.every((pane) => pane.sendEnabled === false), true);
});
