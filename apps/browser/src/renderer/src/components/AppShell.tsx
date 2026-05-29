import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Camera,
  Copy,
  FileDown,
  FileText,
  Globe2,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  TextSelect,
  X,
  type LucideIcon
} from "lucide-react";
import {
  type FormEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BrowserSurface, type BrowserSurfaceHandle, type BrowserSurfaceState } from "@renderer/components/BrowserSurface";
import { OciGenAiSettingsPage } from "@renderer/components/OciGenAiSettingsPage";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import { agenticModes, type AgenticModeId } from "@renderer/data/agenticOs";
import { defaultUrl, type CapturedPage, detectSourceType, mockWorkspaces, titleForUrl } from "@renderer/data/mockData";
import {
  formatCaptureCopyText,
  formatCaptureKind,
  formatCaptureMarkdown,
  formatCapturesMarkdown,
  formatSavedAt
} from "@renderer/lib/captureFormat";
import {
  answerKnowledgeQuestion,
  createKnowledgeChunks,
  type GroundedKnowledgeAnswer
} from "@renderer/lib/knowledge";
import type { BrowserViewCommand } from "../../../shared/api";
import {
  closeBrowserAssistantPanel,
  createBrowserAssistantPanelState,
  openBrowserAssistantPanel,
  shouldRenderBrowserAssistantPanel,
  type BrowserAssistantPanelTrigger
} from "../../../shared/browserAssistantPanel";
import {
  createBrowserRailLocalTabDraft,
  createBrowserRailSections,
  findBrowserRailTab,
  getActiveBrowserRailPageTabId,
  getVisibleBrowserRailSections,
  isBrowserRailPageTabActive,
  normalizeBrowserRailUrl,
  selectBrowserRailFallbackTab,
  type BrowserRailSection
} from "../../../shared/browserRailTabs";
import {
  defaultBrowserViewZoomFactor,
  getNextBrowserViewZoomFactor,
  isBrowserViewZoomCommand
} from "../../../shared/browserViewZoom";
import { cn } from "@renderer/lib/utils";
import { useLaunchpadStore } from "@renderer/store/useLaunchpadStore";

const sourceLabels = {
  oracle_docs: "Oracle Docs",
  oci_console: "OCI Console",
  livelabs: "LiveLabs",
  github: "GitHub",
  other: "Web"
};

function createPreviewCaptureResult(capture: Omit<CapturedPage, "id" | "savedAt">): { ok: true; id: string; savedAt: string; capture: CapturedPage } {
  const id = crypto.randomUUID();
  const savedAt = new Date().toISOString();
  return {
    ok: true,
    id,
    savedAt,
    capture: {
      id,
      savedAt,
      ...capture
    }
  };
}

type BrowserOsRoute = "onboarding" | "workspace" | "settings";

type BrowserOsPageTabTarget = {
  url: string;
  title?: string;
};

type BrowserOsAssistantPanelOpenTrigger = Exclude<BrowserAssistantPanelTrigger, "close">;

const browserOsAssistantModeIcons: Record<AgenticModeId, LucideIcon> = {
  chat: MessageSquare,
  captures: Save
};

