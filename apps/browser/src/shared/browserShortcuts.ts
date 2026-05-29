export type BrowserShortcutActionId = "open_chat" | "cycle_chat_provider" | "open_council";

export type BrowserShortcutAction = {
  id: BrowserShortcutActionId;
  shortcutLabel: string;
  ariaKeyShortcuts: string;
};

export type BrowserShortcutInput = {
  key: string;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  targetTagName?: string;
  targetRole?: string;
  targetIsContentEditable?: boolean;
};

const editableTargetTags = new Set(["input", "select", "textarea"]);

export function resolveBrowserShortcut(input: BrowserShortcutInput): BrowserShortcutAction | null {
  if (input.repeat || isEditableShortcutTarget(input)) {
    return null;
  }

  const key = input.key.toLowerCase();
  const altOnly = Boolean(input.altKey) && !input.metaKey && !input.ctrlKey && !input.shiftKey;
  const commandShift = Boolean(input.shiftKey) && Boolean(input.metaKey || input.ctrlKey) && !input.altKey;

  if (altOnly && key === "k") {
    return {
      id: "open_chat",
      shortcutLabel: "Option/Alt+K",
      ariaKeyShortcuts: "Alt+K"
    };
  }

  if (altOnly && key === "l") {
    return {
      id: "cycle_chat_provider",
      shortcutLabel: "Option/Alt+L",
      ariaKeyShortcuts: "Alt+L"
    };
  }

  if (commandShift && key === "u") {
    return {
      id: "open_council",
      shortcutLabel: "Cmd/Ctrl+Shift+U",
      ariaKeyShortcuts: "Meta+Shift+U Control+Shift+U"
    };
  }

  return null;
}

export function isEditableShortcutTarget(input: BrowserShortcutInput): boolean {
  if (input.targetIsContentEditable) {
    return true;
  }

  const targetTagName = input.targetTagName?.toLowerCase() ?? "";
  if (editableTargetTags.has(targetTagName)) {
    return true;
  }

  const targetRole = input.targetRole?.toLowerCase() ?? "";
  return targetRole === "textbox" || targetRole === "combobox" || targetRole === "searchbox";
}
