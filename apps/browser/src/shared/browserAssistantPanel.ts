export type BrowserAssistantPanelTrigger = "toolbar" | "shortcut" | "rail" | "onboarding" | "close";

export type BrowserAssistantPanelState<TModeId extends string = string> = {
  open: boolean;
  activeModeId: TModeId;
  lastTrigger: BrowserAssistantPanelTrigger;
};

export function createBrowserAssistantPanelState<TModeId extends string>(
  activeModeId: TModeId,
  open = true
): BrowserAssistantPanelState<TModeId> {
  return {
    open,
    activeModeId,
    lastTrigger: open ? "onboarding" : "close"
  };
}

export function openBrowserAssistantPanel<TModeId extends string>(
  state: BrowserAssistantPanelState<TModeId>,
  activeModeId: TModeId,
  trigger: Exclude<BrowserAssistantPanelTrigger, "close">
): BrowserAssistantPanelState<TModeId> {
  return {
    ...state,
    open: true,
    activeModeId,
    lastTrigger: trigger
  };
}

export function closeBrowserAssistantPanel<TModeId extends string>(
  state: BrowserAssistantPanelState<TModeId>
): BrowserAssistantPanelState<TModeId> {
  return {
    ...state,
    open: false,
    lastTrigger: "close"
  };
}

export function selectBrowserAssistantPanelMode<TModeId extends string>(
  state: BrowserAssistantPanelState<TModeId>,
  activeModeId: TModeId,
  trigger: Exclude<BrowserAssistantPanelTrigger, "close"> = state.lastTrigger === "close" ? "toolbar" : state.lastTrigger
): BrowserAssistantPanelState<TModeId> {
  return {
    ...state,
    activeModeId,
    lastTrigger: trigger
  };
}

export function shouldRenderBrowserAssistantPanel(
  state: BrowserAssistantPanelState,
  route: string,
  workspaceRoute = "workspace"
): boolean {
  return state.open && route === workspaceRoute;
}

export function getBrowserAssistantPanelGridColumns(isOpen: boolean): string {
  return isOpen ? "minmax(520px,1fr)_380px" : "minmax(0,1fr)";
}
