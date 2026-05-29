import type { PageSourceType } from "./api";

export type BrowserVerticalTabGroupId = "workspace" | "research" | "execution";
export type BrowserVerticalTabStatus = "active" | "open" | "captured";

export type BrowserVerticalTabItem = {
  id: string;
  title: string;
  url: string;
  sourceType: PageSourceType;
  groupId: BrowserVerticalTabGroupId;
  active: boolean;
  pinned: boolean;
  status: BrowserVerticalTabStatus;
  badgeLabel: string;
};

export type BrowserVerticalTabGroup = {
  id: BrowserVerticalTabGroupId;
  label: string;
  collapsed: boolean;
  tabCount: number;
  activeCount: number;
};

export type BrowserVerticalTabsPreview = {
  id: string;
  enabled: boolean;
  railCollapsed: boolean;
  railWidthLabel: "icon-only" | "full-title";
  activeTabId: string;
  tabCount: number;
  visibleTabCount: number;
  groups: BrowserVerticalTabGroup[];
  tabs: BrowserVerticalTabItem[];
  visibleTabs: BrowserVerticalTabItem[];
  helperText: string;
};

export type BrowserVerticalTabsPreviewPayload = {
  workspaceName: string;
  currentUrl: string;
  currentTitle: string;
  sourceType: PageSourceType;
  capturedUrls?: string[];
  collapsedGroupIds?: BrowserVerticalTabGroupId[];
  railCollapsed?: boolean;
};

type BrowserVerticalTabSeed = Omit<BrowserVerticalTabItem, "id" | "active" | "status" | "badgeLabel">;

const groupLabels: Record<BrowserVerticalTabGroupId, string> = {
  workspace: "Workspace",
  research: "Research",
  execution: "Execution"
};

const baselineTabs: BrowserVerticalTabSeed[] = [
  {
    title: "Oracle AI Vector Search",
    url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    sourceType: "oracle_docs",
    groupId: "research",
    pinned: true
  },
  {
    title: "OCI Generative AI Project",
    url: "https://cloud.oracle.com/generative-ai/agents",
    sourceType: "oci_console",
    groupId: "workspace",
    pinned: true
  },
  {
    title: "LiveLabs Select AI Workshop",
    url: "https://livelabs.oracle.com/",
    sourceType: "livelabs",
    groupId: "execution",
    pinned: false
  },
  {
    title: "Oracle AI Demo Repository",
    url: "https://github.com/oracle-samples/oracle-ai-vector-search",
    sourceType: "github",
    groupId: "research",
    pinned: false
  }
];

export function createBrowserVerticalTabsPreview(payload: BrowserVerticalTabsPreviewPayload): BrowserVerticalTabsPreview {
  const collapsedGroupIds = new Set(payload.collapsedGroupIds ?? []);
  const capturedUrls = new Set((payload.capturedUrls ?? []).map(normalizeUrl));
  const currentUrl = normalizeUrl(payload.currentUrl);
  const seededTabs = upsertCurrentTab(baselineTabs, {
    title: payload.currentTitle,
    url: currentUrl,
    sourceType: payload.sourceType,
    groupId: "workspace",
    pinned: true
  });
  const tabs = seededTabs.map((tab) => {
    const active = normalizeUrl(tab.url) === currentUrl;
    const status: BrowserVerticalTabStatus = active ? "active" : capturedUrls.has(normalizeUrl(tab.url)) ? "captured" : "open";

    return {
      ...tab,
      id: `vertical-tab-${hashSeed(`${tab.groupId}:${tab.url}`)}`,
      active,
      status,
      badgeLabel: active ? "current" : status
    };
  });
  const groups = (Object.keys(groupLabels) as BrowserVerticalTabGroupId[]).map((groupId) => {
    const groupTabs = tabs.filter((tab) => tab.groupId === groupId);

    return {
      id: groupId,
      label: groupLabels[groupId],
      collapsed: collapsedGroupIds.has(groupId),
      tabCount: groupTabs.length,
      activeCount: groupTabs.filter((tab) => tab.active).length
    };
  });
  const visibleTabs = tabs.filter((tab) => !collapsedGroupIds.has(tab.groupId));
  const activeTab = tabs.find((tab) => tab.active) ?? tabs[0];

  return {
    id: `browser-vertical-tabs-${hashSeed(`${payload.workspaceName}:${currentUrl}`)}`,
    enabled: true,
    railCollapsed: Boolean(payload.railCollapsed),
    railWidthLabel: payload.railCollapsed ? "icon-only" : "full-title",
    activeTabId: activeTab.id,
    tabCount: tabs.length,
    visibleTabCount: visibleTabs.length,
    groups,
    tabs,
    visibleTabs,
    helperText: "Vertical tabs は renderer preview 内で表示します。実 Chromium tab strip の移動、drag reorder、context menu はまだ実行しません。"
  };
}

function upsertCurrentTab(tabs: BrowserVerticalTabSeed[], currentTab: BrowserVerticalTabSeed): BrowserVerticalTabSeed[] {
  const currentUrl = normalizeUrl(currentTab.url);
  const existingIndex = tabs.findIndex((tab) => normalizeUrl(tab.url) === currentUrl);
  if (existingIndex >= 0) {
    return tabs.map((tab, index) =>
      index === existingIndex
        ? {
            ...tab,
            title: currentTab.title || tab.title,
            sourceType: currentTab.sourceType
          }
        : tab
    );
  }

  return [currentTab, ...tabs];
}

function normalizeUrl(url: string): string {
  return url.trim();
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
