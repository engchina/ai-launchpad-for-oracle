export type BrowserTopMenuPanelId = "profile" | "more";

export type BrowserTopMenuTrigger = BrowserTopMenuPanelId | "keyboard" | "selection" | "outside" | "escape";

export type BrowserTopMenuState = {
  openPanelId: BrowserTopMenuPanelId | null;
  lastTrigger: BrowserTopMenuTrigger;
};

export function createBrowserTopMenuState(openPanelId: BrowserTopMenuPanelId | null = null): BrowserTopMenuState {
  return {
    openPanelId,
    lastTrigger: openPanelId ?? "selection"
  };
}

export function openBrowserTopMenuPanel(
  state: BrowserTopMenuState,
  panelId: BrowserTopMenuPanelId,
  trigger: BrowserTopMenuTrigger = panelId
): BrowserTopMenuState {
  return {
    ...state,
    openPanelId: panelId,
    lastTrigger: trigger
  };
}

export function toggleBrowserTopMenuPanel(state: BrowserTopMenuState, panelId: BrowserTopMenuPanelId): BrowserTopMenuState {
  if (state.openPanelId === panelId) {
    return closeBrowserTopMenuPanel(state, "selection");
  }

  return openBrowserTopMenuPanel(state, panelId, panelId);
}

export function closeBrowserTopMenuPanel(
  state: BrowserTopMenuState,
  trigger: Extract<BrowserTopMenuTrigger, "selection" | "outside" | "escape"> = "selection"
): BrowserTopMenuState {
  return {
    ...state,
    openPanelId: null,
    lastTrigger: trigger
  };
}

export function isBrowserTopMenuPanelOpen(state: BrowserTopMenuState, panelId: BrowserTopMenuPanelId): boolean {
  return state.openPanelId === panelId;
}

export function getBrowserTopMenuTitle(panelId: BrowserTopMenuPanelId): string {
  return panelId === "profile" ? "Profile menu" : "Browser menu";
}
