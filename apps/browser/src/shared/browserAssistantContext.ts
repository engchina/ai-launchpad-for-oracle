export type BrowserAssistantContextSource = "current_page" | "page_search" | "bookmark";

export type BrowserAssistantContextMatch = {
  label: string;
  detail: string;
};

export type BrowserAssistantContextItem = {
  id: string;
  source: BrowserAssistantContextSource;
  title: string;
  url: string;
  query?: string;
  matches: BrowserAssistantContextMatch[];
};

export type BrowserAssistantContextState = {
  activeItem: BrowserAssistantContextItem | null;
  recentItems: BrowserAssistantContextItem[];
};

export type BrowserAssistantContextInput = Omit<BrowserAssistantContextItem, "id" | "matches"> & {
  matches?: BrowserAssistantContextMatch[];
};

export function createBrowserAssistantContextState(
  activeItem: BrowserAssistantContextItem | null = null
): BrowserAssistantContextState {
  return {
    activeItem,
    recentItems: activeItem ? [activeItem] : []
  };
}

export function createBrowserAssistantContextItem(input: BrowserAssistantContextInput): BrowserAssistantContextItem {
  const query = input.query?.trim();
  const matches = (input.matches ?? [])
    .map((match) => ({
      label: match.label.trim(),
      detail: match.detail.trim()
    }))
    .filter((match) => match.label.length > 0 && match.detail.length > 0)
    .slice(0, 5);

  return {
    id: createBrowserAssistantContextId(input.source, input.url, query),
    source: input.source,
    title: input.title.trim() || input.url,
    url: input.url.trim(),
    query: query || undefined,
    matches
  };
}

export function attachBrowserAssistantContext(
  state: BrowserAssistantContextState,
  item: BrowserAssistantContextItem,
  maxRecentItems = 5
): BrowserAssistantContextState {
  return {
    activeItem: item,
    recentItems: [item, ...state.recentItems.filter((candidate) => candidate.id !== item.id)].slice(0, maxRecentItems)
  };
}

export function clearBrowserAssistantContext(state: BrowserAssistantContextState): BrowserAssistantContextState {
  return {
    ...state,
    activeItem: null
  };
}

export function formatBrowserAssistantContextPrompt(basePrompt: string, item: BrowserAssistantContextItem | null): string {
  const prompt = basePrompt.trim();
  if (!item) {
    return prompt;
  }

  const lines = [
    prompt,
    "",
    "Attached browser context:",
    `- Source: ${getBrowserAssistantContextSourceLabel(item.source)}`,
    `- Title: ${item.title}`,
    `- URL: ${item.url}`
  ];

  if (item.query) {
    lines.push(`- Query: ${item.query}`);
  }

  if (item.matches.length > 0) {
    lines.push("- Matched evidence:");
    for (const match of item.matches.slice(0, 3)) {
      lines.push(`  - ${match.label}: ${match.detail}`);
    }
  }

  return lines.join("\n");
}

export function summarizeBrowserAssistantContext(item: BrowserAssistantContextItem | null): string {
  if (!item) {
    return "No attached browser context";
  }

  const parts = [getBrowserAssistantContextSourceLabel(item.source), item.title];
  if (item.query) {
    parts.push(`query: ${item.query}`);
  }

  return parts.join(" / ");
}

export function getBrowserAssistantContextSourceLabel(source: BrowserAssistantContextSource): string {
  if (source === "page_search") {
    return "Page search";
  }

  if (source === "bookmark") {
    return "Bookmark";
  }

  return "Current page";
}

function createBrowserAssistantContextId(source: BrowserAssistantContextSource, url: string, query?: string): string {
  return [source, normalizeAssistantContextIdPart(url), normalizeAssistantContextIdPart(query ?? "")].join(":");
}

function normalizeAssistantContextIdPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/\/+$/, "");
}
