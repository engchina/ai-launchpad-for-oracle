import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  closeBrowserAssistantPanel,
  createBrowserAssistantPanelState,
  getBrowserAssistantPanelGridColumns,
  openBrowserAssistantPanel,
  selectBrowserAssistantPanelMode,
  shouldRenderBrowserAssistantPanel
} from "./browserAssistantPanel";

test("createBrowserAssistantPanelState starts open with the initial mode", () => {
  assert.deepEqual(createBrowserAssistantPanelState("agent"), {
    open: true,
    activeModeId: "agent",
    lastTrigger: "onboarding"
  });
});

test("openBrowserAssistantPanel opens the side panel and switches mode", () => {
  const closed = createBrowserAssistantPanelState("agent", false);
  const opened = openBrowserAssistantPanel(closed, "chat", "toolbar");

  assert.deepEqual(opened, {
    open: true,
    activeModeId: "chat",
    lastTrigger: "toolbar"
  });
});

test("closeBrowserAssistantPanel hides the panel without losing active mode", () => {
  const state = openBrowserAssistantPanel(createBrowserAssistantPanelState("agent"), "workflow", "shortcut");
  const closed = closeBrowserAssistantPanel(state);

  assert.equal(closed.open, false);
  assert.equal(closed.activeModeId, "workflow");
  assert.equal(closed.lastTrigger, "close");
});

test("selectBrowserAssistantPanelMode keeps closed state while updating the remembered mode", () => {
  const closed = closeBrowserAssistantPanel(createBrowserAssistantPanelState("agent"));
  const updated = selectBrowserAssistantPanelMode(closed, "chat");

  assert.equal(updated.open, false);
  assert.equal(updated.activeModeId, "chat");
  assert.equal(updated.lastTrigger, "toolbar");
});

test("shouldRenderBrowserAssistantPanel requires both open state and workspace route", () => {
  const open = createBrowserAssistantPanelState("agent");
  const closed = closeBrowserAssistantPanel(open);

  assert.equal(shouldRenderBrowserAssistantPanel(open, "workspace"), true);
  assert.equal(shouldRenderBrowserAssistantPanel(open, "onboarding"), false);
  assert.equal(shouldRenderBrowserAssistantPanel(closed, "workspace"), false);
});

test("getBrowserAssistantPanelGridColumns returns stable layout tracks", () => {
  assert.equal(getBrowserAssistantPanelGridColumns(true), "minmax(520px,1fr)_380px");
  assert.equal(getBrowserAssistantPanelGridColumns(false), "minmax(0,1fr)");
});
