import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserVerticalTabsPreview, type BrowserVerticalTabsPreviewPayload } from "./browserVerticalTabs";

const payload: BrowserVerticalTabsPreviewPayload = {
  workspaceName: "Oracle PoC Workspace",
  currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
  currentTitle: "Oracle AI Vector Search",
  sourceType: "oracle_docs",
  capturedUrls: ["https://github.com/oracle-samples/oracle-ai-vector-search"]
};

test("createBrowserVerticalTabsPreview marks the current tab and captured tabs", () => {
  const preview = createBrowserVerticalTabsPreview(payload);

  assert.equal(preview.enabled, true);
  assert.equal(preview.tabCount, 4);
  assert.equal(preview.visibleTabCount, 4);
  assert.equal(preview.railWidthLabel, "full-title");
  assert.equal(preview.tabs.find((tab) => tab.active)?.title, "Oracle AI Vector Search");
  assert.equal(preview.tabs.find((tab) => tab.sourceType === "github")?.status, "captured");
});

test("createBrowserVerticalTabsPreview inserts an unknown current page into workspace group", () => {
  const preview = createBrowserVerticalTabsPreview({
    ...payload,
    currentUrl: "https://example.com/customer-brief",
    currentTitle: "Customer Brief",
    sourceType: "other"
  });

  assert.equal(preview.tabCount, 5);
  assert.equal(preview.tabs[0].title, "Customer Brief");
  assert.equal(preview.tabs[0].groupId, "workspace");
  assert.equal(preview.tabs[0].active, true);
});

test("createBrowserVerticalTabsPreview hides tabs for collapsed groups", () => {
  const preview = createBrowserVerticalTabsPreview({
    ...payload,
    collapsedGroupIds: ["research"]
  });

  assert.equal(preview.groups.find((group) => group.id === "research")?.collapsed, true);
  assert.equal(preview.visibleTabs.some((tab) => tab.groupId === "research"), false);
  assert.equal(preview.visibleTabCount, preview.tabs.filter((tab) => tab.groupId !== "research").length);
});

test("createBrowserVerticalTabsPreview supports icon-only rail mode", () => {
  const preview = createBrowserVerticalTabsPreview({
    ...payload,
    railCollapsed: true
  });

  assert.equal(preview.railCollapsed, true);
  assert.equal(preview.railWidthLabel, "icon-only");
});
