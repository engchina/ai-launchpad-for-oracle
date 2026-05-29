export type BrowserHighlightColor = "amber" | "blue" | "green";
export type BrowserHighlightDecision = "saved" | "review" | "local_only";
export type BrowserHighlightSource = "current_selection" | "page_summary" | "bookmark" | "capture";
export type BrowserHighlightActionId = "save_highlight" | "search_semantic" | "sync_highlights";

export type BrowserHighlightItem = {
  id: string;
  source: BrowserHighlightSource;
  color: BrowserHighlightColor;
  decision: BrowserHighlightDecision;
  title: string;
  url: string;
  text: string;
  anchor: string;
  semanticTags: string[];
};

export type BrowserHighlightRecall = {
  id: string;
  source: Exclude<BrowserHighlightSource, "current_selection">;
  title: string;
  url: string;
  score: number;
  reason: string;
};

export type BrowserHighlightAction = {
  id: BrowserHighlightActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserHighlightsPreview = {
  id: string;
  title: string;
  currentTitle: string;
  currentUrl: string;
  workspaceName: string;
  query: string;
  savedCount: number;
  reviewCount: number;
  localOnlyCount: number;
  highlights: BrowserHighlightItem[];
  recalls: BrowserHighlightRecall[];
  details: string[];
  guardrails: string[];
  actions: BrowserHighlightAction[];
};

export type BrowserHighlightEvidence = {
  title: string;
  url: string;
  text?: string;
  summary?: string;
};

export type BrowserHighlightsPreviewOptions = {
  workspaceName: string;
  currentTitle: string;
  currentUrl: string;
  selectedText?: string;
  summary?: string;
  bookmarkedUrls?: string[];
  captures?: BrowserHighlightEvidence[];
  query?: string;
};

export function createBrowserHighlightsPreview(options: BrowserHighlightsPreviewOptions): BrowserHighlightsPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const currentTitle = normalizeText(options.currentTitle, "Current page");
  const currentUrl = normalizeText(options.currentUrl, "about:blank");
  const query = normalizeText(options.query ?? options.selectedText ?? currentTitle, currentTitle);
  const highlights = createHighlights({
    currentTitle,
    currentUrl,
    selectedText: options.selectedText,
    summary: options.summary
  });
  const recalls = createRecalls({
    query,
    currentUrl,
    captures: options.captures ?? [],
    bookmarkedUrls: options.bookmarkedUrls ?? []
  });
  const savedCount = highlights.filter((highlight) => highlight.decision === "saved").length;
  const reviewCount = highlights.filter((highlight) => highlight.decision === "review").length;
  const localOnlyCount = highlights.filter((highlight) => highlight.decision === "local_only").length;

  return {
    id: `browser-highlights-${hashSeed(`${workspaceName}:${currentUrl}:${query}`)}`,
    title: "Highlights Preview",
    currentTitle,
    currentUrl,
    workspaceName,
    query,
    savedCount,
    reviewCount,
    localOnlyCount,
    highlights,
    recalls,
    details: [
      `workspace: ${workspaceName}`,
      `page: ${currentTitle}`,
      `query: ${query}`,
      `captures: ${Math.max(0, options.captures?.length ?? 0)}`,
      `bookmarks: ${Math.max(0, options.bookmarkedUrls?.length ?? 0)}`
    ],
    guardrails: [
      "BrowserOS source / highlighter implementation reuse なし",
      "この preview は browser history、bookmark DB、profile、DOM annotation を書き換えない",
      "highlight text は local-only evidence として扱い、cloud sync や OCI call を開始しない",
      "password、cookie、wallet、token、private key を highlight / semantic index に含めない",
      "semantic recall は mock scoring であり、embedding model、vector DB、external search を起動しない"
    ],
    actions: [
      {
        id: "save_highlight",
        label: "Save highlight",
        enabled: false,
        reason: "この切片では DOM annotation や local history store へ保存しません。"
      },
      {
        id: "search_semantic",
        label: "Semantic recall",
        enabled: true,
        reason: "current selection、captures、bookmarks の local preview を検索します。"
      },
      {
        id: "sync_highlights",
        label: "Sync highlights",
        enabled: false,
        reason: "highlight は local-only とし、cloud sync は開始しません。"
      }
    ]
  };
}

