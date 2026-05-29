import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  BrainCircuit,
  Camera,
  ChevronDown,
  CheckSquare,
  ClipboardList,
  Copy,
  Database,
  DatabaseZap,
  FileDown,
  FileText,
  Globe2,
  Headphones,
  ListPlus,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  TextSelect,
  Upload,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BrowserSurface, type BrowserSurfaceHandle, type BrowserSurfaceState } from "@renderer/components/BrowserSurface";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import { agenticModes, type AgenticModeId } from "@renderer/data/agenticOs";
import { defaultUrl, type CapturedPage, detectSourceType, mockPlaybooks, mockWorkspaces, titleForUrl } from "@renderer/data/mockData";
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
  type KnowledgeChunk,
  type KnowledgeSearchResult
} from "@renderer/lib/knowledge";
import {
  createKnowledgeAnswerFileName,
  createOracleVectorSqlFileName,
  formatKnowledgeAnswerMarkdown
} from "@renderer/lib/knowledgeAnswerExport";
import type {
  AdbWalletCheckResult,
  BrowserViewCommand,
  GeneratedPocAsset,
  GeneratePocAssetsResult,
  LocalConnectorHealth,
  ObjectStorageCheckResult,
  OciCheckConfigResult,
  OracleVectorSearchExecutionResult,
  SqlclCheckResult
} from "../../../shared/api";
import {
  closeBrowserAssistantPanel,
  createBrowserAssistantPanelState,
  openBrowserAssistantPanel,
  shouldRenderBrowserAssistantPanel,
  type BrowserAssistantPanelTrigger
} from "../../../shared/browserAssistantPanel";
import {
  clearBrowserAssistantContext,
  createBrowserAssistantContextState,
  formatBrowserAssistantContextPrompt,
  getBrowserAssistantContextSourceLabel,
  summarizeBrowserAssistantContext,
  type BrowserAssistantContextItem
} from "../../../shared/browserAssistantContext";
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
import {
  ingestTextDocument,
  MAX_TEXT_DOCUMENT_BYTES,
  type IngestTextDocumentResult
} from "../../../shared/documentIngestion";
import type { OracleVectorSearchConfig, RagAdapterId } from "../../../shared/rag";
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

function createPreviewPocAssetsResult(workspaceName: string, playbookTitle: string): GeneratePocAssetsResult {
  return {
    status: "generated",
    message: "renderer preview の PoC asset templates です。実行や外部接続は行っていません。",
    generatedAt: new Date().toISOString(),
    warnings: ["renderer preview では Local Connector を呼び出していません。"],
    assets: [
      {
        kind: "readme",
        fileName: "README.md",
        title: "PoC README",
        content: `# ${workspaceName}\n\n## Playbook\n\n${playbookTitle}\n\n## Safety\n\n- Secret、wallet、private key は含めない`
      },
      {
        kind: "proposal",
        fileName: "proposal.md",
        title: "Proposal section draft",
        content: `# ${workspaceName} Proposal Section\n\n${playbookTitle} をベースに PoC の提案要旨、期待効果、確認が必要な前提を整理します。`
      },
      {
        kind: "email",
        fileName: "follow_up_email.md",
        title: "Follow-up email draft",
        content: `件名: ${workspaceName} PoC package の次アクション確認\n\n本日は ${playbookTitle} の PoC 準備についてお時間をいただき、ありがとうございました。\n\n次回までに data scope、ADB / Object Storage / IAM readiness、成功条件を確認します。`
      },
      {
        kind: "diagram",
        fileName: "architecture/architecture.mmd",
        title: "Mermaid architecture diagram",
        content: `flowchart LR\n  user["Business user / Pre-sales"]\n  browser["AI Launchpad Browser Client"]\n  docs["Oracle Docs / Captured pages"]\n  objectStorage["OCI Object Storage"]\n  db["Oracle AI Database 26ai"]\n  genai["OCI Generative AI"]\n  package["PoC package"]\n\n  user --> browser\n  browser --> docs\n  browser --> package\n  docs --> objectStorage\n  objectStorage --> db\n  genai --> db\n  db --> browser\n  browser --> user`
      },
      {
        kind: "env",
        fileName: ".env.example",
        title: "Environment variable template",
        content:
          "OCI_CLI_PROFILE=DEFAULT\nOCI_REGION=ap-tokyo-1\nOCI_OBJECT_STORAGE_NAMESPACE=<object-storage-namespace>\nOCI_OBJECT_STORAGE_BUCKET=<object-storage-bucket>\nSQLCL_PATH=<path-to-sqlcl>\nADB_WALLET_PATH=<path-to-wallet>\nTNS_ADMIN=<path-to-wallet-directory>"
      },
      {
        kind: "demo",
        fileName: "demo_script.md",
        title: "Demo script",
        content: `# ${workspaceName} Demo Script\n\n- ${playbookTitle} の目的と PoC flow を説明する\n- Knowledge source、SQL preview、Mermaid diagram、checklist を順番に確認する\n- owner、期限、fallback 方針を整理する`
      },
      {
        kind: "sql",
        fileName: "sql/setup_vector_search.sql",
        title: "AI Vector Search SQL",
        content: "-- AI Vector Search SQL template\nCREATE TABLE AI_LAUNCHPAD_CHUNKS (ID NUMBER, CHUNK_TEXT CLOB, VECTOR_EMBEDDING VECTOR);"
      },
      {
        kind: "python",
        fileName: "python/ingest_documents.py",
        title: "Document ingestion Python",
        content:
          "def main() -> None:\n    print(\"Prepare document ingestion, chunking, embedding, and DB insert steps.\")\n\n\nif __name__ == \"__main__\":\n    main()"
      },
      {
        kind: "terraform",
        fileName: "terraform/object_storage.tf",
        title: "Object Storage Terraform",
        content:
          "variable \"compartment_id\" {\n  type = string\n}\n\nresource \"oci_objectstorage_bucket\" \"poc_bucket\" {\n  compartment_id = var.compartment_id\n  name           = \"ai-launchpad-poc\"\n  access_type    = \"NoPublicAccess\"\n}"
      },
      {
        kind: "checklist",
        fileName: "checklist.md",
        title: "PoC validation checklist",
        content: `# ${workspaceName} PoC Checklist\n\n- [ ] Playbook の前提を確認する\n- [ ] SQL、Python、Terraform template をレビューする\n- [ ] secret、wallet、private key が含まれていないことを確認する`
      },
      {
        kind: "troubleshooting",
        fileName: "troubleshooting.md",
        title: "Troubleshooting guide",
        content: `# ${workspaceName} Troubleshooting Guide\n\n- Local Connector、OCI config、Object Storage、ADB wallet、SQLcl の状態を確認する\n- 実 DB 接続が未準備の場合は SQL preview と Mermaid diagram で demo flow を説明する\n- 失敗時は原因、owner、次回確認事項を follow-up email に追記する`
      },
      {
        kind: "handover",
        fileName: "handover.md",
        title: "Handover document",
        content: `# ${workspaceName} Handover Document\n\n## Included assets\n\n- README / proposal / follow-up email\n- Mermaid architecture diagram\n- SQL / Python / Terraform starter templates\n- .env.example / checklist / troubleshooting guide\n\n## Open items\n\n- [ ] compartment、IAM policy、network、ADB wallet の owner を確定する\n- [ ] PoC 成功条件、fallback、期限を顧客と合意する`
      }
    ]
  };
}

function formatPocAssetPackage(result: GeneratePocAssetsResult): string {
  return result.assets
    .map((asset) => [`# ${asset.fileName}`, "", asset.content].join("\n"))
    .join("\n\n---\n\n");
}

