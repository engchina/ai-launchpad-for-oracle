import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  attachBrowserAssistantContext,
  clearBrowserAssistantContext,
  createBrowserAssistantContextItem,
  createBrowserAssistantContextState,
  formatBrowserAssistantContextPrompt,
  getBrowserAssistantContextSourceLabel,
  summarizeBrowserAssistantContext
} from "./browserAssistantContext";

test("createBrowserAssistantContextState starts empty by default", () => {
  assert.deepEqual(createBrowserAssistantContextState(), {
    activeItem: null,
    recentItems: []
  });
});

test("createBrowserAssistantContextItem trims fields and creates a stable id", () => {
  const item = createBrowserAssistantContextItem({
    source: "page_search",
    title: " Oracle Docs ",
    url: " HTTPS://DOCS.ORACLE.COM/AI/ ",
    query: " vector search ",
    matches: [
      {
        label: " Page title ",
        detail: " Oracle AI Vector Search "
      },
      {
        label: "",
        detail: "ignored"
      }
    ]
  });

  assert.deepEqual(item, {
    id: "page_search:https://docs.oracle.com/ai:vector-search",
    source: "page_search",
    title: "Oracle Docs",
    url: "HTTPS://DOCS.ORACLE.COM/AI/",
    query: "vector search",
    matches: [
      {
        label: "Page title",
        detail: "Oracle AI Vector Search"
      }
    ]
  });
});

test("attachBrowserAssistantContext sets active item and deduplicates recent items", () => {
  const first = createBrowserAssistantContextItem({
    source: "current_page",
    title: "Page",
    url: "https://example.com"
  });
  const second = createBrowserAssistantContextItem({
    source: "bookmark",
    title: "Bookmark",
    url: "https://example.com/bookmark"
  });

  const state = attachBrowserAssistantContext(
    attachBrowserAssistantContext(attachBrowserAssistantContext(createBrowserAssistantContextState(), first), second),
    first
  );

  assert.equal(state.activeItem?.id, first.id);
  assert.deepEqual(
    state.recentItems.map((item) => item.id),
    [first.id, second.id]
  );
});

test("clearBrowserAssistantContext keeps recent history while removing active item", () => {
  const item = createBrowserAssistantContextItem({
    source: "bookmark",
    title: "Bookmark",
    url: "https://example.com"
  });
  const cleared = clearBrowserAssistantContext(attachBrowserAssistantContext(createBrowserAssistantContextState(), item));

  assert.equal(cleared.activeItem, null);
  assert.equal(cleared.recentItems.length, 1);
});

test("formatBrowserAssistantContextPrompt appends source query and evidence", () => {
  const item = createBrowserAssistantContextItem({
    source: "page_search",
    title: "Oracle AI Database",
    url: "https://docs.oracle.com/ai",
    query: "vector",
    matches: [
      {
        label: "Page title",
        detail: "Oracle AI Vector Search"
      },
      {
        label: "Page URL",
        detail: "https://docs.oracle.com/ai"
      }
    ]
  });

  assert.equal(
    formatBrowserAssistantContextPrompt("Summarize this page.", item),
    [
      "Summarize this page.",
      "",
      "Attached browser context:",
      "- Source: Page search",
      "- Title: Oracle AI Database",
      "- URL: https://docs.oracle.com/ai",
      "- Query: vector",
      "- Matched evidence:",
      "  - Page title: Oracle AI Vector Search",
      "  - Page URL: https://docs.oracle.com/ai"
    ].join("\n")
  );
});

test("formatBrowserAssistantContextPrompt returns trimmed prompt when no context is attached", () => {
  assert.equal(formatBrowserAssistantContextPrompt("  Ask page  ", null), "Ask page");
});

test("summarizeBrowserAssistantContext exposes a compact status string", () => {
  const item = createBrowserAssistantContextItem({
    source: "bookmark",
    title: "Oracle Docs",
    url: "https://docs.oracle.com",
    query: "rag"
  });

  assert.equal(summarizeBrowserAssistantContext(item), "Bookmark / Oracle Docs / query: rag");
  assert.equal(summarizeBrowserAssistantContext(null), "No attached browser context");
});

test("getBrowserAssistantContextSourceLabel returns stable labels", () => {
  assert.equal(getBrowserAssistantContextSourceLabel("current_page"), "Current page");
  assert.equal(getBrowserAssistantContextSourceLabel("page_search"), "Page search");
  assert.equal(getBrowserAssistantContextSourceLabel("bookmark"), "Bookmark");
});
