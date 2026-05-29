import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  createBrowserRailLocalTabDraft,
  createBrowserRailSections,
  getActiveBrowserRailPageTabId,
  getVisibleBrowserRailSections,
  normalizeBrowserRailUrl,
  selectBrowserRailFallbackTab,
  type BrowserRailSection,
  type BrowserRailTabLike
} from "./browserRailTabs";

type TestTab = BrowserRailTabLike & {
  pinned?: boolean;
};

const baseSections: BrowserRailSection<TestTab>[] = [
  {
    id: "active",
    tabs: [
      { id: "onboarding", label: "Onboarding", route: "onboarding" },
      { id: "workspace", label: "Workspace", route: "workspace" },
      { id: "docs", label: "Docs", pageTarget: { url: "https://DOCS.example.com/path/" }, closeable: true }
    ]
  },
  {
    id: "assistant",
    tabs: [{ id: "assistant", label: "Assistant", agenticMode: "agent" }]
  }
];

test("createBrowserRailSections inserts local tabs after workspace in the active section", () => {
  const localTab: TestTab = {
    id: "local-tab-1",
    label: "New Tab 1",
    pageTarget: { url: "https://example.com", title: "Example" },
    closeable: true,
    local: true
  };

  const sections = createBrowserRailSections(baseSections, [localTab]);

  assert.deepEqual(
    sections[0].tabs.map((tab) => tab.id),
    ["onboarding", "workspace", "local-tab-1", "docs"]
  );
  assert.deepEqual(
    baseSections[0].tabs.map((tab) => tab.id),
    ["onboarding", "workspace", "docs"]
  );
});

test("selectBrowserRailFallbackTab selects the next visible tab after closing a middle tab", () => {
  const sections = createBrowserRailSections(baseSections, [
    {
      id: "local-tab-1",
      label: "New Tab 1",
      pageTarget: { url: "https://example.com", title: "Example" },
      closeable: true,
      local: true
    }
  ]);

  assert.equal(selectBrowserRailFallbackTab(sections, [], "local-tab-1")?.id, "docs");
});

test("selectBrowserRailFallbackTab selects the previous visible tab after closing the last tab", () => {
  assert.equal(selectBrowserRailFallbackTab(baseSections, [], "assistant")?.id, "docs");
});

test("selectBrowserRailFallbackTab skips closed tabs before choosing a fallback", () => {
  assert.equal(selectBrowserRailFallbackTab(baseSections, ["docs"], "workspace")?.id, "assistant");
});

test("getVisibleBrowserRailSections excludes closed tabs and empty sections", () => {
  const visibleSections = getVisibleBrowserRailSections(baseSections, ["onboarding", "workspace", "docs"]);

  assert.deepEqual(
    visibleSections.map((section) => section.id),
    ["assistant"]
  );
});

test("getActiveBrowserRailPageTabId prefers the active tab when several page tabs share the same URL", () => {
  const sections = createBrowserRailSections(baseSections, [
    {
      id: "local-tab-1",
      label: "New Tab 1",
      pageTarget: { url: "https://docs.example.com/path", title: "Docs copy" },
      closeable: true,
      local: true
    }
  ]);

  assert.equal(getActiveBrowserRailPageTabId(sections, "local-tab-1", "workspace", "https://docs.example.com/path/"), "local-tab-1");
  assert.equal(getActiveBrowserRailPageTabId(sections, "missing", "workspace", "https://docs.example.com/path/"), "local-tab-1");
});

test("normalizeBrowserRailUrl trims, lowercases, and ignores trailing slashes", () => {
  assert.equal(normalizeBrowserRailUrl(" HTTPS://Docs.Example.com/Path/// "), "https://docs.example.com/path");
});

test("createBrowserRailLocalTabDraft returns the stable local tab fields", () => {
  assert.deepEqual(createBrowserRailLocalTabDraft(3, "https://example.com", "Example"), {
    id: "local-tab-3",
    label: "New Tab 3",
    pageTarget: { url: "https://example.com", title: "Example" },
    closeable: true,
    local: true
  });
});