export function AppShell(): ReactElement {
  const {
    currentTitle,
    currentUrl,
    selectedWorkspaceId,
    captures,
    setUrl,
    setPageMetadata,
    hydrateCaptures,
    addCapture,
    clearCaptures
  } = useLaunchpadStore();
  const browserSurfaceRef = useRef<BrowserSurfaceHandle>(null);
  const browserOsTopMenuRef = useRef<HTMLDivElement>(null);
  const [draftUrl, setDraftUrl] = useState(currentUrl);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [screenshotState, setScreenshotState] = useState<"idle" | "saving" | "saved">("idle");
  const [selectedCaptureId, setSelectedCaptureId] = useState<string>("");
  const [clipboardStatus, setClipboardStatus] = useState<string>("");
  const [chatQuestion, setChatQuestion] = useState("保存済み captures から、OCI GenAI Enterprise AI の検討ポイントを整理してください。");
  const [chatAnswer, setChatAnswer] = useState<GroundedKnowledgeAnswer | null>(null);
  const [chatAskState, setChatAskState] = useState<"idle" | "asking">("idle");
  const [chatStatus, setChatStatus] = useState("");
  const [browserState, setBrowserState] = useState<BrowserSurfaceState>({
    canGoBack: false,
    canGoForward: false,
    isLoading: false
  });
  const [browserOsRoute, setBrowserOsRoute] = useState<BrowserOsRoute>("onboarding");
  const [browserOsGlobalZoomFactor, setBrowserOsGlobalZoomFactor] = useState(defaultBrowserViewZoomFactor);
  const [agenticModeId, setAgenticModeId] = useState<AgenticModeId>("captures");
  const [browserOsRailCollapsed, setBrowserOsRailCollapsed] = useState(false);
  const [browserOsTabSearchOpen, setBrowserOsTabSearchOpen] = useState(false);
  const [browserOsTabSearchQuery, setBrowserOsTabSearchQuery] = useState("");
  const [browserOsClosedTabIds, setBrowserOsClosedTabIds] = useState<string[]>([]);
  const [browserOsActiveTabId, setBrowserOsActiveTabId] = useState("onboarding");
  const [browserOsLocalTabs, setBrowserOsLocalTabs] = useState<BrowserOsSideTab[]>([]);
  const [browserOsNextTabIndex, setBrowserOsNextTabIndex] = useState(1);
  const [browserOsAssistantPanel, setBrowserOsAssistantPanel] = useState(() =>
    createBrowserAssistantPanelState<AgenticModeId>("captures")
  );
  const [browserOsRailStatus, setBrowserOsRailStatus] = useState("");

  const selectedWorkspace = mockWorkspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? mockWorkspaces[0];
  const selectedCapture = captures.find((capture) => capture.id === selectedCaptureId) ?? captures[0];
  const captureContextChunks = useMemo(
    () => createKnowledgeChunks(captures, captures.map((capture) => capture.id)),
    [captures]
  );
  const sourceType = detectSourceType(currentUrl);
  const activeAgenticMode = useMemo(
    () => agenticModes.find((mode) => mode.id === agenticModeId) ?? agenticModes[0],
    [agenticModeId]
  );
  const activeProviderLabel = activeAgenticMode.id === "chat" ? "OCI GenAI Enterprise AI" : "Electron local store";
  const browserOsAssistantPanelVisible = shouldRenderBrowserAssistantPanel(browserOsAssistantPanel, browserOsRoute);
  const ActiveAgenticIcon = browserOsAssistantModeIcons[activeAgenticMode.id];
  const isBrowserOsOnboarding = browserOsRoute === "onboarding";
  const isBrowserOsSettings = browserOsRoute === "settings";
  const isBrowserOsInternalPage = isBrowserOsOnboarding || isBrowserOsSettings;
  const displayedChromeUrl = isBrowserOsOnboarding ? "chrome://ai-launchpad/onboarding" : isBrowserOsSettings ? "chrome://ai-launchpad/settings" : draftUrl;

  useEffect(() => {
    let canceled = false;

    async function loadLocalStore(): Promise<void> {
      if (!window.aiLaunchpad) {
        return;
      }

      try {
        const storedCaptures = await window.aiLaunchpad.browserApi.listCaptures();

        if (canceled) {
          return;
        }

        hydrateCaptures(storedCaptures.captures);
        if (storedCaptures.captures.length > 0) {
          setSelectedCaptureId((current) => current || storedCaptures.captures[0].id);
        }

      } catch {
        if (!canceled) {
          setClipboardStatus("ローカル保存データを読み込めませんでした。");
        }
      }
    }

    void loadLocalStore();
    return () => {
      canceled = true;
    };
  }, [hydrateCaptures]);

  const currentContext = useMemo(
    () => ({
      workspace: selectedWorkspace.name,
      source: sourceLabels[sourceType]
    }),
    [selectedWorkspace.name, sourceType]
  );

  const handlePageMetadataChange = useCallback(
    (metadata: { url: string; title: string }) => {
      setDraftUrl(metadata.url);
      setPageMetadata(metadata.url, metadata.title);
    },
    [setPageMetadata]
  );

  const handleNavigationStateChange = useCallback((state: BrowserSurfaceState) => {
    setBrowserState(state);
  }, []);

  const handleToggleBrowserOsTabSearch = useCallback(() => {
    const nextOpen = !browserOsTabSearchOpen;
    setBrowserOsTabSearchOpen(nextOpen);
    if (nextOpen) {
      setBrowserOsRailCollapsed(false);
    } else {
      setBrowserOsTabSearchQuery("");
    }
  }, [browserOsTabSearchOpen]);

  const browserOsSideSections = useMemo(() => createBrowserRailSections(browserOsBaseSideSections, browserOsLocalTabs), [browserOsLocalTabs]);

  const handleSelectBrowserOsTab = useCallback(
    (tab: BrowserOsSideTab, statusOverride?: string) => {
      const label = tab.id === "workspace" ? currentTitle : tab.pageTarget?.title || tab.label;
      setBrowserOsActiveTabId(tab.id);

      if (tab.agenticMode) {
        const modeId = tab.agenticMode;
        setAgenticModeId(modeId);
        setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, modeId, "rail"));
        setBrowserOsRoute("workspace");
        setBrowserOsRailStatus(statusOverride || `${label} mode を開きました。`);
        return;
      }

      if (tab.pageTarget) {
        const title = tab.pageTarget.title || titleForUrl(tab.pageTarget.url);
        setDraftUrl(tab.pageTarget.url);
        setUrl(tab.pageTarget.url);
        setPageMetadata(tab.pageTarget.url, title);
        setBrowserOsRoute("workspace");
        setBrowserOsRailStatus(statusOverride || `${title} を開きました。`);
        return;
      }

      if (tab.route) {
        setBrowserOsRoute(tab.route);
        setBrowserOsRailStatus(statusOverride || `${label} tab を開きました。`);
      }
    },
    [currentTitle, setPageMetadata, setUrl]
  );

  const handleSelectTopAgenticMode = useCallback(
    (modeId: AgenticModeId, statusOverride?: string, trigger: BrowserOsAssistantPanelOpenTrigger = "toolbar") => {
      const modeTab = findBrowserRailTab(browserOsSideSections, (tab) => tab.agenticMode === modeId);
      if (modeTab) {
        setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, modeId, trigger));
        handleSelectBrowserOsTab(modeTab, statusOverride);
        return;
      }

      setAgenticModeId(modeId);
      setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, modeId, trigger));
      setBrowserOsRoute("workspace");
      setBrowserOsActiveTabId("workspace");
      if (statusOverride) {
        setBrowserOsRailStatus(statusOverride);
      }
    },
    [browserOsSideSections, handleSelectBrowserOsTab]
  );

  const handleApplyBrowserViewCommand = useCallback(
    (command: BrowserViewCommand) => {
      if (isBrowserViewZoomCommand(command)) {
        setBrowserOsGlobalZoomFactor((currentZoomFactor) => getNextBrowserViewZoomFactor(currentZoomFactor, command));
        setBrowserOsRailStatus(
          command === "reset_zoom"
            ? "すべてのページ zoom を 100% に戻しました。"
            : command === "zoom_in"
              ? "すべてのページを拡大しました。"
              : "すべてのページを縮小しました。"
        );
        return;
      }

      if (isBrowserOsInternalPage) {
        setBrowserOsRailStatus("Web page を開くと View shortcut を使用できます。");
        return;
      }

      if (command === "reload") {
        browserSurfaceRef.current?.reload();
        setBrowserOsRailStatus("ページを再読み込みしました。");
        return;
      }

      if (command === "force_reload") {
        browserSurfaceRef.current?.forceReload();
        setBrowserOsRailStatus("キャッシュを無視してページを再読み込みしました。");
      }
    },
    [isBrowserOsInternalPage]
  );

  useEffect(() => {
    const unsubscribe = window.aiLaunchpad?.browserViewCommands.onCommand(handleApplyBrowserViewCommand);
    return () => {
      unsubscribe?.();
    };
  }, [handleApplyBrowserViewCommand]);

  const handleCloseBrowserOsAssistantPanel = useCallback(() => {
    setBrowserOsAssistantPanel((current) => closeBrowserAssistantPanel(current));
    setBrowserOsRailStatus("Workspace panel を閉じました。Toolbar の Chat / Captures から再表示できます。");
  }, []);

  const handleCreateBrowserOsTab = useCallback(() => {
    const title = titleForUrl(defaultUrl);
    const nextTabIndex = browserOsNextTabIndex;
    const draft = createBrowserRailLocalTabDraft(nextTabIndex, defaultUrl, title);
    const tab: BrowserOsSideTab = {
      ...draft,
      icon: LayoutDashboard,
      accent: "orange"
    };
    setBrowserOsLocalTabs((current) => [...current, tab]);
    setBrowserOsNextTabIndex((current) => current + 1);
    setBrowserOsActiveTabId(tab.id);
    setDraftUrl(defaultUrl);
    setUrl(defaultUrl);
    setPageMetadata(defaultUrl, title);
    setBrowserOsRoute("workspace");
    setBrowserOsRailStatus(`${tab.label} を開きました。`);
  }, [browserOsNextTabIndex, setPageMetadata, setUrl]);

  const handleCloseBrowserOsTab = useCallback(
    (tab: BrowserOsSideTab) => {
      if (!tab.closeable) {
        return;
      }

      const fallbackTab = selectBrowserRailFallbackTab(browserOsSideSections, browserOsClosedTabIds, tab.id);

      if (tab.local) {
        setBrowserOsLocalTabs((current) => current.filter((candidate) => candidate.id !== tab.id));
      } else {
        setBrowserOsClosedTabIds((current) => (current.includes(tab.id) ? current : [...current, tab.id]));
      }

      const closesActiveRoute = tab.id === browserOsActiveTabId || (tab.route === browserOsRoute && !tab.agenticMode && !tab.pageTarget);
      const closesActivePage =
        tab.pageTarget &&
        browserOsRoute === "workspace" &&
        normalizeBrowserRailUrl(currentUrl) === normalizeBrowserRailUrl(tab.pageTarget.url);
      const closesActiveMode = tab.agenticMode && browserOsRoute === "workspace" && tab.agenticMode === agenticModeId;

      if ((closesActiveRoute || closesActivePage || closesActiveMode) && fallbackTab) {
        handleSelectBrowserOsTab(fallbackTab, `${tab.label} tab を閉じ、${fallbackTab.label} に切り替えました。`);
      } else {
        setBrowserOsRailStatus(`${tab.label} tab を閉じました。`);
      }
    },
    [
      agenticModeId,
      browserOsActiveTabId,
      browserOsClosedTabIds,
      browserOsRoute,
      browserOsSideSections,
      currentUrl,
      handleSelectBrowserOsTab
    ]
  );

  function handleNavigate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedUrl = draftUrl.startsWith("http") ? draftUrl : `https://${draftUrl}`;
    setDraftUrl(normalizedUrl);
    setUrl(normalizedUrl);
    setBrowserOsRoute("workspace");
    setBrowserOsActiveTabId("workspace");
    setBrowserOsRailStatus(`${normalizedUrl} を開きました。`);
  }

  async function handleSavePage(): Promise<void> {
    setSaveState("saving");
    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const pageSourceType = detectSourceType(pageUrl);
    const payload = {
      workspaceId: selectedWorkspace.id,
      url: pageUrl,
      title: pageTitle,
      sourceType: pageSourceType,
      summary: undefined
    };

    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.savePage(payload)
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspace.id,
          kind: "page",
          title: pageTitle,
          url: pageUrl,
          sourceType: pageSourceType,
          summary: payload.summary
        });

    addCapture({
      ...result.capture,
      sourceType: detectSourceType(result.capture.url)
    });
    setSaveState("saved");
    setSelectedCaptureId(result.id);
    window.setTimeout(() => setSaveState("idle"), 1200);
  }

  async function handleSaveScreenshot(): Promise<void> {
    setScreenshotState("saving");
    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const pageSourceType = detectSourceType(pageUrl);
    const screenshotDataUrl = await browserSurfaceRef.current?.captureScreenshot();
    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.saveScreenshot({
          workspaceId: selectedWorkspace.id,
          url: pageUrl,
          title: pageTitle,
          sourceType: pageSourceType,
          screenshotDataUrl
        })
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspace.id,
          kind: "screenshot",
          title: `スクリーンショット: ${pageTitle}`,
          url: pageUrl,
          sourceType: pageSourceType,
          screenshotDataUrl
        });

    addCapture({
      ...result.capture,
      sourceType: detectSourceType(result.capture.url),
      screenshotDataUrl: result.capture.screenshotDataUrl ?? screenshotDataUrl
    });
    setScreenshotState("saved");
    setSelectedCaptureId(result.id);
    window.setTimeout(() => setScreenshotState("idle"), 1200);
  }

  async function handleSaveSelection(): Promise<void> {
    const selectedText = await browserSurfaceRef.current?.getSelectedText();
    const trimmedText = selectedText?.trim();
    if (!trimmedText) {
      setBrowserOsRailStatus("選択テキストがありません。ページ内でテキストを選択してから保存してください。");
      return;
    }

    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const pageSourceType = detectSourceType(pageUrl);
    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.saveSelection({
          workspaceId: selectedWorkspace.id,
          url: pageUrl,
          title: pageTitle,
          sourceType: pageSourceType,
          selectedText: trimmedText
        })
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspace.id,
          kind: "selection",
          title: `選択: ${pageTitle}`,
          url: pageUrl,
          sourceType: pageSourceType,
          selectedText: trimmedText
        });

    addCapture({
      ...result.capture,
      sourceType: detectSourceType(result.capture.url)
    });
    setSelectedCaptureId(result.id);
    setBrowserOsRailStatus("選択テキストを local capture に保存しました。");
  }

  async function copyToClipboard(text: string, successLabel: string): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setClipboardStatus(successLabel);
    } catch {
      setClipboardStatus("コピーできませんでした");
    }

    window.setTimeout(() => setClipboardStatus(""), 1400);
  }

  function handleCopyCapture(capture: CapturedPage): void {
    void copyToClipboard(formatCaptureCopyText(capture), "コピーしました");
  }

  function handleExportCaptureMarkdown(capture: CapturedPage): void {
    const workspace = mockWorkspaces.find((item) => item.id === capture.workspaceId);
    void copyToClipboard(formatCaptureMarkdown(capture, workspace), "Markdown をコピーしました");
  }

  function handleExportAllMarkdown(): void {
    void copyToClipboard(formatCapturesMarkdown(captures, mockWorkspaces), "全件 Markdown をコピーしました");
  }

  function handleUseChatPrompt(prompt: string): void {
    setChatQuestion(prompt);
    setChatStatus("");
  }

  async function handleAskCaptureChat(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const question = chatQuestion.trim();
    if (!question) {
      setChatStatus("質問を入力してください。");
      return;
    }

    if (captureContextChunks.length === 0) {
      setChatAnswer(answerKnowledgeQuestion(question, [], 4));
      setChatStatus("先にページ、選択テキスト、またはスクリーンショットを Captures に保存してください。");
      return;
    }

    setChatAskState("asking");
    setChatStatus("");

    try {
      const result = window.aiLaunchpad
        ? await window.aiLaunchpad.ragAdapter.askKnowledge({
            question,
            chunks: captureContextChunks,
            maxResults: 4
          })
        : answerKnowledgeQuestion(question, captureContextChunks, 4);

      setChatAnswer(result);
      setChatStatus(
        result.answerProvider === "oci-genai"
          ? "OCI GenAI Enterprise AI で回答しました。"
          : "保存済み captures をローカルで検索して回答候補を作成しました。"
      );
    } catch {
      setChatAnswer(answerKnowledgeQuestion(question, captureContextChunks, 4));
      setChatStatus("OCI GenAI に接続できなかったため、保存済み captures のローカル検索結果を表示しています。");
    } finally {
      setChatAskState("idle");
    }
  }

  async function handleClearCaptures(): Promise<void> {
    if (window.aiLaunchpad) {
      await window.aiLaunchpad.browserApi.clearCaptures();
    }

    clearCaptures();
    setSelectedCaptureId("");
  }

  return (
    <div className="flex h-screen min-h-[720px] bg-white text-foreground">
      <BrowserOsSideRail
        activeRoute={browserOsRoute}
        activeAgenticMode={agenticModeId}
        collapsed={browserOsRailCollapsed}
        currentTitle={currentTitle}
        currentUrl={currentUrl}
        sections={browserOsSideSections}
        closedTabIds={browserOsClosedTabIds}
        activeTabId={browserOsActiveTabId}
        statusMessage={browserOsRailStatus}
        searchOpen={browserOsTabSearchOpen}
        searchQuery={browserOsTabSearchQuery}
        onCloseTab={handleCloseBrowserOsTab}
        onCreateTab={handleCreateBrowserOsTab}
        onRouteChange={(route) => {
          const routeTab = findBrowserRailTab(browserOsSideSections, (tab) => tab.route === route && !tab.agenticMode);
          if (routeTab) {
            handleSelectBrowserOsTab(routeTab);
          } else {
            setBrowserOsRoute(route);
          }
        }}
        onSelectTab={handleSelectBrowserOsTab}
        onSearchQueryChange={setBrowserOsTabSearchQuery}
        onToggleCollapsed={() => setBrowserOsRailCollapsed((current) => !current)}
        onToggleSearch={handleToggleBrowserOsTabSearch}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#e5e5e5] bg-[#f7f7f6] px-3 text-[#5f6368]">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="戻る"
              disabled={isBrowserOsInternalPage || !browserState.canGoBack}
              onClick={() => browserSurfaceRef.current?.goBack()}
              className="h-7 w-7 rounded-full text-[#5f6368] hover:bg-[#ececec]"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="進む"
              disabled={isBrowserOsInternalPage || !browserState.canGoForward}
              onClick={() => browserSurfaceRef.current?.goForward()}
              className="h-7 w-7 rounded-full text-[#5f6368] hover:bg-[#ececec]"
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="再読み込み"
              onClick={() => (isBrowserOsInternalPage ? setBrowserOsRoute(browserOsRoute) : browserSurfaceRef.current?.reload())}
              className="h-7 w-7 rounded-full text-[#5f6368] hover:bg-[#ececec]"
            >
              <RefreshCw aria-hidden="true" className={cn("h-4 w-4", browserState.isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="ホーム"
              onClick={() => setBrowserOsRoute("onboarding")}
              className="h-7 w-7 rounded-full text-[#5f6368] hover:bg-[#ececec]"
            >
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>

          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              if (isBrowserOsInternalPage) {
                event.preventDefault();
                setBrowserOsRoute("workspace");
                return;
              }

              void handleNavigate(event);
            }}
            className="flex min-w-0 flex-1 items-center gap-1"
          >
            <div className="relative min-w-0 flex-1">
              <Globe2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
              <Input
                aria-label="URL"
                value={displayedChromeUrl}
                readOnly={isBrowserOsInternalPage}
                onChange={(event) => setDraftUrl(event.target.value)}
                onFocus={() => {
                  if (isBrowserOsInternalPage) {
                    setBrowserOsRoute("workspace");
                  }
                }}
                className="h-7 rounded-full border-[#e2e2e2] bg-white pl-9 pr-10 text-xs text-[#3f3f46] shadow-sm"
              />
              <Button
                type="submit"
                variant="ghost"
                aria-label="開く"
                className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full p-0 text-[#3f3f46] hover:bg-[#ececec]"
              >
                <Search aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>

          <div ref={browserOsTopMenuRef} className="relative ml-1 flex shrink-0 items-center gap-1 text-xs font-medium text-[#5f6368]">
            <BrowserOsToolbarAction
              label="Chat"
              icon={MessageSquare}
              active={browserOsAssistantPanelVisible && agenticModeId === "chat"}
              onClick={() => handleSelectTopAgenticMode("chat")}
            />
            <BrowserOsToolbarAction
              label="Captures"
              icon={Save}
              active={browserOsAssistantPanelVisible && agenticModeId === "captures"}
              onClick={() => handleSelectTopAgenticMode("captures")}
            />
            <BrowserOsToolbarAction
              label="Settings"
              icon={SettingsIcon}
              active={browserOsRoute === "settings"}
              onClick={() => {
                setBrowserOsRoute("settings");
                setBrowserOsActiveTabId("settings");
                setBrowserOsRailStatus("Settings を開きました。");
              }}
            />
          </div>
        </header>

          {isBrowserOsOnboarding ? (
          <BrowserOsOnboardingPage
            onGetStarted={() => {
              const workspaceTab = findBrowserRailTab(browserOsSideSections, (tab) => tab.id === "workspace");
              if (workspaceTab) {
                handleSelectBrowserOsTab(workspaceTab);
              } else {
                setBrowserOsRoute("workspace");
                setBrowserOsActiveTabId("workspace");
              }
            }}
          />
        ) : isBrowserOsSettings ? (
          <OciGenAiSettingsPage onStatusChange={setBrowserOsRailStatus} />
        ) : (
        <div
          className={cn(
            "grid min-h-0 flex-1",
            browserOsAssistantPanelVisible ? "grid-cols-[minmax(520px,1fr)_380px]" : "grid-cols-[minmax(0,1fr)]"
          )}
        >
          <section className="flex min-w-0 min-h-0 flex-col overflow-hidden bg-[#f4f4f5] p-2">
            <div className="min-h-0 min-w-0 flex-1">
              <BrowserSurface
                ref={browserSurfaceRef}
                currentTitle={currentTitle}
                currentUrl={currentUrl}
                zoomFactor={browserOsGlobalZoomFactor}
                sourceType={sourceType}
                onPageMetadataChange={handlePageMetadataChange}
                onNavigationStateChange={handleNavigationStateChange}
              />
            </div>
          </section>

          {browserOsAssistantPanelVisible ? (
          <aside className="flex min-h-0 flex-col border-l border-[#d7d7d7] bg-[#fbfbfa]" aria-label="Workspace side panel">
            <div className="border-b border-[#e5e5e5] bg-[#f7f7f6] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                    <ActiveAgenticIcon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#171717]">Workspace Panel</p>
                    <p className="truncate text-[11px] text-[#71717a]">{activeAgenticMode.label} / {currentContext.workspace}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-full border border-[#e6e6e6] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-normal text-[#f05a24]">
                    Local
                  </span>
                  <button
                    type="button"
                    aria-label="Workspace side panel を閉じる"
                    title="Workspace side panel を閉じる"
                    onClick={handleCloseBrowserOsAssistantPanel}
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <section className="rounded-md border border-[#e5e5e5] bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <ActiveAgenticIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#f05a24]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#171717]">{activeAgenticMode.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#71717a]">{activeAgenticMode.summary}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                  <span className="rounded-full bg-[#fff1eb] px-2 py-1 text-[#f05a24]">{activeAgenticMode.stateLabel}</span>
                  <span className="rounded-full bg-[#f4f4f5] px-2 py-1 text-[#5f6368]">{activeProviderLabel}</span>
                  <span className="rounded-full bg-[#f4f4f5] px-2 py-1 text-[#5f6368]">Secrets excluded</span>
                </div>
              </section>

              <section className="mt-3 rounded-md border border-[#e5e5e5] bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">Current page</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <ContextRow label="Source" value={currentContext.source} />
                  <ContextRow label="Page" value={currentTitle} />
                </dl>
                <div className="mt-3 text-[10px] text-[#71717a]">
                  <span className="truncate rounded-md bg-[#f4f4f5] px-2 py-1">{captures.length} captures</span>
                </div>
              </section>

              <section className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleSaveSelection}>
                  <TextSelect aria-hidden="true" className="h-4 w-4" />
                  選択保存
                </Button>
                <Button variant="outline" onClick={handleSaveScreenshot} disabled={screenshotState === "saving"}>
                  <Camera aria-hidden="true" className="h-4 w-4" />
                  {screenshotState === "saved" ? "スクショ済み" : "スクショ保存"}
                </Button>
                <Button onClick={handleSavePage} disabled={saveState === "saving"}>
                  <Save aria-hidden="true" className="h-4 w-4" />
                  {saveState === "saved" ? "保存済み" : "保存"}
                </Button>
              </section>

              {agenticModeId === "chat" ? (
                <CaptureChatPanel
                  answer={chatAnswer}
                  askState={chatAskState}
                  captureCount={captures.length}
                  question={chatQuestion}
                  status={chatStatus}
                  onAsk={handleAskCaptureChat}
                  onQuestionChange={setChatQuestion}
                  onUsePrompt={handleUseChatPrompt}
                />
              ) : (
                <>
                  <section className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold">Captures</h2>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-sky-700" />
                          Electron local store に保存
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearCaptures} disabled={captures.length === 0}>
                        クリア
                      </Button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {captures.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border p-4 text-sm leading-6 text-slate-500">
                          保存したページはここに表示されます。
                        </p>
                      ) : (
                        captures.map((capture) => (
                          <button
                            key={capture.id}
                            type="button"
                            onClick={() => setSelectedCaptureId(capture.id)}
                            className={cn(
                              "w-full cursor-pointer rounded-md border bg-white p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                              selectedCapture?.id === capture.id ? "border-sky-700 bg-sky-50" : "border-border hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="min-w-0 truncate text-sm font-medium text-slate-950">{capture.title}</p>
                              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {formatCaptureKind(capture.kind)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-500">{capture.url}</p>
                            {capture.screenshotDataUrl ? (
                              <img
                                src={capture.screenshotDataUrl}
                                alt={`${capture.title} thumbnail`}
                                className="mt-3 aspect-video w-full rounded-md border border-border bg-slate-50 object-cover"
                              />
                            ) : null}
                            {capture.selectedText ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{capture.selectedText}</p>
                            ) : null}
                          </button>
                        ))
                      )}
                    </div>
                    {captures.length > 0 ? (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" onClick={handleExportAllMarkdown} className="w-full">
                          <FileDown aria-hidden="true" className="h-4 w-4" />
                          全件 Markdown 出力
                        </Button>
                      </div>
                    ) : null}
                  </section>

                  {selectedCapture ? (
                    <CaptureDetail
                      capture={selectedCapture}
                      workspaceName={mockWorkspaces.find((workspace) => workspace.id === selectedCapture.workspaceId)?.name ?? "Unknown"}
                      clipboardStatus={clipboardStatus}
                      onCopy={() => handleCopyCapture(selectedCapture)}
                      onExportMarkdown={() => handleExportCaptureMarkdown(selectedCapture)}
                    />
                  ) : null}
                </>
              )}
            </div>
          </aside>
          ) : null}
        </div>
        )}
      </main>
    </div>
  );
}

type BrowserOsSideTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  route?: BrowserOsRoute;
  agenticMode?: AgenticModeId;
  pageTarget?: BrowserOsPageTabTarget;
  closeable?: boolean;
  local?: boolean;
  accent?: "orange" | "blue" | "slate";
};

