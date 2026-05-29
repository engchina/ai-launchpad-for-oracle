import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  closeBrowserTopMenuPanel,
  createBrowserTopMenuState,
  getBrowserTopMenuTitle,
  isBrowserTopMenuPanelOpen,
  openBrowserTopMenuPanel,
  toggleBrowserTopMenuPanel
} from "./browserTopMenu";

test("createBrowserTopMenuState starts closed by default", () => {
  assert.deepEqual(createBrowserTopMenuState(), {
    openPanelId: null,
    lastTrigger: "selection"
  });
});

test("createBrowserTopMenuState can start with a specific panel open", () => {
  assert.deepEqual(createBrowserTopMenuState("profile"), {
    openPanelId: "profile",
    lastTrigger: "profile"
  });
});

test("openBrowserTopMenuPanel switches from profile to more", () => {
  const state = createBrowserTopMenuState("profile");
  const opened = openBrowserTopMenuPanel(state, "more");

  assert.deepEqual(opened, {
    openPanelId: "more",
    lastTrigger: "more"
  });
});

test("toggleBrowserTopMenuPanel closes the active panel and opens another panel", () => {
  const profile = toggleBrowserTopMenuPanel(createBrowserTopMenuState(), "profile");
  const closed = toggleBrowserTopMenuPanel(profile, "profile");
  const more = toggleBrowserTopMenuPanel(closed, "more");

  assert.equal(isBrowserTopMenuPanelOpen(profile, "profile"), true);
  assert.equal(closed.openPanelId, null);
  assert.equal(closed.lastTrigger, "selection");
  assert.equal(isBrowserTopMenuPanelOpen(more, "more"), true);
});

test("closeBrowserTopMenuPanel keeps the last close reason", () => {
  const state = closeBrowserTopMenuPanel(createBrowserTopMenuState("more"), "escape");

  assert.deepEqual(state, {
    openPanelId: null,
    lastTrigger: "escape"
  });
});

test("getBrowserTopMenuTitle returns stable aria labels", () => {
  assert.equal(getBrowserTopMenuTitle("profile"), "Profile menu");
  assert.equal(getBrowserTopMenuTitle("more"), "Browser menu");
});
