import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserChromeImportPreview } from "./browserChromeImport";

test("createBrowserChromeImportPreview creates a review-only import map", () => {
  const preview = createBrowserChromeImportPreview({
    workspaceName: "Oracle PoC Workspace",
    bookmarkCount: 2,
    captureCount: 3,
    extensionReviewCount: 1
  });

  assert.equal(preview.title, "Chrome Import Preview");
  assert.equal(preview.items.length, 5);
  assert.equal(preview.reviewCount, 2);
  assert.equal(preview.blockedCount, 2);
  assert.equal(preview.actions.find((action) => action.id === "review_import_map")?.enabled, true);
  assert.equal(preview.actions.find((action) => action.id === "start_import")?.enabled, false);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source \/ import implementation reuse なし/);
});

test("createBrowserChromeImportPreview blocks secrets and Chrome profile DB reads", () => {
  const preview = createBrowserChromeImportPreview({
    workspaceName: "Oracle PoC Workspace",
    profileLabel: "Default password=abc123 cookie=session"
  });
  const passwordItem = preview.items.find((item) => item.kind === "passwords");
  const historyItem = preview.items.find((item) => item.kind === "history");

  assert.equal(passwordItem?.decision, "blocked");
  assert.equal(historyItem?.decision, "blocked");
  assert.doesNotMatch(preview.profileLabel, /abc123|session/);
  assert.match(preview.profileLabel, /REDACTED/);
  assert.match(preview.guardrails.join("\n"), /History SQLite/);
});

test("createBrowserChromeImportPreview keeps extension import behind permission review", () => {
  const preview = createBrowserChromeImportPreview({
    workspaceName: "Oracle PoC Workspace",
    extensionReviewCount: 4
  });
  const extensionItem = preview.items.find((item) => item.kind === "extensions");

  assert.equal(extensionItem?.decision, "review");
  assert.match(extensionItem?.estimateLabel ?? "", /4 permission reviews/);
});

test("createBrowserChromeImportPreview allows settings as draft-only when no profile write occurs", () => {
  const preview = createBrowserChromeImportPreview({
    workspaceName: "Oracle PoC Workspace"
  });
  const settingsItem = preview.items.find((item) => item.kind === "settings");

  assert.equal(settingsItem?.decision, "ready");
  assert.match(settingsItem?.estimateLabel ?? "", /draft-only/);
  assert.equal(preview.actions.find((action) => action.id === "open_chrome_help")?.enabled, false);
});
