export type BrowserPageToolPanelId = "page_search" | "bookmark";

export type BrowserPageToolTrigger = BrowserPageToolPanelId | "keyboard" | "selection" | "outside" | "escape";

export type BrowserPageToolState = {
  openPanelId: BrowserPageToolPanelId | null;
  searchQuery: string;
  bookmarkedUrls: string[];
  lastTrigger: BrowserPageToolTrigger;
};

export type BrowserPageSearchSource = {
  currentTitle: string;
  currentUrl: string;
  summary?: string;
  selectionExplanation?: string;
  captures?: Array<{
    title: string;
    url: string;
  }>;
};

export type BrowserPageSearchMatchKind = "title" | "url" | "summary" | "selection" | "capture";

export type BrowserPageSearchMatch = {
  kind: BrowserPageSearchMatchKind;
  label: string;
  detail: string;
};

export type BrowserPageSearchPreview = {
  query: string;
  normalizedQuery: string;
  matches: BrowserPageSearchMatch[];
};

export function createBrowserPageToolState(initialBookmarks: string[] = []): BrowserPageToolState {
  return {
    openPanelId: null,
    searchQuery: "",
    bookmarkedUrls: normalizeBookmarkUrls(initialBookmarks),
    lastTrigger: "selection"
  };
}

export function toggleBrowserPageToolPanel(state: BrowserPageToolState, panelId: BrowserPageToolPanelId): BrowserPageToolState {
  if (state.openPanelId === panelId) {
    return closeBrowserPageToolPanel(state, "selection");
  }

  return {
    ...state,
    openPanelId: panelId,
    lastTrigger: panelId
  };
}

export function closeBrowserPageToolPanel(
  state: BrowserPageToolState,
  trigger: Extract<BrowserPageToolTrigger, "selection" | "outside" | "escape"> = "selection"
): BrowserPageToolState {
  return {
    ...state,
    openPanelId: null,
    lastTrigger: trigger
  };
}

export function updateBrowserPageSearchQuery(state: BrowserPageToolState, query: string): BrowserPageToolState {
  return {
    ...state,
    searchQuery: query
  };
}

export function toggleBrowserPageBookmark(state: BrowserPageToolState, url: string): BrowserPageToolState {
  const normalizedUrl = normalizeBrowserPageToolUrl(url);
  if (!normalizedUrl) {
    return state;
  }

  const bookmarkedUrls = state.bookmarkedUrls.includes(normalizedUrl)
    ? state.bookmarkedUrls.filter((candidate) => candidate !== normalizedUrl)
    : [normalizedUrl, ...state.bookmarkedUrls];

  return {
    ...state,
    bookmarkedUrls
  };
}

export function isBrowserPageToolPanelOpen(state: BrowserPageToolState, panelId: BrowserPageToolPanelId): boolean {
  return state.openPanelId === panelId;
}

export function isBrowserPageBookmarked(state: BrowserPageToolState, url: string): boolean {
  const normalizedUrl = normalizeBrowserPageToolUrl(url);
  return Boolean(normalizedUrl) && state.bookmarkedUrls.includes(normalizedUrl);
}

export function createBrowserPageSearchPreview(
  query: string,
  source: BrowserPageSearchSource,
  maxMatches = 5
): BrowserPageSearchPreview {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return {
      query,
      normalizedQuery,
      matches: []
    };
  }

  const candidates: BrowserPageSearchMatch[] = [
    {
      kind: "title",
      label: "Page title",
      detail: source.currentTitle
    },
    {
      kind: "url",
      label: "Page URL",
      detail: source.currentUrl
    },
    {
      kind: "summary",
      label: "AI summary",
      detail: source.summary ?? ""
    },
    {
      kind: "selection",
      label: "Selection note",
      detail: source.selectionExplanation ?? ""
    },
    ...(source.captures ?? []).map((capture) => ({
      kind: "capture" as const,
      label: capture.title,
      detail: capture.url
    }))
  ];

  const matches = candidates
    .filter((candidate) => candidate.detail.trim().length > 0)
    .filter((candidate) => includesBrowserPageSearchQuery(candidate.label, normalizedQuery) || includesBrowserPageSearchQuery(candidate.detail, normalizedQuery))
    .slice(0, maxMatches);

  return {
    query,
    normalizedQuery,
    matches
  };
}

export function getBrowserPageToolTitle(panelId: BrowserPageToolPanelId): string {
  return panelId === "page_search" ? "Page search" : "Bookmark";
}

export function normalizeBrowserPageToolUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

function normalizeBookmarkUrls(urls: string[]): string[] {
  return Array.from(new Set(urls.map(normalizeBrowserPageToolUrl).filter(Boolean)));
}

function includesBrowserPageSearchQuery(value: string, normalizedQuery: string): boolean {
  return value.toLowerCase().includes(normalizedQuery);
}
