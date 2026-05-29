import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserHighlightsPreview } from "./browserHighlights";

test("createBrowserHighlightsPreview creates local highlights from current selection", () => {
  const preview = createBrowserHighlightsPreview({
    workspaceName: "金融向け RAG 提案",
    currentTitle: "Oracle AI Vector Search Documentation",
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    selectedText: "Create table with VECTOR column and load embeddings",
    summary: "Oracle AI Vector Search setup steps",
    bookmarkedUrls: ["https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/"],
    captures: [
      {
        title: "Oracle AI Vector Search Documentation",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
        summary: "VECTOR column and embeddings"
      }
    ]
  });

  assert.equal(preview.title, "Highlights Preview");
  assert.equal(preview.highlights.length, 2);
  assert.equal(preview.highlights[0]?.source, "current_selection");
  assert.equal(preview.highlights[0]?.decision, "review");
  assert.ok(preview.recalls.length > 0);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source \/ highlighter implementation reuse/);
  assert.match(preview.guardrails.join("\n"), /cloud sync や OCI call を開始しない/);
});

test("createBrowserHighlightsPreview falls back to page summary and keeps it local-only", () => {
  const preview = createBrowserHighlightsPreview({
    workspaceName: "Oracle Launchpad",
    currentTitle: "Oracle Docs",
    currentUrl: "https://docs.oracle.com/",
    summary: "Use Oracle documentation as PoC evidence",
    bookmarkedUrls: [],
    captures: []
  });

  assert.equal(preview.highlights[0]?.source, "page_summary");
  assert.equal(preview.highlights[0]?.decision, "local_only");
  assert.equal(preview.actions.find((action) => action.id === "save_highlight")?.enabled, false);
  assert.equal(preview.actions.find((action) => action.id === "sync_highlights")?.enabled, false);
});

test("createBrowserHighlightsPreview ranks capture and bookmark recalls by query match", () => {
  const preview = createBrowserHighlightsPreview({
    workspaceName: "Oracle Launchpad",
    currentTitle: "Oracle Docs",
    currentUrl: "https://docs.oracle.com/",
    query: "vector embeddings",
    bookmarkedUrls: ["https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/"],
    captures: [
      {
        title: "Vector Search Notes",
        url: "https://example.com/vector",
        text: "vector embeddings index"
      },
      {
        title: "Unrelated",
        url: "https://example.com/unrelated",
        text: "calendar assistant"
      }
    ]
  });

  assert.equal(preview.recalls[0]?.title, "Vector Search Notes");
  assert.ok((preview.recalls[0]?.score ?? 0) > (preview.recalls[1]?.score ?? -1));
});

test("createBrowserHighlightsPreview redacts sensitive highlight text", () => {
  const preview = createBrowserHighlightsPreview({
    workspaceName: "Oracle Launchpad",
    currentTitle: "Secrets",
    currentUrl: "https://example.com/",
    selectedText: "token=abc123 wallet=/tmp/wallet.zip useful evidence",
    bookmarkedUrls: [],
    captures: []
  });
  const allText = preview.highlights.map((highlight) => highlight.text).join("\n");

  assert.doesNotMatch(allText, /abc123/);
  assert.doesNotMatch(allText, /wallet\.zip/);
  assert.match(allText, /REDACTED/);
});
