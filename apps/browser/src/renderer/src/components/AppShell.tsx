import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  CheckSquare,
  ClipboardList,
  Copy,
  Database,
  DatabaseZap,
  FileDown,
  FileText,
  Globe2,
  ListPlus,
  LayoutDashboard,
  Play,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  TextSelect,
  Upload,
  X,
  type LucideIcon
} from "lucide-react";
import { type ChangeEvent, type FormEvent, type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserSurface, type BrowserSurfaceHandle, type BrowserSurfaceState } from "@renderer/components/BrowserSurface";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import { type CapturedPage, detectSourceType, mockPlaybooks, mockWorkspaces } from "@renderer/data/mockData";
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
import type { LocalConnectorHealth, OciCheckConfigResult, OracleVectorSearchExecutionResult, SqlclCheckResult } from "../../../shared/api";
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

type LocalConnectorDiagnostic = {
  health: LocalConnectorHealth;
  ociConfig: OciCheckConfigResult;
  sqlcl: SqlclCheckResult;
  checkedAt: string;
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
  const [browserState, setBrowserState] = useState<BrowserSurfaceState>({
    canGoBack: false,
    canGoForward: false,
    isLoading: false
  });

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

  function handleNavigate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedUrl = draftUrl.startsWith("http") ? draftUrl : `https://${draftUrl}`;
    setDraftUrl(normalizedUrl);
    setUrl(normalizedUrl);
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

  async function handleAskPage(): Promise<void> {
    const metadata = await browserSurfaceRef.current?.getPageMetadata();
    const pageUrl = metadata?.url || currentUrl;
    const pageTitle = metadata?.title || currentTitle;
    const prompt = `${selectedPlaybook.title} の観点で、このページから PoC に使う前提条件、手順、注意点を整理してください。`;
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
      setKnowledgeAdapterStatus(
        groundedAnswer.latencyMs === undefined
          ? `Adapter: ${groundedAnswer.adapter} / ${groundedAnswer.adapterStatus ?? "ready"}`
          : `Adapter: ${groundedAnswer.adapter} / ${groundedAnswer.adapterStatus ?? "ready"} / ${groundedAnswer.latencyMs}ms`
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
      const [health, ociConfig, sqlcl] = window.aiLaunchpad
        ? await Promise.all([
            window.aiLaunchpad.localConnector.health(),
            window.aiLaunchpad.localConnector.ociCheckConfig(),
            window.aiLaunchpad.localConnector.sqlclCheck()
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
            } satisfies SqlclCheckResult
          ] as const);

      setConnectorDiagnostic({
        health,
        ociConfig,
        sqlcl,
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
        checkedAt: new Date().toISOString()
      });
    } finally {
      setConnectorCheckState("idle");
    }
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
    <div className="flex h-screen min-h-[720px] bg-background text-foreground">
      <input
        ref={documentInputRef}
        type="file"
        accept=".md,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={handlePreviewDocumentSelected}
      />
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-5">AI Launchpad</p>
              <p className="text-xs text-slate-500">for Oracle Browser</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4" aria-label="主要ナビゲーション">
          <SidebarItem icon={LayoutDashboard} active label="Workspaces" />
          <SidebarItem icon={BookOpen} label="Playbooks" />
          <SidebarItem icon={Play} label="Demo Cockpit" />
          <SidebarItem icon={Camera} label="Captures" />
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
          <div className="space-y-2">
            {mockWorkspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => setWorkspace(workspace.id)}
                className={cn(
                  "w-full cursor-pointer rounded-md border p-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
                  workspace.id === selectedWorkspaceId
                    ? "border-sky-700 bg-sky-50"
                    : "border-transparent hover:border-border hover:bg-slate-50"
                )}
              >
                <p className="text-sm font-medium text-slate-950">{workspace.name}</p>
                <p className="mt-1 text-xs text-slate-500">{workspace.customerName}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-border px-5 py-4">
          <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
            <p className="text-xs leading-5 text-slate-600">この MVP は mock mode です。OCI secret と wallet は読み取りません。</p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="戻る"
              disabled={!browserState.canGoBack}
              onClick={() => browserSurfaceRef.current?.goBack()}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="進む"
              disabled={!browserState.canGoForward}
              onClick={() => browserSurfaceRef.current?.goForward()}
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="再読み込み" onClick={() => browserSurfaceRef.current?.reload()}>
              <RefreshCw aria-hidden="true" className={cn("h-4 w-4", browserState.isLoading && "animate-spin")} />
            </Button>
          </div>

          <form onSubmit={handleNavigate} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Globe2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="URL"
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search aria-hidden="true" className="h-4 w-4" />
              開く
            </Button>
          </form>

          <label className="sr-only" htmlFor="workspace-selector">
            Workspace selector
          </label>
          <select
            id="workspace-selector"
            value={selectedWorkspaceId}
            onChange={(event) => setWorkspace(event.target.value)}
            className="h-10 w-[220px] cursor-pointer rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
          >
            {mockWorkspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(520px,1fr)_380px]">
          <section className="min-w-0 overflow-auto p-5">
            <div className="mb-4 grid grid-cols-3 gap-3">
              <MetricCard icon={BriefcaseBusiness} label="Workspace" value={selectedWorkspace.stage} />
              <MetricCard icon={Database} label="Source" value={currentContext.source} />
              <MetricCard icon={ClipboardList} label="Captures" value={`${captures.length} 件`} />
            </div>

            <BrowserSurface
              ref={browserSurfaceRef}
              currentTitle={currentTitle}
              currentUrl={currentUrl}
              sourceType={sourceType}
              onPageMetadataChange={handlePageMetadataChange}
              onNavigationStateChange={handleNavigationStateChange}
            />
          </section>

          <aside className="flex min-h-0 flex-col border-l border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">AI Sidebar</p>
                  <p className="text-xs text-slate-500">{currentContext.workspace}</p>
                </div>
                <Bot aria-hidden="true" className="h-5 w-5 text-sky-700" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
              <section className="rounded-md border border-border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Context</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <ContextRow label="Playbook" value={currentContext.playbook} />
                  <ContextRow label="Source" value={currentContext.source} />
                  <ContextRow label="Page" value={currentTitle} />
                </dl>
              </section>

              <section className="mt-4">
                <label htmlFor="playbook-selector" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Playbook
                </label>
                <select
                  id="playbook-selector"
                  value={selectedPlaybookId}
                  onChange={(event) => setPlaybook(event.target.value)}
                  className="mt-2 h-10 w-full cursor-pointer rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                >
                  {mockPlaybooks.map((playbook) => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.title}
                    </option>
                  ))}
                </select>
              </section>

              <section className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleAskPage}>
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
              />
            </div>
          </aside>
        </div>
      </main>
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
  onAsk
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grounded Answer</p>
            {adapterStatus ? <span className="shrink-0 text-[11px] font-medium text-slate-500">{adapterStatus}</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{answer}</p>
          {oracleVectorExecution ? <OracleVectorExecutionPreview execution={oracleVectorExecution} /> : null}
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

function OracleVectorExecutionPreview({ execution }: { execution: OracleVectorSearchExecutionResult }): ReactElement {
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
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Oracle Vector Plan</p>
        <span className="shrink-0 text-[11px] font-medium text-slate-500">{execution.status}</span>
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
            {connectorDiagnostic.ociConfig.profile ? (
              <ConnectorDiagnosticRow label="Profile" value={connectorDiagnostic.ociConfig.profile} />
            ) : null}
          </dl>
          {connectorDiagnostic.health.message ? (
            <p className="mt-2 text-xs leading-5 text-amber-800">{connectorDiagnostic.health.message}</p>
          ) : null}
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.ociConfig.message}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">{connectorDiagnostic.sqlcl.message}</p>
          {connectorDiagnostic.ociConfig.configPath ? (
            <p className="mt-2 break-all text-[11px] leading-5 text-amber-700">config: {connectorDiagnostic.ociConfig.configPath}</p>
          ) : null}
          {connectorDiagnostic.ociConfig.keyFilePath ? (
            <p className="mt-1 break-all text-[11px] leading-5 text-amber-700">key: {connectorDiagnostic.ociConfig.keyFilePath}</p>
          ) : null}
          {connectorDiagnostic.sqlcl.executablePath ? (
            <p className="mt-1 break-all text-[11px] leading-5 text-amber-700">sqlcl: {connectorDiagnostic.sqlcl.executablePath}</p>
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

function SidebarItem({
  icon: Icon,
  label,
  active = false
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}): ReactElement {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700",
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-slate-950">{value}</p>
        </div>
      </div>
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