function createHighlights(options: {
  currentTitle: string;
  currentUrl: string;
  selectedText?: string;
  summary?: string;
}): BrowserHighlightItem[] {
  const selectedText = normalizeHighlightText(options.selectedText);
  const summaryText = normalizeHighlightText(options.summary);
  const primaryText =
    selectedText ||
    summaryText ||
    "現在ページから PoC evidence、前提条件、操作手順を抽出する local highlight preview。";
  const highlightDecision: BrowserHighlightDecision = selectedText ? "review" : "local_only";

  return [
    {
      id: `highlight-current-${hashSeed(`${options.currentUrl}:${primaryText}`)}`,
      source: selectedText ? "current_selection" : "page_summary",
      color: "amber",
      decision: highlightDecision,
      title: options.currentTitle,
      url: options.currentUrl,
      text: primaryText,
      anchor: createAnchor(primaryText),
      semanticTags: createSemanticTags(primaryText)
    },
    {
      id: `highlight-task-${hashSeed(`${options.currentUrl}:oracle-vector`)}`,
      source: "page_summary",
      color: "blue",
      decision: "local_only",
      title: "Research trail",
      url: options.currentUrl,
      text: "Oracle docs、captures、bookmarks を semantic recall の候補として同じ workspace に残す。",
      anchor: "research-trail",
      semanticTags: ["oracle", "captures", "bookmarks", "semantic"]
    }
  ];
}

function createRecalls(options: {
  query: string;
  currentUrl: string;
  captures: BrowserHighlightEvidence[];
  bookmarkedUrls: string[];
}): BrowserHighlightRecall[] {
  const queryTokens = tokenize(options.query);
  const captureRecalls = options.captures.map((capture, index) => {
    const text = `${capture.title} ${capture.url} ${capture.text ?? ""} ${capture.summary ?? ""}`;
    return createRecall({
      id: `highlight-recall-capture-${index}`,
      source: "capture",
      title: normalizeText(capture.title, "Capture"),
      url: normalizeText(capture.url, options.currentUrl),
      text,
      queryTokens
    });
  });
  const bookmarkRecalls = options.bookmarkedUrls.map((url, index) =>
    createRecall({
      id: `highlight-recall-bookmark-${index}`,
      source: "bookmark",
      title: titleForUrl(url),
      url,
      text: `${titleForUrl(url)} ${url}`,
      queryTokens
    })
  );

  return [...captureRecalls, ...bookmarkRecalls]
    .filter((recall) => recall.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 5);
}

function createRecall(options: {
  id: string;
  source: Exclude<BrowserHighlightSource, "current_selection">;
  title: string;
  url: string;
  text: string;
  queryTokens: string[];
}): BrowserHighlightRecall {
  const textTokens = tokenize(options.text);
  const matchedTokens = options.queryTokens.filter((token) => textTokens.includes(token));
  const score = Math.min(99, matchedTokens.length * 24 + Math.min(15, textTokens.length));

  return {
    id: options.id,
    source: options.source,
    title: options.title,
    url: options.url,
    score,
    reason:
      matchedTokens.length > 0
        ? `matched: ${matchedTokens.slice(0, 4).join(", ")}`
        : "semantic preview fallback"
  };
}

function normalizeHighlightText(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return normalizeText(value, "").slice(0, 260);
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? redactSensitiveText(normalized) : fallback;
}

function redactSensitiveText(value: string): string {
  return value.replace(
    /(api[-_ ]?key|auth|credential|key[-_ ]?file|password|private[-_ ]?key|secret|signature|token|wallet)\s*[:=]\s*("[^"]+"|'[^']+'|\S+)/gi,
    "$1=REDACTED"
  );
}

function createAnchor(value: string): string {
  return tokenize(value).slice(0, 6).join("-");
}

function createSemanticTags(value: string): string[] {
  const tokens = tokenize(value).filter((token) => token.length > 3);
  return Array.from(new Set(tokens)).slice(0, 5);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9一-龠ぁ-んァ-ンー]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function titleForUrl(value: string): string {
  try {
    const url = new URL(value);
    const leaf = url.pathname.split("/").filter(Boolean).pop();
    return leaf ? decodeURIComponent(leaf).replace(/[-_]+/g, " ") : url.hostname;
  } catch {
    return value || "Bookmark";
  }
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 53 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
