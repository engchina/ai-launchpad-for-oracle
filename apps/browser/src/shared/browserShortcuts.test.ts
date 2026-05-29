import * as assert from "node:assert/strict";
import { test } from "node:test";
import { isEditableShortcutTarget, resolveBrowserShortcut } from "./browserShortcuts";

test("resolveBrowserShortcut maps Option or Alt K to the chat action", () => {
  assert.deepEqual(resolveBrowserShortcut({ key: "K", altKey: true }), {
    id: "open_chat",
    shortcutLabel: "Option/Alt+K",
    ariaKeyShortcuts: "Alt+K"
  });
});

test("resolveBrowserShortcut maps Option or Alt L to provider cycling", () => {
  assert.equal(resolveBrowserShortcut({ key: "l", altKey: true })?.id, "cycle_chat_provider");
});

test("resolveBrowserShortcut maps command or control shift U to the council hub action", () => {
  assert.equal(resolveBrowserShortcut({ key: "u", metaKey: true, shiftKey: true })?.id, "open_council");
  assert.equal(resolveBrowserShortcut({ key: "U", ctrlKey: true, shiftKey: true })?.id, "open_council");
});

test("resolveBrowserShortcut ignores editable targets", () => {
  assert.equal(resolveBrowserShortcut({ key: "k", altKey: true, targetTagName: "textarea" }), null);
  assert.equal(resolveBrowserShortcut({ key: "l", altKey: true, targetRole: "textbox" }), null);
  assert.equal(resolveBrowserShortcut({ key: "u", ctrlKey: true, shiftKey: true, targetIsContentEditable: true }), null);
});

test("resolveBrowserShortcut ignores repeated and unrelated keys", () => {
  assert.equal(resolveBrowserShortcut({ key: "k", altKey: true, repeat: true }), null);
  assert.equal(resolveBrowserShortcut({ key: "k", ctrlKey: true }), null);
  assert.equal(resolveBrowserShortcut({ key: "x", altKey: true }), null);
});

test("isEditableShortcutTarget detects form controls and editable content", () => {
  assert.equal(isEditableShortcutTarget({ key: "k", targetTagName: "INPUT" }), true);
  assert.equal(isEditableShortcutTarget({ key: "k", targetRole: "searchbox" }), true);
  assert.equal(isEditableShortcutTarget({ key: "k", targetIsContentEditable: true }), true);
  assert.equal(isEditableShortcutTarget({ key: "k", targetTagName: "button" }), false);
});
