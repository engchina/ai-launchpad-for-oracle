export type BrowserRailPageTarget = {
  url: string;
  title?: string;
};

export type BrowserRailTabLike = {
  id: string;
  label: string;
  route?: string;
  agenticMode?: string;
  pageTarget?: BrowserRailPageTarget;
  closeable?: boolean;
  local?: boolean;
};

export type BrowserRailSection<TTab extends BrowserRailTabLike = BrowserRailTabLike> = {
  id: string;
  tabs: TTab[];
};

export type BrowserRailLocalTabDraft = {
  id: string;
  label: string;
  pageTarget: BrowserRailPageTarget;
  closeable: true;
  local: true;
};

export function createBrowserRailSections<TTab extends BrowserRailTabLike>(
  baseSections: BrowserRailSection<TTab>[],
  localTabs: TTab[],
  targetSectionId = "active",
  insertAfterTabId = "workspace"
): BrowserRailSection<TTab>[] {
  return baseSections.map((section) => {
    if (section.id !== targetSectionId || localTabs.length === 0) {
      return section;
    }

    const insertAfterIndex = section.tabs.findIndex((tab) => tab.id === insertAfterTabId);
    if (insertAfterIndex < 0) {
      return {
        ...section,
        tabs: [...section.tabs, ...localTabs]
      };
    }

    return {
      ...section,
      tabs: [...section.tabs.slice(0, insertAfterIndex + 1), ...localTabs, ...section.tabs.slice(insertAfterIndex + 1)]
    };
  });
}

export function flattenBrowserRailTabs<TTab extends BrowserRailTabLike>(
  sections: ReadonlyArray<{ tabs: readonly TTab[] }>
): TTab[] {
  return sections.flatMap((section) => section.tabs);
}

export function findBrowserRailTab<TTab extends BrowserRailTabLike>(
  sections: ReadonlyArray<{ tabs: readonly TTab[] }>,
  predicate: (tab: TTab) => boolean
): TTab | undefined {
  return flattenBrowserRailTabs(sections).find(predicate);
}

export function getVisibleBrowserRailSections<TTab extends BrowserRailTabLike>(
  sections: BrowserRailSection<TTab>[],
  closedTabIds: readonly string[]
): BrowserRailSection<TTab>[] {
  const closedIds = new Set(closedTabIds);

  return sections
    .map((section) => ({
      ...section,
      tabs: section.tabs.filter((tab) => !closedIds.has(tab.id))
    }))
    .filter((section) => section.tabs.length > 0);
}

export function normalizeBrowserRailUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

export function isBrowserRailPageTabActive<TTab extends BrowserRailTabLike>(
  tab: TTab,
  activeRoute: string,
  currentUrl: string,
  workspaceRoute = "workspace"
): boolean {
  return Boolean(
    tab.pageTarget &&
      activeRoute === workspaceRoute &&
      normalizeBrowserRailUrl(currentUrl) === normalizeBrowserRailUrl(tab.pageTarget.url)
  );
}

export function getActiveBrowserRailPageTabId<TTab extends BrowserRailTabLike>(
  visibleSections: BrowserRailSection<TTab>[],
  activeTabId: string,
  activeRoute: string,
  currentUrl: string,
  workspaceRoute = "workspace"
): string {
  const visibleTabs = flattenBrowserRailTabs(visibleSections);
  const activeTab = visibleTabs.find((tab) => tab.id === activeTabId);

  if (activeTab?.pageTarget && isBrowserRailPageTabActive(activeTab, activeRoute, currentUrl, workspaceRoute)) {
    return activeTab.id;
  }

  return visibleTabs.find((tab) => isBrowserRailPageTabActive(tab, activeRoute, currentUrl, workspaceRoute))?.id ?? "";
}

export function selectBrowserRailFallbackTab<TTab extends BrowserRailTabLike>(
  sections: BrowserRailSection<TTab>[],
  closedTabIds: readonly string[],
  closingTabId: string,
  fallbackTabId = "workspace"
): TTab | undefined {
  const closedIds = new Set(closedTabIds);
  const visibleTabs = flattenBrowserRailTabs(sections).filter((tab) => !closedIds.has(tab.id));
  const closingIndex = visibleTabs.findIndex((tab) => tab.id === closingTabId);
  const fallbackIndex = Math.max(0, closingIndex);
  const remainingTabs = visibleTabs.filter((tab) => tab.id !== closingTabId);

  return remainingTabs[fallbackIndex] ?? remainingTabs[fallbackIndex - 1] ?? remainingTabs.find((tab) => tab.id === fallbackTabId);
}

export function createBrowserRailLocalTabDraft(index: number, url: string, title: string): BrowserRailLocalTabDraft {
  return {
    id: `local-tab-${index}`,
    label: `New Tab ${index}`,
    pageTarget: { url, title },
    closeable: true,
    local: true
  };
}