const browserOsBaseSideSections: BrowserRailSection<BrowserOsSideTab>[] = [
  {
    id: "active",
    tabs: [
      { id: "onboarding", label: "AI Launchpad", icon: Sparkles, route: "onboarding", closeable: true, accent: "orange" },
      { id: "workspace", label: "Oracle Workspace", icon: LayoutDashboard, route: "workspace", accent: "orange" },
      { id: "settings", label: "Settings", icon: SettingsIcon, route: "settings", accent: "slate" },
      { id: "docs", label: "Oracle Docs", icon: BookOpen, pageTarget: { url: defaultUrl }, closeable: true, accent: "slate" },
      {
        id: "github",
        label: "GitHub Sample",
        icon: FileText,
        pageTarget: { url: "https://github.com/oracle-samples/oci-generative-ai", title: "GitHub Sample - Oracle AI Demo" },
        closeable: true,
        accent: "slate"
      }
    ]
  },
  {
    id: "assistant",
    tabs: [
      { id: "chat", label: "Chat", icon: MessageSquare, agenticMode: "chat", accent: "orange" },
      { id: "captures", label: "Captures", icon: Save, route: "workspace", agenticMode: "captures", accent: "orange" }
    ]
  },
  {
    id: "recent",
    tabs: [
      {
        id: "models",
        label: "Models - OCI GenAI",
        icon: BrainCircuit,
        pageTarget: {
          url: "https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm",
          title: "OCI Generative AI Models"
        },
        closeable: true,
        accent: "slate"
      },
      {
        id: "docs-ja",
        label: "Oracle Docs 日本語",
        icon: Globe2,
        pageTarget: {
          url: "https://docs.oracle.com/ja-jp/iaas/Content/generative-ai/home.htm",
          title: "Oracle Docs 日本語 - OCI Generative AI"
        },
        closeable: true,
        accent: "blue"
      }
    ]
  }
];