function createPocPackageFileName(workspaceName: string, generatedAt: string): string {
  const safeWorkspaceName =
    workspaceName
      .trim()
      .split("")
      .map((character) => (character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character) ? "-" : character))
      .join("")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "poc-package";
  const safeDate = generatedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);

  return `${safeWorkspaceName}-poc-package-${safeDate}.md`;
}

function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type LocalConnectorDiagnostic = {
  health: LocalConnectorHealth;
  ociConfig: OciCheckConfigResult;
  sqlcl: SqlclCheckResult;
  adbWallet: AdbWalletCheckResult;
  objectStorage: ObjectStorageCheckResult;
  checkedAt: string;
};

type BrowserOsRoute = "onboarding" | "workspace";

type BrowserOsPageTabTarget = {
  url: string;
  title?: string;
};

type BrowserOsAssistantPanelOpenTrigger = Exclude<BrowserAssistantPanelTrigger, "close">;

const browserOsAssistantModes: Array<{
  id: AgenticModeId;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "agent", label: "Assistant", icon: Headphones }
];

const browserOsAssistantModeIcons: Record<AgenticModeId, LucideIcon> = {
  chat: MessageSquare,
  agent: Headphones,
  workflow: Users,
  schedule: ClipboardList,
  memory: Database,
  mcp: DatabaseZap
};

