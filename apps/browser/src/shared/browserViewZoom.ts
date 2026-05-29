import type { BrowserViewCommand } from "./api";

export const defaultBrowserViewZoomFactor = 1;
export const browserViewZoomFactorStep = 0.2;
export const minBrowserViewZoomFactor = 0.5;
export const maxBrowserViewZoomFactor = 2.5;

export type BrowserViewZoomCommand = Extract<BrowserViewCommand, "reset_zoom" | "zoom_in" | "zoom_out">;

export type BrowserViewZoomShortcutInput = {
  type: string;
  key: string;
  code: string;
  isComposing?: boolean;
  control?: boolean;
  meta?: boolean;
  alt?: boolean;
};

export function isBrowserViewZoomCommand(command: BrowserViewCommand): command is BrowserViewZoomCommand {
  return command === "reset_zoom" || command === "zoom_in" || command === "zoom_out";
}

export function resolveBrowserViewZoomShortcut(
  input: BrowserViewZoomShortcutInput,
  { isMac }: { isMac: boolean }
): BrowserViewZoomCommand | null {
  if (input.type !== "keyDown" || input.isComposing || input.alt) {
    return null;
  }

  const commandOrControlPressed = isMac ? input.meta : input.control;
  if (!commandOrControlPressed) {
    return null;
  }

  if (input.key === "0" || input.code === "Digit0" || input.code === "Numpad0") {
    return "reset_zoom";
  }

  if (input.key === "+" || input.key === "=" || input.code === "Equal" || input.code === "NumpadAdd") {
    return "zoom_in";
  }

  if (input.key === "-" || input.key === "_" || input.code === "Minus" || input.code === "NumpadSubtract") {
    return "zoom_out";
  }

  return null;
}

export function clampBrowserViewZoomFactor(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultBrowserViewZoomFactor;
  }

  const clamped = Math.min(maxBrowserViewZoomFactor, Math.max(minBrowserViewZoomFactor, value));
  return Math.round(clamped * 100) / 100;
}

export function getNextBrowserViewZoomFactor(currentZoomFactor: number, command: BrowserViewZoomCommand): number {
  if (command === "reset_zoom") {
    return defaultBrowserViewZoomFactor;
  }

  const nextZoomFactor =
    command === "zoom_in"
      ? currentZoomFactor + browserViewZoomFactorStep
      : currentZoomFactor - browserViewZoomFactorStep;

  return clampBrowserViewZoomFactor(nextZoomFactor);
}
