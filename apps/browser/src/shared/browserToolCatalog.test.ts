import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  createBrowserToolCatalog,
  formatBrowserToolCategorySummary,
  summarizeBrowserToolCatalog
} from "./browserToolCatalog";

test("createBrowserToolCatalog exposes a BrowserOS-scale tool surface without implementation reuse", () => {
  const catalog = createBrowserToolCatalog();
  const uniqueIds = new Set(catalog.map((tool) => tool.id));

  assert.ok(catalog.length >= 53);
  assert.equal(uniqueIds.size, catalog.length);
  assert.ok(catalog.some((tool) => tool.category === "navigation" && tool.compatibleName === "navigate"));
  assert.ok(catalog.some((tool) => tool.category === "filesystem" && tool.compatibleName === "write"));
  assert.ok(catalog.some((tool) => tool.category === "memory" && tool.compatibleName === "search_memory"));
});

test("summarizeBrowserToolCatalog separates read, review, and blocked tools", () => {
  const summary = summarizeBrowserToolCatalog();

  assert.ok(summary.totalTools >= 53);
  assert.ok(summary.notRequired > 0);
  assert.ok(summary.reviewRequired > 0);
  assert.ok(summary.blockedByDefault > 0);
  assert.equal(summary.totalTools, summary.notRequired + summary.reviewRequired + summary.blockedByDefault);
});

test("destructive browser history tools are blocked by default", () => {
  const catalog = createBrowserToolCatalog();
  const destructiveTools = catalog.filter((tool) => tool.safety === "destructive");

  assert.ok(destructiveTools.length > 0);
  assert.ok(destructiveTools.every((tool) => tool.approval === "blocked_by_default"));
});

test("category summary formatter produces compact UI text", () => {
  const summary = summarizeBrowserToolCatalog();
  const filesystem = summary.categories.find((category) => category.category === "filesystem");

  assert.ok(filesystem);
  assert.match(formatBrowserToolCategorySummary(filesystem), /^Filesystem: \d+ tools \/ review \d+ \/ blocked \d+$/);
});