export function AppShell(): ReactElement {
  const {
    currentTitle,
    currentUrl,
    selectedWorkspaceId,
    selectedPlaybookId,
    captures,
    knowledgeCaptureIds,
    summary,
    checklist,
    selectionExplanation,
    askPageAnswer,
    askPageSources,
    assistantMode,
    setUrl,
    setPageMetadata,
    setWorkspace,
    setPlaybook,
    summarizePage,
    extractChecklist,
    explainSelection,
    setAskPageAnswer,
    hydrateCaptures,
    addCapture,
    clearCaptures,
    addCaptureToKnowledge,
    addAllCapturesToKnowledge,
    removeCaptureFromKnowledge,
    knowledgeDocumentChunks,
    addKnowledgeDocumentChunks,
    removeKnowledgeDocument,
    oracleVectorSearchConfig,
    setOracleVectorSearchConfig,
    resetOracleVectorSearchConfig,
    clearKnowledge
  } = useLaunchpadStore();
  const browserSurfaceRef = useRef<BrowserSurfaceHandle>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const browserOsTopMenuRef = useRef<HTMLDivElement>(null);
  const [draftUrl, setDraftUrl] = useState(currentUrl);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [screenshotState, setScreenshotState] = useState<"idle" | "saving" | "saved">("idle");
  const [selectedCaptureId, setSelectedCaptureId] = useState<string>("");
  const [clipboardStatus, setClipboardStatus] = useState<string>("");
  const [knowledgeQuestion, setKnowledgeQuestion] = useState("");
  const [knowledgeAnswer, setKnowledgeAnswer] = useState("");
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSearchResult[]>([]);
  const [knowledgeAdapterStatus, setKnowledgeAdapterStatus] = useState("");
  const [knowledgeAskState, setKnowledgeAskState] = useState<"idle" | "asking">("idle");
  const [ragAdapterId, setRagAdapterId] = useState<RagAdapterId>("local-keyword");
  const [documentImportStatus, setDocumentImportStatus] = useState("");
  const [connectorCheckState, setConnectorCheckState] = useState<"idle" | "checking">("idle");
  const [connectorDiagnostic, setConnectorDiagnostic] = useState<LocalConnectorDiagnostic | null>(null);
  const [oracleVectorExecution, setOracleVectorExecution] = useState<OracleVectorSearchExecutionResult | null>(null);
  const [pocAssetState, setPocAssetState] = useState<"idle" | "generating">("idle");
  const [pocAssetResult, setPocAssetResult] = useState<GeneratePocAssetsResult | null>(null);
  const [selectedPocAssetKind, setSelectedPocAssetKind] = useState<GeneratedPocAsset["kind"]>("readme");
  const [browserState, setBrowserState] = useState<BrowserSurfaceState>({
    canGoBack: false,
    canGoForward: false,
    isLoading: false
  });
  const [browserOsRoute, setBrowserOsRoute] = useState<BrowserOsRoute>("onboarding");
  const [browserOsGlobalZoomFactor, setBrowserOsGlobalZoomFactor] = useState(defaultBrowserViewZoomFactor);
  const [agenticModeId, setAgenticModeId] = useState<AgenticModeId>("agent");
  const [browserOsRailCollapsed, setBrowserOsRailCollapsed] = useState(false);
  const [browserOsTabSearchOpen, setBrowserOsTabSearchOpen] = useState(false);
  const [browserOsTabSearchQuery, setBrowserOsTabSearchQuery] = useState("");
  const [browserOsClosedTabIds, setBrowserOsClosedTabIds] = useState<string[]>([]);
  const [browserOsActiveTabId, setBrowserOsActiveTabId] = useState("onboarding");
  const [browserOsLocalTabs, setBrowserOsLocalTabs] = useState<BrowserOsSideTab[]>([]);
  const [browserOsNextTabIndex, setBrowserOsNextTabIndex] = useState(1);
  const [browserOsAssistantPanel, setBrowserOsAssistantPanel] = useState(() =>
    createBrowserAssistantPanelState<AgenticModeId>("agent")
  );
  const [browserOsAssistantContext, setBrowserOsAssistantContext] = useState(() => createBrowserAssistantContextState());
  const [browserOsRailStatus, setBrowserOsRailStatus] = useState("");
  const [browserOsAssistantPrompt, setBrowserOsAssistantPrompt] = useState(
    "このページを観測して、次に取るべき action と保存すべき evidence を整理してください。"
  );

  const selectedWorkspace = mockWorkspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? mockWorkspaces[0];
  const selectedPlaybook = mockPlaybooks.find((playbook) => playbook.id === selectedPlaybookId) ?? mockPlaybooks[0];
  const selectedCapture = captures.find((capture) => capture.id === selectedCaptureId) ?? captures[0];
  const captureKnowledgeChunks = useMemo(
    () => createKnowledgeChunks(captures, knowledgeCaptureIds),
    [captures, knowledgeCaptureIds]
  );
  const knowledgeChunks = useMemo(
    () => [...knowledgeDocumentChunks, ...captureKnowledgeChunks],
    [captureKnowledgeChunks, knowledgeDocumentChunks]
  );
  const sourceType = detectSourceType(currentUrl);
  const activeAgenticMode = useMemo(
    () => agenticModes.find((mode) => mode.id === agenticModeId) ?? agenticModes[0],
    [agenticModeId]
  );
  const activeProviderLabel = "OCI Generative AI";
  const browserOsAssistantPanelVisible = shouldRenderBrowserAssistantPanel(browserOsAssistantPanel, browserOsRoute);
  const browserOsAssistantContextSummary = summarizeBrowserAssistantContext(browserOsAssistantContext.activeItem);
  const ActiveAgenticIcon = browserOsAssistantModeIcons[activeAgenticMode.id];
  const isBrowserOsOnboarding = browserOsRoute === "onboarding";
  const isBrowserOsInternalPage = isBrowserOsOnboarding;
  const displayedChromeUrl = isBrowserOsOnboarding ? "chrome://ai-launchpad/onboarding" : draftUrl;

  useEffect(() => {
    let canceled = false;

    async function loadLocalStore(): Promise<void> {
      if (!window.aiLaunchpad) {
        return;
      }

      try {
        const [storedCaptures, storedDocuments] = await Promise.all([
          window.aiLaunchpad.browserApi.listCaptures(),
          window.aiLaunchpad.documentIngestion.listTextDocuments()
        ]);

        if (canceled) {
          return;
        }

        hydrateCaptures(storedCaptures.captures);
        if (storedCaptures.captures.length > 0) {
          setSelectedCaptureId((current) => current || storedCaptures.captures[0].id);
        }

        const documentChunks = storedDocuments.documents.flatMap((entry) => entry.chunks);
        if (documentChunks.length > 0) {
          addKnowledgeDocumentChunks(documentChunks);
        }
      } catch {
        if (!canceled) {
          setDocumentImportStatus("ローカル保存データを読み込めませんでした。");
        }
      }
    }

    void loadLocalStore();
    return () => {
      canceled = true;
    };
  }, [addKnowledgeDocumentChunks, hydrateCaptures]);

  const currentContext = useMemo(
    () => ({
      workspace: selectedWorkspace.name,
      playbook: selectedPlaybook.title,
      source: sourceLabels[sourceType]
    }),
    [selectedPlaybook.title, selectedWorkspace.name, sourceType]
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

  const handleClearBrowserOsAssistantContext = useCallback(() => {
    setBrowserOsAssistantContext((current) => clearBrowserAssistantContext(current));
    setBrowserOsRailStatus("Assistant context を解除しました。");
  }, []);

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


  const handleSelectBrowserOsAssistantMode = useCallback((modeId: AgenticModeId) => {
    setAgenticModeId(modeId);
    setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, modeId, "toolbar"));
    setBrowserOsRailStatus(`${modeId} assistant panel を開きました。`);
  }, []);

  const handleCloseBrowserOsAssistantPanel = useCallback(() => {
    setBrowserOsAssistantPanel((current) => closeBrowserAssistantPanel(current));
    setBrowserOsRailStatus("Assistant side panel を閉じました。Toolbar の Chat / Council / Assistant から再表示できます。");
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
      workspaceId: selectedWorkspaceId,
      url: pageUrl,
      title: pageTitle,
      sourceType: pageSourceType,
      summary: summary || undefined
    };

    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.savePage(payload)
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspaceId,
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
          workspaceId: selectedWorkspaceId,
          url: pageUrl,
          title: pageTitle,
          sourceType: pageSourceType,
          screenshotDataUrl
        })
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspaceId,
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

  async function handleExplainSelection(): Promise<void> {
    const selectedText = await browserSurfaceRef.current?.getSelectedText();
    explainSelection(selectedText);
  }

  async function handleSaveSelection(): Promise<void> {
    const selectedText = await browserSurfaceRef.current?.getSelectedText();
    const trimmedText = selectedText?.trim();
    if (!trimmedText) {
      explainSelection("");
      return;
    }

    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const pageSourceType = detectSourceType(pageUrl);
    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.saveSelection({
          workspaceId: selectedWorkspaceId,
          url: pageUrl,
          title: pageTitle,
          sourceType: pageSourceType,
          selectedText: trimmedText
        })
      : createPreviewCaptureResult({
          workspaceId: selectedWorkspaceId,
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
    explainSelection(trimmedText);
  }

  async function handleAskPage(promptOverride?: string): Promise<void> {
    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const prompt =
      promptOverride?.trim() ||
      `${selectedPlaybook.title} の観点で、このページから PoC に使う前提条件、手順、注意点を整理してください。`;
    const result = window.aiLaunchpad
      ? await window.aiLaunchpad.browserApi.askPage({
          workspaceId: selectedWorkspaceId,
          url: pageUrl,
          title: pageTitle,
          prompt
        })
      : {
          answer: `${pageTitle} を ${selectedPlaybook.title} の観点で整理しました。現時点では renderer preview の mock 応答です。`,
          sources: [{ title: pageTitle, url: pageUrl }]
        };

    setAskPageAnswer(result.answer, result.sources);
  }

  function handleSubmitBrowserOsAssistantPrompt(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAgenticModeId("chat");
    void handleAskPage(formatBrowserAssistantContextPrompt(browserOsAssistantPrompt, browserOsAssistantContext.activeItem));
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

  async function handleAskKnowledge(): Promise<void> {
    setKnowledgeAskState("asking");
    try {
      const groundedAnswer = window.aiLaunchpad
        ? await window.aiLaunchpad.ragAdapter.askKnowledge({
            question: knowledgeQuestion,
            chunks: knowledgeChunks,
            maxResults: 3,
            adapter: ragAdapterId,
            oracleVectorSearch: oracleVectorSearchConfig
          })
        : answerKnowledgeQuestion(knowledgeQuestion, knowledgeChunks, 3, ragAdapterId, oracleVectorSearchConfig);

      setKnowledgeAnswer(groundedAnswer.answer);
      setKnowledgeSources(groundedAnswer.results);
      setOracleVectorExecution(groundedAnswer.oracleVectorSearch ?? null);
      const answerProviderLabel = groundedAnswer.answerProvider === "oci-genai" ? " / answer: OCI GenAI" : "";
      setKnowledgeAdapterStatus(
        groundedAnswer.latencyMs === undefined
          ? `Adapter: ${groundedAnswer.adapter} / ${groundedAnswer.adapterStatus ?? "ready"}${answerProviderLabel}`
          : `Adapter: ${groundedAnswer.adapter} / ${groundedAnswer.adapterStatus ?? "ready"} / ${groundedAnswer.latencyMs}ms${answerProviderLabel}`
      );
    } catch {
      setKnowledgeAnswer("RAG adapter の呼び出しに失敗しました。local adapter または IPC 設定を確認してください。");
      setKnowledgeSources([]);
      setOracleVectorExecution(null);
      setKnowledgeAdapterStatus("Adapter: unavailable");
    } finally {
      setKnowledgeAskState("idle");
    }
  }

  function createKnowledgeAnswerMarkdown(): string {
    return formatKnowledgeAnswerMarkdown({
      workspaceName: selectedWorkspace.name,
      playbookTitle: selectedPlaybook.title,
      question: knowledgeQuestion,
      answer: knowledgeAnswer,
      adapterStatus: knowledgeAdapterStatus,
      sources: knowledgeSources,
      oracleVectorExecution
    });
  }

  function handleCopyKnowledgeAnswer(): void {
    void copyToClipboard(createKnowledgeAnswerMarkdown(), "Grounded answer をコピーしました");
  }

  function handleDownloadKnowledgeAnswer(): void {
    const fileName = createKnowledgeAnswerFileName(selectedWorkspace.name, new Date().toISOString());

    downloadTextFile(fileName, createKnowledgeAnswerMarkdown());
    setClipboardStatus(`${fileName} を保存しました`);
  }

  function handleCopyOracleVectorSql(sqlPreview: string): void {
    void copyToClipboard(sqlPreview, "Oracle Vector SQL をコピーしました");
  }

  function handleDownloadOracleVectorSql(sqlPreview: string): void {
    const fileName = createOracleVectorSqlFileName(selectedWorkspace.name, new Date().toISOString());

    downloadTextFile(fileName, `${sqlPreview}\n`);
    setClipboardStatus(`${fileName} を保存しました`);
  }

  async function handleClearCaptures(): Promise<void> {
    if (window.aiLaunchpad) {
      await window.aiLaunchpad.browserApi.clearCaptures();
    }

    clearCaptures();
    setSelectedCaptureId("");
  }

  async function handleClearKnowledge(): Promise<void> {
    if (window.aiLaunchpad) {
      await window.aiLaunchpad.documentIngestion.clearTextDocuments();
    }

    clearKnowledge();
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
    setDocumentImportStatus("");
  }

  function handleRagAdapterChange(adapter: RagAdapterId): void {
    setRagAdapterId(adapter);
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
  }

  function handleOracleVectorConfigChange(patch: Partial<OracleVectorSearchConfig>): void {
    setOracleVectorSearchConfig(patch);
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
  }

  function handleResetOracleVectorConfig(): void {
    resetOracleVectorSearchConfig();
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
  }

  async function handleCheckLocalConnector(): Promise<void> {
    setConnectorCheckState("checking");
    try {
      const [health, ociConfig, sqlcl, adbWallet, objectStorage] = window.aiLaunchpad
        ? await Promise.all([
            window.aiLaunchpad.localConnector.health(),
            window.aiLaunchpad.localConnector.ociCheckConfig(),
            window.aiLaunchpad.localConnector.sqlclCheck(),
            window.aiLaunchpad.localConnector.adbWalletCheck(),
            window.aiLaunchpad.localConnector.objectStorageCheck()
          ])
        : await Promise.resolve([
            {
              status: "mock-ready",
              connector: "local-connector",
              mode: "not-connected",
              message: "renderer preview の mock connector です。"
            } satisfies LocalConnectorHealth,
            {
              status: "not-configured",
              message: "renderer preview では OCI config を読み取りません。"
            } satisfies OciCheckConfigResult,
            {
              status: "not-configured",
              message: "renderer preview では SQLcl を確認しません。"
            } satisfies SqlclCheckResult,
            {
              status: "not-configured",
              message: "renderer preview では ADB wallet を確認しません。"
            } satisfies AdbWalletCheckResult,
            {
              status: "not-configured",
              message: "renderer preview では Object Storage を確認しません。"
            } satisfies ObjectStorageCheckResult
          ] as const);

      setConnectorDiagnostic({
        health,
        ociConfig,
        sqlcl,
        adbWallet,
        objectStorage,
        checkedAt: new Date().toISOString()
      });
    } catch {
      setConnectorDiagnostic({
        health: {
          status: "unavailable",
          connector: "local-connector",
          mode: "error",
          message: "Local Connector health check に失敗しました。"
        },
        ociConfig: {
          status: "unavailable",
          message: "OCI config check に失敗しました。IPC または connector process を確認してください。"
        },
        sqlcl: {
          status: "unavailable",
          message: "SQLcl check に失敗しました。IPC または connector process を確認してください。"
        },
        adbWallet: {
          status: "unavailable",
          message: "ADB wallet check に失敗しました。IPC または connector process を確認してください。"
        },
        objectStorage: {
          status: "unavailable",
          message: "Object Storage check に失敗しました。IPC または connector process を確認してください。"
        },
        checkedAt: new Date().toISOString()
      });
    } finally {
      setConnectorCheckState("idle");
    }
  }

  async function handleGeneratePocAssets(): Promise<void> {
    setPocAssetState("generating");
    try {
      const result = window.aiLaunchpad
        ? await window.aiLaunchpad.localConnector.generatePocAssets({
            workspaceName: selectedWorkspace.name,
            playbookTitle: selectedPlaybook.title,
            useCase: selectedPlaybook.category,
            vectorTable: oracleVectorSearchConfig.tableName || undefined,
            objectStorageNamespace: connectorDiagnostic?.objectStorage.namespace,
            objectStorageBucket: connectorDiagnostic?.objectStorage.bucketName,
            ociRegion: connectorDiagnostic?.objectStorage.region,
            embeddingModel: oracleVectorSearchConfig.embeddingModel || undefined
          })
        : createPreviewPocAssetsResult(selectedWorkspace.name, selectedPlaybook.title);

      setPocAssetResult(result);
      setSelectedPocAssetKind(result.assets[0]?.kind ?? "readme");
    } finally {
      setPocAssetState("idle");
    }
  }

  function handleCopyPocAsset(asset: GeneratedPocAsset): void {
    void copyToClipboard(asset.content, `${asset.fileName} をコピーしました`);
  }

  function handleCopyPocPackage(result: GeneratePocAssetsResult): void {
    void copyToClipboard(formatPocAssetPackage(result), "PoC package をコピーしました");
  }

  function handleDownloadPocPackage(result: GeneratePocAssetsResult): void {
    const fileName = createPocPackageFileName(selectedWorkspace.name, result.generatedAt);

    downloadTextFile(fileName, formatPocAssetPackage(result));
    setClipboardStatus(`${fileName} を保存しました`);
  }

  function handleRemoveKnowledgeChunk(chunk: KnowledgeChunk): void {
    if (chunk.sourceKind === "document") {
      removeKnowledgeDocument(chunk.captureId);
    } else {
      removeCaptureFromKnowledge(chunk.captureId);
    }
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
  }

  function handleImportedDocumentResult(result: IngestTextDocumentResult | null): void {
    if (!result) {
      return;
    }

    if (!result.ok) {
      setDocumentImportStatus(result.message);
      return;
    }

    addKnowledgeDocumentChunks(result.chunks);
    setKnowledgeAnswer("");
    setKnowledgeSources([]);
    setOracleVectorExecution(null);
    setKnowledgeAdapterStatus("");
    setDocumentImportStatus(`${result.document.fileName} を Knowledge に追加しました。${result.chunks.length} chunks`);
  }

  async function handleImportDocument(): Promise<void> {
    if (window.aiLaunchpad) {
      handleImportedDocumentResult(await window.aiLaunchpad.documentIngestion.importTextDocument());
      return;
    }

    documentInputRef.current?.click();
  }

  async function handlePreviewDocumentSelected(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_TEXT_DOCUMENT_BYTES) {
      setDocumentImportStatus(`文書サイズが上限 ${Math.round(MAX_TEXT_DOCUMENT_BYTES / 1024)} KB を超えています。`);
      return;
    }

    const text = await file.text();
    handleImportedDocumentResult(
      ingestTextDocument({
        fileName: file.name,
        text,
        documentId: `document-${crypto.randomUUID()}`,
        importedAt: new Date().toISOString()
      })
    );
  }

  return (
    <div className="flex h-screen min-h-[720px] bg-white text-foreground">
      <input
        ref={documentInputRef}
        type="file"
        accept=".md,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={handlePreviewDocumentSelected}
      />
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

          {!isBrowserOsInternalPage ? (
            <div className="relative hidden shrink-0 xl:block">
              <label className="sr-only" htmlFor="workspace-selector">
                Workspace selector
              </label>
              <select
                id="workspace-selector"
                value={selectedWorkspaceId}
                onChange={(event) => setWorkspace(event.target.value)}
                className="h-7 w-[190px] cursor-pointer appearance-none rounded-full border border-[#e2e2e2] bg-white py-0 pl-3 pr-8 text-xs text-[#3f3f46] shadow-sm outline-none transition-colors duration-200 focus:border-[#f26a2e] focus:ring-2 focus:ring-orange-100"
              >
                {mockWorkspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
            </div>
          ) : null}

          <div ref={browserOsTopMenuRef} className="relative ml-1 flex shrink-0 items-center gap-1 text-xs font-medium text-[#5f6368]">
            <BrowserOsToolbarAction
              label="Chat"
              icon={MessageSquare}
              active={browserOsAssistantPanelVisible && agenticModeId === "chat"}
              onClick={() => handleSelectTopAgenticMode("chat")}
            />
            <BrowserOsToolbarAction
              label="Assistant"
              icon={Headphones}
              active={browserOsAssistantPanelVisible && agenticModeId === "agent"}
              onClick={() => handleSelectTopAgenticMode("agent")}
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
          <aside className="flex min-h-0 flex-col border-l border-[#d7d7d7] bg-[#fbfbfa]" aria-label="Assistant side panel">
            <div className="border-b border-[#e5e5e5] bg-[#f7f7f6] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                    <ActiveAgenticIcon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#171717]">Assistant</p>
                    <p className="truncate text-[11px] text-[#71717a]">{activeAgenticMode.label} / {currentContext.workspace}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-full border border-[#e6e6e6] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-normal text-[#f05a24]">
                    Local
                  </span>
                  <button
                    type="button"
                    aria-label="Assistant side panel を閉じる"
                    title="Assistant side panel を閉じる"
                    onClick={handleCloseBrowserOsAssistantPanel}
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1" role="tablist" aria-label="Assistant modes">
                {browserOsAssistantModes.map((mode) => {
                  const ModeIcon = mode.icon;
                  const active = agenticModeId === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-pressed={active}
                      onClick={() => handleSelectBrowserOsAssistantMode(mode.id)}
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                        active
                          ? "border-[#ffd8c7] bg-white text-[#f05a24] shadow-sm"
                          : "border-transparent text-[#5f6368] hover:bg-white/75"
                      )}
                    >
                      <ModeIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
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

              <form onSubmit={handleSubmitBrowserOsAssistantPrompt} className="mt-3 rounded-md border border-[#e5e5e5] bg-white p-3 shadow-sm">
                <label htmlFor="browseros-assistant-prompt" className="text-xs font-semibold text-[#52525b]">
                  Ask this page
                </label>
                <textarea
                  id="browseros-assistant-prompt"
                  value={browserOsAssistantPrompt}
                  onChange={(event) => setBrowserOsAssistantPrompt(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-md border border-[#e2e2e2] bg-[#fcfcfc] px-3 py-2 text-sm leading-6 text-[#171717] outline-none transition-colors duration-200 focus:border-[#f26a2e] focus:ring-2 focus:ring-orange-100"
                />
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] text-[#71717a]">
                  <span className="truncate rounded-md bg-[#f4f4f5] px-2 py-1">{currentContext.source}</span>
                  <span className="truncate rounded-md bg-[#f4f4f5] px-2 py-1">{captures.length} captures</span>
                  <span className="truncate rounded-md bg-[#f4f4f5] px-2 py-1">{knowledgeChunks.length} chunks</span>
                </div>
                <div className="mt-1.5 truncate rounded-md bg-[#fff7f2] px-2 py-1 text-[10px] font-semibold text-[#c2410c]">
                  Context: {browserOsAssistantContextSummary}
                </div>
                {browserOsAssistantContext.activeItem ? (
                  <BrowserOsAssistantContextCard
                    item={browserOsAssistantContext.activeItem}
                    onClear={handleClearBrowserOsAssistantContext}
                  />
                ) : null}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] leading-4 text-[#71717a]">ページ URL、title、workspace context、添付 context を preview に渡します。</p>
                  <Button type="submit" size="sm" className="shrink-0">
                    <MessageSquare aria-hidden="true" className="h-4 w-4" />
                    Run preview
                  </Button>
                </div>
              </form>

              <section className="mt-3 rounded-md border border-[#e5e5e5] bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">Current page</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <ContextRow label="Playbook" value={currentContext.playbook} />
                  <ContextRow label="Source" value={currentContext.source} />
                  <ContextRow label="Page" value={currentTitle} />
                </dl>
              </section>

              <section className="mt-4">
                <label htmlFor="playbook-selector" className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">
                  Playbook
                </label>
                <select
                  id="playbook-selector"
                  value={selectedPlaybookId}
                  onChange={(event) => setPlaybook(event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-md border border-[#e2e2e2] bg-white px-3 text-sm text-[#171717] outline-none transition-colors duration-200 focus:border-[#f26a2e] focus:ring-2 focus:ring-orange-100"
                >
                  {mockPlaybooks.map((playbook) => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.title}
                    </option>
                  ))}
                </select>
              </section>

              <section className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => void handleAskPage()}>
                  <Bot aria-hidden="true" className="h-4 w-4" />
                  質問
                </Button>
                <Button variant="outline" onClick={summarizePage}>
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  要約
                </Button>
                <Button variant="outline" onClick={extractChecklist}>
                  <CheckSquare aria-hidden="true" className="h-4 w-4" />
                  手順化
                </Button>
                <Button variant="outline" onClick={handleExplainSelection}>
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  説明
                </Button>
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

              <AssistantOutput
                mode={assistantMode}
                summary={summary}
                checklist={checklist}
                explanation={selectionExplanation}
                askPageAnswer={askPageAnswer}
                askPageSources={askPageSources}
              />

              <section className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Demo Cockpit</h2>
                  <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800">{selectedPlaybook.category}</span>
                </div>
                <ol className="space-y-2">
                  {selectedPlaybook.demoSteps.map((step, index) => (
                    <li key={step} className="flex gap-3 rounded-md border border-border bg-white p-3 text-sm text-slate-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <span className="leading-5">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Captures</h2>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <DatabaseZap aria-hidden="true" className="h-3.5 w-3.5 text-sky-700" />
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
                  isInKnowledge={knowledgeCaptureIds.includes(selectedCapture.id)}
                  onAddToKnowledge={() => addCaptureToKnowledge(selectedCapture.id)}
                  onCopy={() => handleCopyCapture(selectedCapture)}
                  onExportMarkdown={() => handleExportCaptureMarkdown(selectedCapture)}
                />
              ) : null}

              <KnowledgePanel
                captureCount={captures.length}
                chunks={knowledgeChunks}
                question={knowledgeQuestion}
                answer={knowledgeAnswer}
                sources={knowledgeSources}
                oracleVectorExecution={oracleVectorExecution}
                adapterStatus={knowledgeAdapterStatus}
                isAnswering={knowledgeAskState === "asking"}
                adapterId={ragAdapterId}
                oracleVectorSearchConfig={oracleVectorSearchConfig}
                connectorDiagnostic={connectorDiagnostic}
                isCheckingConnector={connectorCheckState === "checking"}
                documentImportStatus={documentImportStatus}
                onAdapterChange={handleRagAdapterChange}
                onOracleVectorConfigChange={handleOracleVectorConfigChange}
                onResetOracleVectorConfig={handleResetOracleVectorConfig}
                onCheckConnector={handleCheckLocalConnector}
                onQuestionChange={setKnowledgeQuestion}
                onAddAll={addAllCapturesToKnowledge}
                onClear={handleClearKnowledge}
                onRemove={handleRemoveKnowledgeChunk}
                onImportDocument={handleImportDocument}
                onAsk={handleAskKnowledge}
                onCopyAnswer={handleCopyKnowledgeAnswer}
                onDownloadAnswer={handleDownloadKnowledgeAnswer}
                onCopyOracleVectorSql={handleCopyOracleVectorSql}
                onDownloadOracleVectorSql={handleDownloadOracleVectorSql}
              />

              <PocAssetsPanel
                result={pocAssetResult}
                selectedKind={selectedPocAssetKind}
                isGenerating={pocAssetState === "generating"}
                onGenerate={handleGeneratePocAssets}
                onSelectAsset={setSelectedPocAssetKind}
                onCopyAsset={handleCopyPocAsset}
                onCopyPackage={handleCopyPocPackage}
                onDownloadPackage={handleDownloadPocPackage}
              />
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
      { id: "council", label: "Council", icon: BrainCircuit, agenticMode: "workflow", accent: "orange" },
      { id: "assistant", label: "Assistant", icon: Headphones, route: "workspace", agenticMode: "agent", accent: "orange" }
    ]
  },
  {
    id: "recent",
    tabs: [
      {
        id: "models",
        label: "Models - OCI GenAI",
        icon: DatabaseZap,
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
      },
      { id: "run-log", label: "Run history preview", icon: ClipboardList, agenticMode: "schedule", accent: "blue" }
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

function BrowserOsAssistantContextCard({
  item,
  onClear
}: {
  item: BrowserAssistantContextItem;
  onClear: () => void;
}): ReactElement {
  return (
    <div className="mt-2 rounded-md border border-[#fed7aa] bg-[#fff7ed] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#c2410c]">Attached browser context</p>
          <p className="mt-1 truncate text-xs font-semibold text-[#171717]">{item.title}</p>
        </div>
        <button
          type="button"
          aria-label="Assistant context を解除"
          onClick={onClear}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#9a3412] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-[#9a3412]">
        <span className="rounded-full bg-white px-2 py-1">{getBrowserAssistantContextSourceLabel(item.source)}</span>
        {item.query ? <span className="rounded-full bg-white px-2 py-1">query: {item.query}</span> : null}
      </div>
      <p className="mt-2 break-all text-[11px] leading-4 text-[#9a3412]">{item.url}</p>
      {item.matches.length > 0 ? (
        <div className="mt-2 space-y-1">
          {item.matches.slice(0, 3).map((match) => (
            <div key={`${match.label}-${match.detail}`} className="rounded-md bg-white/80 px-2 py-1.5">
              <p className="truncate text-[11px] font-semibold text-[#7c2d12]">{match.label}</p>
              <p className="line-clamp-2 text-[11px] leading-4 text-[#9a3412]">{match.detail}</p>
            </div>
          ))}
        </div>
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
      detail: "Oracle Docs、OCI Console、LiveLabs、GitHub sample を開きながら、要約・手順抽出・capture を行います。"
    },
    {
      icon: Database,
      title: "Oracle AI Vector Search / RAG",
      detail: "capture と文書を Knowledge にまとめ、Local keyword と Oracle Vector Search adapter で grounded answer を確認します。"
    },
    {
      icon: ClipboardList,
      title: "PoC Package Generator",
      detail: "workspace / playbook / connector 設定から README、SQL、Python、Terraform、proposal、follow-up email を生成します。"
    },
    {
      icon: ShieldCheck,
      title: "Local Connector Readiness",
      detail: "OCI config、SQLcl、ADB wallet、Object Storage の readiness を確認します。secret は LLM / UI に渡しません。"
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
          Oracle AI Database、OCI Generative AI、Object Storage、SQLcl を中心に、顧客需求分析から demo / PoC 準備までを支援する
          browser client です。Oracle 製品の理解と PoC を加速し、OCI 活用提案を後押しします。
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

function CaptureDetail({
  capture,
  workspaceName,
  clipboardStatus,
  isInKnowledge,
  onAddToKnowledge,
  onCopy,
  onExportMarkdown
}: {
  capture: CapturedPage;
  workspaceName: string;
  clipboardStatus: string;
  isInKnowledge: boolean;
  onAddToKnowledge: () => void;
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

      <Button variant="outline" onClick={onAddToKnowledge} disabled={isInKnowledge} className="mt-4 w-full">
        <ListPlus aria-hidden="true" className="h-4 w-4" />
        {isInKnowledge ? "Knowledge に追加済み" : "Knowledge へ追加"}
      </Button>

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

function KnowledgePanel({
  captureCount,
  chunks,
  question,
  answer,
  sources,
  oracleVectorExecution,
  adapterStatus,
  isAnswering,
  adapterId,
  oracleVectorSearchConfig,
  connectorDiagnostic,
  isCheckingConnector,
  documentImportStatus,
  onAdapterChange,
  onOracleVectorConfigChange,
  onResetOracleVectorConfig,
  onCheckConnector,
  onQuestionChange,
  onAddAll,
  onClear,
  onRemove,
  onImportDocument,
  onAsk,
  onCopyAnswer,
  onDownloadAnswer,
  onCopyOracleVectorSql,
  onDownloadOracleVectorSql
}: {
  captureCount: number;
  chunks: KnowledgeChunk[];
  question: string;
  answer: string;
  sources: KnowledgeSearchResult[];
  oracleVectorExecution: OracleVectorSearchExecutionResult | null;
  adapterStatus: string;
  isAnswering: boolean;
  adapterId: RagAdapterId;
  oracleVectorSearchConfig: OracleVectorSearchConfig;
  connectorDiagnostic: LocalConnectorDiagnostic | null;
  isCheckingConnector: boolean;
  documentImportStatus: string;
  onAdapterChange: (adapter: RagAdapterId) => void;
  onOracleVectorConfigChange: (patch: Partial<OracleVectorSearchConfig>) => void;
  onResetOracleVectorConfig: () => void;
  onCheckConnector: () => void;
  onQuestionChange: (value: string) => void;
  onAddAll: () => void;
  onClear: () => void;
  onRemove: (chunk: KnowledgeChunk) => void;
  onImportDocument: () => void;
  onAsk: () => void;
  onCopyAnswer: () => void;
  onDownloadAnswer: () => void;
  onCopyOracleVectorSql: (sqlPreview: string) => void;
  onDownloadOracleVectorSql: (sqlPreview: string) => void;
}): ReactElement {
  return (
    <section className="mt-5 rounded-md border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Knowledge</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">RAG Workspace</h2>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{chunks.length} chunks</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={onImportDocument}>
          <Upload aria-hidden="true" className="h-4 w-4" />
          文書追加
        </Button>
        <Button variant="outline" size="sm" onClick={onAddAll} disabled={captureCount === 0}>
          <ListPlus aria-hidden="true" className="h-4 w-4" />
          全件追加
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={chunks.length === 0}>
          クリア
        </Button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adapter</p>
        <div className="mt-2 grid grid-cols-2 rounded-md border border-border bg-slate-50 p-1" role="group" aria-label="RAG adapter">
          <button
            type="button"
            onClick={() => onAdapterChange("local-keyword")}
            className={cn(
              "cursor-pointer rounded px-3 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
              adapterId === "local-keyword" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white"
            )}
          >
            Local
          </button>
          <button
            type="button"
            onClick={() => onAdapterChange("oracle-vector-search")}
            className={cn(
              "cursor-pointer rounded px-3 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
              adapterId === "oracle-vector-search" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white"
            )}
          >
            Oracle Vector
          </button>
        </div>
        {adapterId === "oracle-vector-search" ? (
          <OracleVectorConfigPanel
            config={oracleVectorSearchConfig}
            connectorDiagnostic={connectorDiagnostic}
            isCheckingConnector={isCheckingConnector}
            onChange={onOracleVectorConfigChange}
            onReset={onResetOracleVectorConfig}
            onCheckConnector={onCheckConnector}
          />
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {chunks.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm leading-6 text-slate-500">
            captures を追加すると、RAG 用 chunk preview がここに表示されます。
          </p>
        ) : (
          chunks.map((chunk, index) => (
            <div key={chunk.id} className="rounded-md border border-border bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sky-800">Chunk {index + 1}</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-950">{chunk.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(chunk)}
                  className="shrink-0 cursor-pointer rounded-md p-1 text-slate-500 transition-colors duration-200 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700"
                  aria-label="Knowledge から削除"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{chunk.text}</p>
              <p className="mt-2 truncate text-xs text-slate-500">{chunk.sourceUrl}</p>
            </div>
          ))
        )}
      </div>

      {documentImportStatus ? <p className="mt-3 text-xs font-medium text-sky-700">{documentImportStatus}</p> : null}

      <div className="mt-4">
        <label htmlFor="knowledge-question" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ask Knowledge
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="knowledge-question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="PoC に使う要点を整理してください"
          />
          <Button variant="secondary" onClick={onAsk} disabled={chunks.length === 0 || isAnswering}>
            <BrainCircuit aria-hidden="true" className="h-4 w-4" />
            {isAnswering ? "検索中" : "Ask"}
          </Button>
        </div>
      </div>

      {answer ? (
        <div className="mt-4 rounded-md border border-border bg-slate-50 p-3" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grounded Answer</p>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              {adapterStatus ? <span className="min-w-0 break-all text-[11px] font-medium text-slate-500">{adapterStatus}</span> : null}
              <Button variant="ghost" size="sm" onClick={onCopyAnswer} className="h-7 px-2">
                <Copy aria-hidden="true" className="h-4 w-4" />
                コピー
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadAnswer}
                className="h-7 px-2"
                aria-label="Grounded answer を Markdown で保存"
                title="Grounded answer を Markdown で保存"
              >
                <FileDown aria-hidden="true" className="h-4 w-4" />
                保存
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{answer}</p>
          {oracleVectorExecution ? (
            <OracleVectorExecutionPreview
              execution={oracleVectorExecution}
              onCopySql={onCopyOracleVectorSql}
              onDownloadSql={onDownloadOracleVectorSql}
            />
          ) : null}
          {sources.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
              <ul className="mt-2 space-y-2">
                {sources.map((source) => (
                  <li key={source.chunk.id} className="rounded-md border border-border bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-xs font-semibold text-slate-950">{source.chunk.title}</p>
                      <span className="shrink-0 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                        score {source.score}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{source.excerpt}</p>
                    {source.matchedTerms.length > 0 ? (
                      <p className="mt-2 truncate text-[11px] text-slate-500">matched: {source.matchedTerms.join(", ")}</p>
                    ) : null}
                    <p className="mt-1 truncate text-[11px] text-slate-500">{source.chunk.sourceUrl}</p>
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

function PocAssetsPanel({
  result,
  selectedKind,
  isGenerating,
  onGenerate,
  onSelectAsset,
  onCopyAsset,
  onCopyPackage,
  onDownloadPackage
}: {
  result: GeneratePocAssetsResult | null;
  selectedKind: GeneratedPocAsset["kind"];
  isGenerating: boolean;
  onGenerate: () => void;
  onSelectAsset: (kind: GeneratedPocAsset["kind"]) => void;
  onCopyAsset: (asset: GeneratedPocAsset) => void;
  onCopyPackage: (result: GeneratePocAssetsResult) => void;
  onDownloadPackage: (result: GeneratePocAssetsResult) => void;
}): ReactElement {
  const assetKindLabels: Record<GeneratedPocAsset["kind"], string> = {
    readme: "README",
    sql: "SQL",
    python: "Python",
    terraform: "Terraform",
    checklist: "Checklist",
    proposal: "Proposal",
    email: "Email",
    diagram: "Diagram",
    env: "Env",
    demo: "Demo",
    troubleshooting: "Troubleshooting",
    handover: "Handover"
  };
  const selectedAsset = result?.assets.find((asset) => asset.kind === selectedKind) ?? result?.assets[0] ?? null;

  return (
    <section className="mt-5 rounded-md border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PoC Assets</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">Template Package</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onGenerate} disabled={isGenerating}>
          <FileDown aria-hidden="true" className="h-4 w-4" />
          {isGenerating ? "生成中" : "生成"}
        </Button>
      </div>

      {!result ? (
        <p className="mt-4 rounded-md border border-dashed border-border p-4 text-sm leading-6 text-slate-500">
          現在の workspace、playbook、connector 設定から PoC package の starter template を生成できます。
        </p>
      ) : (
        <div className="mt-4">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
            <div className="min-w-0">
              <p className="text-sm leading-6 text-slate-700">{result.message}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Generated {formatCheckedAt(result.generatedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                {result.assets.length} files
              </span>
              <Button variant="ghost" size="sm" onClick={() => onCopyPackage(result)} className="h-7 px-2">
                <ClipboardList aria-hidden="true" className="h-4 w-4" />
                一括コピー
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadPackage(result)}
                className="h-7 px-2"
                aria-label="PoC package を Markdown で保存"
                title="Markdown bundle として保存"
              >
                <FileDown aria-hidden="true" className="h-4 w-4" />
                保存
              </Button>
            </div>
          </div>

          {result.warnings.length > 0 ? (
            <ul className="mt-3 space-y-1 border-l-2 border-amber-300 pl-3">
              {result.warnings.map((warning) => (
                <li key={warning} className="text-xs leading-5 text-amber-800">
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="PoC asset templates">
            {result.assets.map((asset) => (
              <button
                key={`${asset.kind}-${asset.fileName}`}
                type="button"
                onClick={() => onSelectAsset(asset.kind)}
                className={cn(
                  "h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                  selectedAsset?.kind === asset.kind
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-border bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                {assetKindLabels[asset.kind]}
              </button>
            ))}
          </div>

          {selectedAsset ? (
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{selectedAsset.title}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{selectedAsset.fileName}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onCopyAsset(selectedAsset)}>
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  コピー
                </Button>
              </div>
              <pre className="mt-3 max-h-72 min-h-[180px] overflow-auto rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">
                <code>{selectedAsset.content}</code>
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function OracleVectorExecutionPreview({
  execution,
  onCopySql,
  onDownloadSql
}: {
  execution: OracleVectorSearchExecutionResult;
  onCopySql: (sqlPreview: string) => void;
  onDownloadSql: (sqlPreview: string) => void;
}): ReactElement {
  if (!execution.plan) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Oracle Vector Plan</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">{execution.validationErrors?.join(" ") ?? execution.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Oracle Vector Plan</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-[11px] font-medium text-slate-500">{execution.status}</span>
          <Button variant="ghost" size="sm" onClick={() => onCopySql(execution.plan?.sqlPreview ?? "")} className="h-7 px-2">
            <Copy aria-hidden="true" className="h-4 w-4" />
            SQL
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownloadSql(execution.plan?.sqlPreview ?? "")}
            className="h-7 px-2"
            aria-label="Oracle Vector SQL を保存"
            title="Oracle Vector SQL を保存"
          >
            <FileDown aria-hidden="true" className="h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs leading-5 text-slate-600">
        <CompactPlanRow label="Connection" value={execution.plan.connectionName} />
        <CompactPlanRow label="Top K" value={String(execution.plan.topK)} />
        <CompactPlanRow label="Table" value={execution.plan.tableName} />
        <CompactPlanRow label="Embedding" value={execution.plan.embeddingModel} />
      </dl>
      <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-white p-3 text-[11px] leading-5 text-slate-700">
        <code>{execution.plan.sqlPreview}</code>
      </pre>
      {execution.rows && execution.rows.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vector Search Results ({execution.rows.length})
          </p>
          <ul className="mt-2 space-y-2">
            {execution.rows.map((row, index) => (
              <li key={`${index}-${row.chunkText.slice(0, 16)}`} className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[11px] font-semibold text-emerald-800">
                    #{index + 1}
                    {row.title ? ` ${row.title}` : ""}
                  </span>
                  {typeof row.distance === "number" ? (
                    <span className="shrink-0 text-[11px] font-medium text-emerald-700">distance {row.distance.toFixed(4)}</span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-700">{row.chunkText}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CompactPlanRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function OracleVectorConfigPanel({
  config,
  connectorDiagnostic,
  isCheckingConnector,
  onChange,
  onReset,
  onCheckConnector
}: {
  config: OracleVectorSearchConfig;
  connectorDiagnostic: LocalConnectorDiagnostic | null;
  isCheckingConnector: boolean;
  onChange: (patch: Partial<OracleVectorSearchConfig>) => void;
  onReset: () => void;
  onCheckConnector: () => void;
}): ReactElement {
  const statusLabel = config.configured ? "設定済み" : "未設定";

  return (
    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-amber-900">Oracle Vector Search</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            skeleton config only. 実 DB 呼び出しはまだ実装していません。
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-amber-800">{statusLabel}</span>
      </div>

      <div className="mt-3 space-y-2">
        <OracleConfigField
          id="oracle-connection-name"
          label="Connection"
          value={config.connectionName ?? ""}
          placeholder="adb-sales-demo"
          onChange={(value) => onChange({ connectionName: value })}
        />
        <OracleConfigField
          id="oracle-table-name"
          label="Table"
          value={config.tableName ?? ""}
          placeholder="AI_LAUNCHPAD_CHUNKS"
          onChange={(value) => onChange({ tableName: value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <OracleConfigField
            id="oracle-vector-column"
            label="Vector column"
            value={config.vectorColumn ?? ""}
            placeholder="VECTOR_EMBEDDING"
            onChange={(value) => onChange({ vectorColumn: value })}
          />
          <OracleConfigField
            id="oracle-text-column"
            label="Text column"
            value={config.textColumn ?? ""}
            placeholder="CHUNK_TEXT"
            onChange={(value) => onChange({ textColumn: value })}
          />
        </div>
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <OracleConfigField
            id="oracle-embedding-model"
            label="Embedding model"
            value={config.embeddingModel ?? ""}
            placeholder="cohere.embed-multilingual-v3.0"
            onChange={(value) => onChange({ embeddingModel: value })}
          />
          <div>
            <label htmlFor="oracle-top-k" className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
              Top K
            </label>
            <Input
              id="oracle-top-k"
              type="number"
              min={1}
              max={20}
              value={String(config.topK ?? 3)}
              onChange={(event) => onChange({ topK: Number(event.target.value) || 3 })}
              className="mt-1 bg-white"
            />
          </div>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="mt-3 w-full bg-white/60">
        設定をリセット
      </Button>

      <Button variant="outline" size="sm" onClick={onCheckConnector} disabled={isCheckingConnector} className="mt-2 w-full bg-white">
        <DatabaseZap aria-hidden="true" className="h-4 w-4" />
        {isCheckingConnector ? "確認中" : "Connector を確認"}
      </Button>

      {connectorDiagnostic ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-amber-900">Local Connector</p>
            <span className="text-[11px] font-medium text-amber-800">{formatCheckedAt(connectorDiagnostic.checkedAt)}</span>
          </div>
          <dl className="mt-2 space-y-1 text-xs leading-5 text-amber-900">
            <ConnectorDiagnosticRow label="Health" value={`${connectorDiagnostic.health.status} / ${connectorDiagnostic.health.mode}`} />
            <ConnectorDiagnosticRow label="OCI config" value={connectorDiagnostic.ociConfig.status} />
            <ConnectorDiagnosticRow label="SQLcl" value={connectorDiagnostic.sqlcl.status} />
            <ConnectorDiagnosticRow label="ADB wallet" value={connectorDiagnostic.adbWallet.status} />
            <ConnectorDiagnosticRow label="Object Storage" value={connectorDiagnostic.objectStorage.status} />
            {connectorDiagnostic.ociConfig.profile ? (
              <ConnectorDiagnosticRow label="Profile" value={connectorDiagnostic.ociConfig.profile} />
            ) : null}
          </dl>
          {connectorDiagnostic.health.message ? (
            <p className="mt-2 text-xs leading-5 text-amber-800">{connectorDiagnostic.health.message}</p>
          ) : null}
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.ociConfig.message}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.sqlcl.message}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.adbWallet.message}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.objectStorage.message}</p>
          {connectorDiagnostic.ociConfig.configPath ? (
            <p className="mt-2 break-all text-[11px] leading-5 text-amber-700">config: {connectorDiagnostic.ociConfig.configPath}</p>
          ) : null}
          {connectorDiagnostic.ociConfig.keyFilePath ? (
            <p className="mt-1 break-all text-[11px] leading-5 text-amber-700">key: {connectorDiagnostic.ociConfig.keyFilePath}</p>
          ) : null}
          {connectorDiagnostic.sqlcl.executablePath ? (
            <p className="mt-1 break-all text-[11px] leading-5 text-amber-700">sqlcl: {connectorDiagnostic.sqlcl.executablePath}</p>
          ) : null}
          {connectorDiagnostic.adbWallet.walletPath ? (
            <p className="mt-1 break-all text-[11px] leading-5 text-amber-700">wallet: {connectorDiagnostic.adbWallet.walletPath}</p>
          ) : null}
          {connectorDiagnostic.ociConfig.checks?.length ? (
            <ul className="mt-2 space-y-1">
              {connectorDiagnostic.ociConfig.checks.map((check) => (
                <li key={check.name} className="flex gap-2 text-[11px] leading-5 text-amber-800">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                  <span className="min-w-0">{check.message}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-amber-800">Local Connector health と OCI config の接続状態をここで確認できます。</p>
      )}
    </div>
  );
}

function OracleConfigField({
  id,
  label,
  value,
  placeholder,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}): ReactElement {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 bg-white"
      />
    </div>
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

function ConnectorDiagnosticRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-2">
      <dt className="text-amber-700">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-amber-950">{value}</dd>
    </div>
  );
}

function formatCheckedAt(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function AssistantOutput({
  mode,
  summary,
  checklist,
  explanation,
  askPageAnswer,
  askPageSources
}: {
  mode: "idle" | "summary" | "checklist" | "selection" | "ask";
  summary: string;
  checklist: string[];
  explanation: string;
  askPageAnswer: string;
  askPageSources: Array<{ title: string; url: string }>;
}): ReactElement {
  if (mode === "idle") {
    return (
      <section className="mt-5 rounded-md border border-dashed border-border p-4">
        <p className="text-sm leading-6 text-slate-500">
          ページ要約、手順化、選択テキスト説明、workspace 保存をここから実行できます。
        </p>
      </section>
    );
  }

  if (mode === "checklist") {
    return (
      <section className="mt-5 rounded-md border border-border bg-white p-4">
        <h2 className="text-sm font-semibold">抽出 checklist</h2>
        <ol className="mt-3 space-y-2">
          {checklist.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (mode === "ask") {
    return (
      <section className="mt-5 rounded-md border border-border bg-white p-4">
        <h2 className="text-sm font-semibold">ページ回答</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">{askPageAnswer}</p>
        {askPageSources.length > 0 ? (
          <div className="mt-4 rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
            <ul className="mt-2 space-y-1">
              {askPageSources.map((source) => (
                <li key={`${source.title}-${source.url}`} className="truncate text-xs text-slate-600">
                  {source.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-md border border-border bg-white p-4">
      <h2 className="text-sm font-semibold">{mode === "summary" ? "ページ要約" : "選択テキスト説明"}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{mode === "summary" ? summary : explanation}</p>
    </section>
  );
}
