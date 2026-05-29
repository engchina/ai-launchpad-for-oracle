import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  closeBrowserPageToolPanel,
  createBrowserPageSearchPreview,
  createBrowserPageToolState,
  getBrowserPageToolTitle,
  isBrowserPageBookmarked,
  isBrowserPageToolPanelOpen,
  normalizeBrowserPageToolUrl,
  toggleBrowserPageBookmark,
  toggleBrowserPageToolPanel,
  updateBrowserPageSearchQuery
} from "./browserPageTools";

test("createBrowserPageToolState starts closed and normalizes bookmarks", () => {
  assert.deepEqual(createBrowserPageToolState([" HTTPS://EXAMPLE.COM/docs/ ", "https://example.com/docs"]), {
    openPanelId: null,
    searchQuery: "",
    bookmarkedUrls: ["https://example.com/docs"],
    lastTrigger: "selection"
  });
});

test("toggleBrowserPageToolPanel opens and closes a panel", () => {
  const opened = toggleBrowserPageToolPanel(createBrowserPageToolState(), "page_search");
  const closed = toggleBrowserPageToolPanel(opened, "page_search");

  assert.equal(isBrowserPageToolPanelOpen(opened, "page_search"), true);
  assert.equal(closed.openPanelId, null);
  assert.equal(closed.lastTrigger, "selection");
});

test("closeBrowserPageToolPanel records escape close reason", () => {
  const opened = toggleBrowserPageToolPanel(createBrowserPageToolState(), "bookmark");
  const closed = closeBrowserPageToolPanel(opened, "escape");

  assert.equal(closed.openPanelId, null);
  assert.equal(closed.lastTrigger, "escape");
});

test("updateBrowserPageSearchQuery keeps the current panel state", () => {
  const opened = toggleBrowserPageToolPanel(createBrowserPageToolState(), "page_search");
  const updated = updateBrowserPageSearchQuery(opened, "vector");

  assert.equal(updated.openPanelId, "page_search");
  assert.equal(updated.searchQuery, "vector");
});

test("toggleBrowserPageBookmark adds and removes normalized current URL", () => {
  const bookmarked = toggleBrowserPageBookmark(createBrowserPageToolState(), "HTTPS://EXAMPLE.COM/docs/");
  const removed = toggleBrowserPageBookmark(bookmarked, "https://example.com/docs");

  assert.equal(isBrowserPageBookmarked(bookmarked, "https://example.com/docs/"), true);
  assert.deepEqual(removed.bookmarkedUrls, []);
});

test("createBrowserPageSearchPreview matches title url summary selection and captures", () => {
  const preview = createBrowserPageSearchPreview("oracle", {
    currentTitle: "Oracle AI Database",
    currentUrl: "https://docs.oracle.com/ai-vector",
    summary: "Vector search for enterprise RAG.",
    selectionExplanation: "OCI GenAI grounding note.",
    captures: [
      {
        title: "LiveLabs setup",
        url: "https://livelabs.oracle.com"
      },
      {
        title: "Unrelated",
        url: "https://example.com"
      }
    ]
  });

  assert.deepEqual(
    preview.matches.map((match) => match.kind),
    ["title", "url", "capture"]
  );
});

test("createBrowserPageSearchPreview returns empty matches for blank query", () => {
  assert.deepEqual(createBrowserPageSearchPreview("  ", { currentTitle: "Title", currentUrl: "https://example.com" }), {
    query: "  ",
    normalizedQuery: "",
    matches: []
  });
});

test("getBrowserPageToolTitle returns stable aria labels", () => {
  assert.equal(getBrowserPageToolTitle("page_search"), "Page search");
  assert.equal(getBrowserPageToolTitle("bookmark"), "Bookmark");
});

test("normalizeBrowserPageToolUrl lowercases and removes trailing slashes", () => {
  assert.equal(normalizeBrowserPageToolUrl(" HTTPS://EXAMPLE.COM/a/ "), "https://example.com/a");
});