function BrowserOsSideRail({
  activeRoute,
  activeAgenticMode,
  activeTabId,
  collapsed,
  currentTitle,
  currentUrl,
  sections,
  closedTabIds,
  statusMessage,
  searchOpen,
  searchQuery,
  onCloseTab,
  onCreateTab,
  onRouteChange,
  onSelectTab,
  onSearchQueryChange,
  onToggleCollapsed,
  onToggleSearch
}: {
  activeRoute: BrowserOsRoute;
  activeAgenticMode: AgenticModeId;
  activeTabId: string;
  collapsed: boolean;
  currentTitle: string;
  currentUrl: string;
  sections: BrowserRailSection<BrowserOsSideTab>[];
  closedTabIds: string[];
  statusMessage: string;
  searchOpen: boolean;
  searchQuery: string;
  onCloseTab: (tab: BrowserOsSideTab) => void;
  onCreateTab: () => void;
  onRouteChange: (route: BrowserOsRoute) => void;
  onSelectTab: (tab: BrowserOsSideTab) => void;
  onSearchQueryChange: (query: string) => void;
  onToggleCollapsed: () => void;
  onToggleSearch: () => void;
}): ReactElement {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleSections = getVisibleBrowserRailSections(sections, closedTabIds);
  const activePageTabId = getActiveBrowserRailPageTabId(visibleSections, activeTabId, activeRoute, currentUrl);
  const filteredSections = visibleSections
    .map((section) => ({
      ...section,
      tabs: section.tabs.filter((tab) => {
        if (!normalizedQuery) {
          return true;
        }
        const label = tab.id === "workspace" ? currentTitle : tab.label;
        return `${label} ${tab.id} ${tab.pageTarget?.title ?? ""} ${tab.pageTarget?.url ?? ""}`.toLowerCase().includes(normalizedQuery);
      })
    }))
    .filter((section) => section.tabs.length > 0);
  const visibleTabCount = filteredSections.reduce((count, section) => count + section.tabs.length, 0);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-[#cbd6d9] bg-[#e6f2f4] text-[#4b5563] transition-[width] duration-200",
        collapsed ? "w-16" : "w-48"
      )}
      aria-label="Browser tab rail"
    >
      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>
      <div className={cn("flex h-16 items-center border-b border-[#cbd6d9] px-2", collapsed ? "justify-center" : "justify-between")}>
        <button
          type="button"
          aria-label={collapsed ? "Sidebar を展開" : "Sidebar を折りたたむ"}
          aria-pressed={collapsed}
          onClick={onToggleCollapsed}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="h-4 w-4" /> : <PanelLeftClose aria-hidden="true" className="h-4 w-4" />}
        </button>
        <div className={cn("items-center gap-1", collapsed ? "hidden" : "flex")}>
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => onRouteChange("onboarding")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/70 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Search tabs"
            aria-pressed={searchOpen}
            onClick={onToggleSearch}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              searchOpen && "bg-white text-[#f05a24] shadow-sm"
            )}
          >
            <Search aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && !collapsed ? (
        <div className="border-b border-[#d5e1e4] px-2 py-2">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-normal text-[#64748b]" htmlFor="browseros-tab-search">
            Tab search
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
            <input
              id="browseros-tab-search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="h-8 w-full rounded-md border border-[#cbd6d9] bg-white pl-7 pr-2 text-xs text-[#111827] outline-none transition-colors duration-200 focus:border-[#f26a2e] focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <p className="mt-1 text-[10px] text-[#64748b]">{visibleTabCount} tabs matched</p>
        </div>
      ) : null}

      <nav className="min-h-0 flex-1 overflow-auto px-2 py-2" aria-label="BrowserOS style tabs">
        {filteredSections.length > 0 ? (
          <div className="space-y-2">
            {filteredSections.map((section) => (
              <div key={section.id} className="space-y-1 border-b border-[#d5e1e4] pb-2 last:border-b-0">
                {section.tabs.map((tab) => (
                  <BrowserOsSideTabButton
                    key={tab.id}
                    tab={tab}
                    activeRoute={activeRoute}
                    activeAgenticMode={activeAgenticMode}
                    activeTabId={activeTabId}
                    activePageTabId={activePageTabId}
                    collapsed={collapsed}
                    currentTitle={currentTitle}
                    currentUrl={currentUrl}
                    onCloseTab={onCloseTab}
                    onSelectTab={onSelectTab}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#cbd6d9] bg-white/55 px-2 py-3 text-[11px] leading-relaxed text-[#64748b]">
            一致する tab はありません。Oracle、Chat、Docs などで検索してください。
          </div>
        )}
      </nav>

      <div className="border-t border-[#cbd6d9] p-2">
        <button
          type="button"
          onClick={onCreateTab}
          className={cn(
            "inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-white/70 text-lg font-semibold text-[#111827] shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
            collapsed && "rounded-full"
          )}
          aria-label="New workspace tab"
        >
          +
        </button>
      </div>
    </aside>
  );
}

function BrowserOsSideTabButton({
  tab,
  activeRoute,
  activeAgenticMode,
  activeTabId,
  activePageTabId,
  collapsed,
  currentTitle,
  currentUrl,
  onCloseTab,
  onSelectTab
}: {
  tab: BrowserOsSideTab;
  activeRoute: BrowserOsRoute;
  activeAgenticMode: AgenticModeId;
  activeTabId: string;
  activePageTabId: string;
  collapsed: boolean;
  currentTitle: string;
  currentUrl: string;
  onCloseTab: (tab: BrowserOsSideTab) => void;
  onSelectTab: (tab: BrowserOsSideTab) => void;
}): ReactElement {
  const Icon = tab.icon;
  const modeActive = tab.agenticMode ? activeRoute === "workspace" && activeAgenticMode === tab.agenticMode : false;
  const pageActive = isBrowserRailPageTabActive(tab, activeRoute, currentUrl) && (!activePageTabId || activePageTabId === tab.id);
  const routeActive = !tab.agenticMode && tab.route === activeRoute && !(tab.route === "workspace" && activePageTabId);
  const active = tab.id === activeTabId || modeActive || pageActive || routeActive;
  const label = tab.id === "workspace" ? currentTitle : tab.label;

  return (
    <div
      className={cn(
        "group flex h-7 w-full items-center rounded-md text-left text-[11px] transition-colors duration-200",
        collapsed ? "justify-center px-0" : "gap-2 px-2",
        active ? "bg-white text-[#111827] shadow-sm" : "text-[#4b5563] hover:bg-white/60"
      )}
    >
      <button
        type="button"
        aria-current={routeActive || pageActive ? "page" : undefined}
        aria-pressed={tab.agenticMode ? modeActive : undefined}
        title={label}
        onClick={() => {
          onSelectTab(tab);
        }}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
          collapsed ? "h-7 justify-center" : "h-full gap-2"
        )}
      >
        <span
          className={cn(
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px]",
            tab.accent === "orange"
              ? "bg-[#fff1eb] text-[#f05a24]"
              : tab.accent === "blue"
                ? "bg-[#e8f0ff] text-[#1d4ed8]"
                : "bg-white/70 text-[#4b5563]"
          )}
        >
          <Icon aria-hidden="true" className="h-3 w-3" />
        </span>
        {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
      </button>
      {tab.closeable && !collapsed ? (
        <button
          type="button"
          aria-label={`${label} tab を閉じる`}
          title={`${label} tab を閉じる`}
          onClick={() => onCloseTab(tab)}
          className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[#4b5563] opacity-70 transition-colors duration-200 hover:bg-[#e5eef1] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}

function BrowserOsToolbarAction({
  label,
  icon: Icon,
  active = false,
  shortcutLabel,
  ariaKeyShortcuts,
  onClick
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  shortcutLabel?: string;
  ariaKeyShortcuts?: string;
  onClick?: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-keyshortcuts={ariaKeyShortcuts}
      title={shortcutLabel ? `${label} (${shortcutLabel})` : label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
        active ? "bg-[#fff1eb] text-[#f05a24]" : "text-[#5f6368] hover:bg-[#ececec]"
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function BrowserOsOnboardingPage({ onGetStarted }: { onGetStarted: () => void }): ReactElement {
  const highlights: Array<{ icon: LucideIcon; title: string; detail: string }> = [
    {
      icon: BookOpen,
      title: "Oracle Docs / OCI Console Companion",
      detail: "Oracle Docs、OCI Console、LiveLabs、GitHub sample を開きながら、ページ、選択テキスト、スクリーンショットを保存します。"
    },
    {
      icon: BrainCircuit,
      title: "OCI GenAI Enterprise AI",
      detail: "現在のページと capture を見ながら、OCI GenAI Enterprise AI の検討に必要な根拠を整理します。"
    },
    {
      icon: ShieldCheck,
      title: "Secrets excluded",
      detail: "API key、token、password、顧客データを UI preview に含めない前提で扱います。"
    }
  ];

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f4f4f5] px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-[#f05a24]">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-normal">AI Launchpad for Oracle</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-[#171717]">Oracle / OCI pre-sales cockpit</h1>
        <p className="mt-2 text-sm leading-6 text-[#52525b]">
          OCI GenAI Enterprise AI を中心に、顧客需求分析から demo / PoC 準備までを支援する browser client です。
          Oracle 製品の理解と PoC を加速し、OCI 活用提案を後押しします。
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.title} className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#171717]">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#71717a]">{item.detail}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-7">
          <Button onClick={onGetStarted}>
            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
            Oracle Workspace を開く
          </Button>
        </div>
      </div>
    </div>
  );
}

function CaptureChatPanel({
  answer,
  askState,
  captureCount,
  question,
  status,
  onAsk,
  onQuestionChange,
  onUsePrompt
}: {
  answer: GroundedKnowledgeAnswer | null;
  askState: "idle" | "asking";
  captureCount: number;
  question: string;
  status: string;
  onAsk: (event: FormEvent<HTMLFormElement>) => void;
  onQuestionChange: (value: string) => void;
  onUsePrompt: (prompt: string) => void;
}): ReactElement {
  const suggestedPrompts = [
    "保存済み captures から、OCI GenAI Enterprise AI の提案ポイントを3つ整理してください。",
    "この captures で不足している前提、リスク、次に確認すべき証拠を整理してください。",
    "顧客向けに説明するなら、どの capture を根拠に何を話すべきですか。"
  ];
  const canAsk = captureCount > 0 && question.trim().length > 0 && askState !== "asking";
  const providerLabel = answer?.answerProvider === "oci-genai" ? "OCI GenAI" : "Local capture search";

  return (
    <section className="mt-5 rounded-md border border-[#e5e5e5] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">Capture Chat</p>
          <h2 className="mt-1 text-sm font-semibold text-[#171717]">Ask OCI GenAI</h2>
        </div>
        <span className="shrink-0 rounded-md bg-[#fff1eb] px-2 py-1 text-[11px] font-semibold text-[#f05a24]">
          {captureCount} captures
        </span>
      </div>

      <form onSubmit={onAsk} className="mt-4">
        <label htmlFor="capture-chat-question" className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">
          Question
        </label>
        <textarea
          id="capture-chat-question"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          rows={4}
          placeholder="保存済み captures に基づいて質問してください。"
          className="mt-2 min-h-[104px] w-full resize-none rounded-md border border-[#d4d4d4] bg-white px-3 py-2 text-sm leading-6 text-[#171717] outline-none transition-colors duration-200 placeholder:text-[#a1a1aa] focus:border-[#f05a24] focus:ring-2 focus:ring-[#fff1eb]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onUsePrompt(prompt)}
              className="cursor-pointer rounded-md border border-[#e5e5e5] bg-[#fbfbfa] px-2.5 py-1.5 text-left text-[11px] leading-4 text-[#52525b] transition-colors duration-200 hover:bg-[#fff7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {prompt}
            </button>
          ))}
        </div>

        <Button type="submit" className="mt-3 w-full" disabled={!canAsk}>
          <Send aria-hidden="true" className="h-4 w-4" />
          {askState === "asking" ? "確認中" : "Captures に質問"}
        </Button>
      </form>

      {captureCount === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-[#d4d4d4] p-3 text-sm leading-6 text-[#71717a]">
          Chat を使うには、先にページ、選択テキスト、またはスクリーンショットを Captures に保存してください。
        </p>
      ) : null}

      {status ? <p className="mt-3 text-xs leading-5 text-[#71717a]">{status}</p> : null}

      {answer ? (
        <div className="mt-4 border-t border-[#e5e5e5] pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">Answer</p>
            <span className="rounded-md bg-[#f4f4f5] px-2 py-1 text-[11px] font-medium text-[#52525b]">{providerLabel}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#27272a]">{answer.answer}</p>

          {answer.results.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">Sources</p>
              <ul className="mt-2 space-y-2">
                {answer.results.map((result) => (
                  <li key={result.chunk.id} className="rounded-md border border-[#e5e5e5] bg-[#fbfbfa] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-semibold text-[#171717]">{result.chunk.title}</p>
                      <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-[#52525b]">
                        {result.chunk.sourceKind}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-[11px] leading-4 text-[#71717a]">{result.chunk.sourceUrl}</p>
                    <p className="mt-2 text-xs leading-5 text-[#52525b]">{result.excerpt}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function CaptureDetail({
  capture,
  workspaceName,
  clipboardStatus,
  onCopy,
  onExportMarkdown
}: {
  capture: CapturedPage;
  workspaceName: string;
  clipboardStatus: string;
  onCopy: () => void;
  onExportMarkdown: () => void;
}): ReactElement {
  return (
    <section className="mt-5 rounded-md border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capture Detail</p>
          <h2 className="mt-1 truncate text-sm font-semibold text-slate-950">{capture.title}</h2>
        </div>
        <span className="shrink-0 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800">{formatCaptureKind(capture.kind)}</span>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <ContextRow label="Workspace" value={workspaceName} />
        <ContextRow label="Source" value={capture.sourceType} />
        <ContextRow label="Saved" value={formatSavedAt(capture.savedAt)} />
      </dl>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL</p>
        <p className="mt-1 break-all text-xs leading-5 text-slate-700">{capture.url}</p>
      </div>

      {capture.screenshotDataUrl ? (
        <img
          src={capture.screenshotDataUrl}
          alt={`${capture.title} detail preview`}
          className="mt-4 aspect-video w-full rounded-md border border-border bg-slate-50 object-cover"
        />
      ) : null}

      {capture.selectedText ? (
        <div className="mt-4 rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Text</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{capture.selectedText}</p>
        </div>
      ) : null}

      {capture.summary ? (
        <div className="mt-4 rounded-md bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{capture.summary}</p>
        </div>
      ) : null}

      {clipboardStatus ? <p className="mt-4 text-xs font-medium text-sky-700">{clipboardStatus}</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onCopy}>
          <Copy aria-hidden="true" className="h-4 w-4" />
          コピー
        </Button>
        <Button variant="outline" onClick={onExportMarkdown}>
          <FileDown aria-hidden="true" className="h-4 w-4" />
          Markdown
        </Button>
      </div>
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="grid grid-cols-[82px_1fr] gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-slate-800">{value}</dd>
    </div>
  );
}
