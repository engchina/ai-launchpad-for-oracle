import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  CheckSquare,
  CircleUserRound,
  Cloud,
  ClipboardList,
  Copy,
  Database,
  DatabaseZap,
  FileDown,
  FileText,
  Globe2,
  Headphones,
  Highlighter,
  History,
  Import,
  KeyRound,
  ListPlus,
  LayoutDashboard,
  MessageSquare,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
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
  useDeferredValue,
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
  createBrowserAiModeOnboardingPreview,
  type BrowserAiModeOnboardingModeId,
  type BrowserAiModeOnboardingStatus
} from "../../../shared/browserAiModeOnboarding";
import {
  createBrowserQuickStartOnboardingPreview,
  type BrowserQuickStartStepId,
  type BrowserQuickStartStepStatus
} from "../../../shared/browserQuickStartOnboarding";
import {
  createBrowserAssistantPromptLauncherPreview,
  type BrowserAssistantPromptRisk,
  type BrowserAssistantPromptTemplateId
} from "../../../shared/browserAssistantPromptLauncher";
import {
  applyBrowserAssistantActionRunHistoryCandidatePreview,
  createBrowserAssistantActionRunHistoryPreview,
  createBrowserAssistantActionRunHistoryCandidate,
  createBrowserAssistantActionPlanPreview,
  type BrowserAssistantActionRunHistoryCandidate,
  type BrowserAssistantActionRunHistoryPreview,
  type BrowserAssistantActionPlanStageId,
  type BrowserAssistantActionPlanStatus
} from "../../../shared/browserAssistantActionPlan";
import {
  getBrowserChatProviders,
  getNextBrowserChatProviderId,
  type BrowserChatProviderId
} from "../../../shared/browserChatHub";
import {
  createBrowserCloudSyncPreview,
  type BrowserCloudSyncDecision,
  type BrowserCloudSyncPreview
} from "../../../shared/browserCloudSync";
import {
  createBrowserCloudSignInPreview,
  type BrowserCloudSignInMethodStatus,
  type BrowserCloudSignInPreview,
  type BrowserCloudSignInStepStatus
} from "../../../shared/browserCloudSignIn";
import {
  createBrowserChromeImportPreview,
  type BrowserChromeImportDecision,
  type BrowserChromeImportItem,
  type BrowserChromeImportPreview
} from "../../../shared/browserChromeImport";
import {
  createBrowserProviderSettingsPreview,
  type BrowserProviderSettingDecision,
  type BrowserProviderSettingItem,
  type BrowserProviderSettingsPreview
} from "../../../shared/browserProviderSettings";
import {
  createBrowserCliControlPreview,
  type BrowserCliCommand,
  type BrowserCliControlPreview
} from "../../../shared/browserCliControl";
import {
  closeBrowserAssistantPanel,
  createBrowserAssistantPanelState,
  openBrowserAssistantPanel,
  shouldRenderBrowserAssistantPanel,
  type BrowserAssistantPanelTrigger
} from "../../../shared/browserAssistantPanel";
import {
  attachBrowserAssistantContext,
  clearBrowserAssistantContext,
  createBrowserAssistantContextItem,
  createBrowserAssistantContextState,
  formatBrowserAssistantContextPrompt,
  getBrowserAssistantContextSourceLabel,
  summarizeBrowserAssistantContext,
  type BrowserAssistantContextItem
} from "../../../shared/browserAssistantContext";
import {
  createBrowserAssistantContextHandoffPreview,
  getBrowserAssistantContextHandoffAction,
  type BrowserAssistantContextHandoffMode,
  type BrowserAssistantContextHandoffPreview
} from "../../../shared/browserAssistantContextHandoff";
import {
  createBrowserSchedulerTaskDraftFromAssistantRunHistory,
  createBrowserScheduleSuggestionCard,
  type BrowserSchedulerTaskDraft,
  type BrowserSchedulerTaskStatus
} from "../../../shared/browserSchedulerRegistry";
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
  resolveBrowserShortcut,
  type BrowserShortcutAction,
  type BrowserShortcutInput
} from "../../../shared/browserShortcuts";
import {
  defaultBrowserViewZoomFactor,
  getNextBrowserViewZoomFactor,
  isBrowserViewZoomCommand
} from "../../../shared/browserViewZoom";
import {
  closeBrowserTopMenuPanel,
  createBrowserTopMenuState,
  getBrowserTopMenuTitle,
  isBrowserTopMenuPanelOpen,
  toggleBrowserTopMenuPanel,
  type BrowserTopMenuPanelId
} from "../../../shared/browserTopMenu";
import {
  closeBrowserPageToolPanel,
  createBrowserPageSearchPreview,
  createBrowserPageToolState,
  getBrowserPageToolTitle,
  isBrowserPageBookmarked,
  isBrowserPageToolPanelOpen,
  toggleBrowserPageBookmark,
  toggleBrowserPageToolPanel,
  updateBrowserPageSearchQuery,
  type BrowserPageSearchPreview,
  type BrowserPageToolPanelId
} from "../../../shared/browserPageTools";
import {
  createBrowserExtensionPermissionsPreview,
  type BrowserExtensionDecision,
  type BrowserExtensionPermissionsPreview
} from "../../../shared/browserExtensionPermissions";
import {
  createBrowserHighlightsPreview,
  type BrowserHighlightDecision,
  type BrowserHighlightsPreview
} from "../../../shared/browserHighlights";
import {
  createBrowserFormAutofillPreview,
  type BrowserFormAutofillDecision,
  type BrowserFormAutofillPreview
} from "../../../shared/browserFormAutofill";
import {
  createBrowserWorkflowRecorderPreview,
  type BrowserWorkflowRecorderPreview,
  type BrowserWorkflowRecorderStepStatus
} from "../../../shared/browserWorkflowRecorder";
import {
  createBrowserPrivacyShieldPreview,
  type BrowserPrivacyShieldDecision,
  type BrowserPrivacyShieldPreview
} from "../../../shared/browserPrivacyShield";
import {
  createBrowserSmartNudgesPreview,
  type BrowserSmartNudgeCard,
  type BrowserSmartNudgePreview
} from "../../../shared/browserSmartNudges";
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

type BrowserOsRoute = "onboarding" | "workspace" | "cloudSignIn";

type BrowserOsPageTabTarget = {
  url: string;
  title?: string;
};

type BrowserOsAssistantPanelOpenTrigger = Exclude<BrowserAssistantPanelTrigger, "close">;

function createBrowserShortcutInput(event: KeyboardEvent): BrowserShortcutInput {
  const target = event.target instanceof HTMLElement ? event.target : null;

  return {
    key: event.key,
    altKey: event.altKey,
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    repeat: event.repeat,
    targetTagName: target?.tagName,
    targetRole: target?.getAttribute("role") ?? undefined,
    targetIsContentEditable: target?.isContentEditable
  };
}

const browserOsAssistantModes: Array<{
  id: AgenticModeId;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "workflow", label: "Council", icon: Users },
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
  const [browserOsPageTools, setBrowserOsPageTools] = useState(() => createBrowserPageToolState());
  const [browserOsTopMenu, setBrowserOsTopMenu] = useState(() => createBrowserTopMenuState());
  const [browserOsPrivacyShieldOpen, setBrowserOsPrivacyShieldOpen] = useState(false);
  const [browserOsExtensionsOpen, setBrowserOsExtensionsOpen] = useState(false);
  const [browserOsHighlightsOpen, setBrowserOsHighlightsOpen] = useState(false);
  const [browserOsSmartNudgesOpen, setBrowserOsSmartNudgesOpen] = useState(false);
  const [browserOsFormAutofillOpen, setBrowserOsFormAutofillOpen] = useState(false);
  const [browserOsWorkflowRecorderOpen, setBrowserOsWorkflowRecorderOpen] = useState(false);
  const [browserOsChatProviderId, setBrowserOsChatProviderId] = useState<BrowserChatProviderId>("oci_genai_enterprise");
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
  const activeChatProvider = useMemo(
    () => getBrowserChatProviders().find((provider) => provider.id === browserOsChatProviderId) ?? getBrowserChatProviders()[0],
    [browserOsChatProviderId]
  );
  const browserOsSmartNudgesPreview = useMemo(
    () =>
      createBrowserSmartNudgesPreview({
        mode: agenticModeId,
        workspaceName: selectedWorkspace.name,
        task: [
          browserOsAssistantPrompt,
          selectedPlaybook.title,
          "follow-up email",
          "daily readiness digest",
          currentTitle
        ].join(" "),
        completedTaskSummary: summary || `${selectedWorkspace.name} の readiness update を確認しました。`,
        connectedAppIds: connectorDiagnostic?.health.status === "ready" ? ["business_calendar"] : []
      }),
    [
      agenticModeId,
      browserOsAssistantPrompt,
      connectorDiagnostic?.health.status,
      currentTitle,
      selectedPlaybook.title,
      selectedWorkspace.name,
      summary
    ]
  );
  const browserOsProviderSettingsPreview = useMemo(
    () =>
      createBrowserProviderSettingsPreview({
        workspaceName: selectedWorkspace.name,
        activeProviderLabel: activeChatProvider.label,
        connectorStatus: connectorDiagnostic?.health.status ?? (connectorCheckState === "checking" ? "checking" : "preview"),
        knowledgeChunkCount: knowledgeChunks.length,
        captureCount: captures.length,
        activeModeLabel: activeAgenticMode.label
      }),
    [
      activeAgenticMode.label,
      activeChatProvider.label,
      captures.length,
      connectorCheckState,
      connectorDiagnostic?.health.status,
      knowledgeChunks.length,
      selectedWorkspace.name
    ]
  );
  const browserOsCloudSyncPreview = useMemo(
    () =>
      createBrowserCloudSyncPreview({
        workspaceName: selectedWorkspace.name,
        playbookTitle: selectedPlaybook.title,
        activeProviderLabel: activeChatProvider.label,
        captureCount: captures.length,
        knowledgeChunkCount: knowledgeChunks.length,
        scheduledTaskCount: 0
      }),
    [activeChatProvider.label, captures.length, knowledgeChunks.length, selectedPlaybook.title, selectedWorkspace.name]
  );
  const browserOsCloudSignInPreview = useMemo(
    () => createBrowserCloudSignInPreview(browserOsCloudSyncPreview),
    [browserOsCloudSyncPreview]
  );
  const browserOsCliControlPreview = useMemo(
    () =>
      createBrowserCliControlPreview({
        workspaceName: selectedWorkspace.name,
        playbookTitle: selectedPlaybook.title,
        currentUrl,
        currentTitle,
        providerLabel: activeChatProvider.label,
        mcpEndpointStatus: connectorDiagnostic?.health.status ?? (connectorCheckState === "checking" ? "checking" : "preview"),
        captureCount: captures.length,
        knowledgeChunkCount: knowledgeChunks.length
      }),
    [
      activeChatProvider.label,
      captures.length,
      connectorCheckState,
      connectorDiagnostic?.health.status,
      currentTitle,
      currentUrl,
      knowledgeChunks.length,
      selectedPlaybook.title,
      selectedWorkspace.name
    ]
  );
  const browserOsAssistantPanelVisible = shouldRenderBrowserAssistantPanel(browserOsAssistantPanel, browserOsRoute);
  const browserOsDeferredPageSearchQuery = useDeferredValue(browserOsPageTools.searchQuery);
  const browserOsPageSearchPreview = useMemo(
    () =>
      createBrowserPageSearchPreview(browserOsDeferredPageSearchQuery, {
        currentTitle,
        currentUrl,
        summary,
        selectionExplanation,
        captures: captures.map((capture) => ({
          title: capture.title,
          url: capture.url
        }))
      }),
    [browserOsDeferredPageSearchQuery, captures, currentTitle, currentUrl, selectionExplanation, summary]
  );
  const browserOsPrivacyShieldPreview = useMemo(
    () =>
      createBrowserPrivacyShieldPreview({
        currentUrl,
        currentTitle,
        workspaceName: selectedWorkspace.name,
        sourceType,
        captureCount: captures.length
      }),
    [captures.length, currentTitle, currentUrl, selectedWorkspace.name, sourceType]
  );
  const browserOsExtensionPermissionsPreview = useMemo(
    () =>
      createBrowserExtensionPermissionsPreview({
        workspaceName: selectedWorkspace.name,
        currentUrl,
        currentTitle,
        captureCount: captures.length,
        connectedMcpCount: connectorDiagnostic ? 1 : 0
      }),
    [captures.length, connectorDiagnostic, currentTitle, currentUrl, selectedWorkspace.name]
  );
  const browserOsChromeImportPreview = useMemo(
    () =>
      createBrowserChromeImportPreview({
        workspaceName: selectedWorkspace.name,
        bookmarkCount: browserOsPageTools.bookmarkedUrls.length,
        captureCount: captures.length,
        extensionReviewCount: browserOsExtensionPermissionsPreview.reviewCount
      }),
    [browserOsExtensionPermissionsPreview.reviewCount, browserOsPageTools.bookmarkedUrls.length, captures.length, selectedWorkspace.name]
  );
  const browserOsHighlightsPreview = useMemo(
    () =>
      createBrowserHighlightsPreview({
        workspaceName: selectedWorkspace.name,
        currentTitle,
        currentUrl,
        selectedText: selectedCapture?.selectedText || selectionExplanation,
        summary,
        bookmarkedUrls: browserOsPageTools.bookmarkedUrls,
        captures: captures.map((capture) => ({
          title: capture.title,
          url: capture.url,
          text: capture.selectedText,
          summary: capture.summary
        }))
      }),
    [
      browserOsPageTools.bookmarkedUrls,
      captures,
      currentTitle,
      currentUrl,
      selectedCapture?.selectedText,
      selectedWorkspace.name,
      selectionExplanation,
      summary
    ]
  );
  const browserOsFormAutofillPreview = useMemo(
    () =>
      createBrowserFormAutofillPreview({
        currentUrl,
        currentTitle,
        workspaceName: selectedWorkspace.name,
        sourceType,
        summary,
        selectionText: selectedCapture?.selectedText || selectionExplanation,
        knowledgeChunkCount: knowledgeChunks.length,
        captureCount: captures.length,
        providerLabel: activeChatProvider.label
      }),
    [
      activeChatProvider.label,
      captures.length,
      currentTitle,
      currentUrl,
      knowledgeChunks.length,
      selectedCapture?.selectedText,
      selectedWorkspace.name,
      selectionExplanation,
      sourceType,
      summary
    ]
  );
  const browserOsWorkflowRecorderPreview = useMemo(
    () =>
      createBrowserWorkflowRecorderPreview({
        currentUrl,
        currentTitle,
        workspaceName: selectedWorkspace.name,
        sourceType,
        playbookTitle: selectedPlaybook.title,
        prompt: browserOsAssistantPrompt,
        summary,
        captureCount: captures.length,
        knowledgeChunkCount: knowledgeChunks.length,
        providerLabel: activeChatProvider.label
      }),
    [
      activeChatProvider.label,
      browserOsAssistantPrompt,
      captures.length,
      currentTitle,
      currentUrl,
      knowledgeChunks.length,
      selectedPlaybook.title,
      selectedWorkspace.name,
      sourceType,
      summary
    ]
  );
  const browserOsPageSearchOpen = isBrowserPageToolPanelOpen(browserOsPageTools, "page_search");
  const browserOsBookmarkPanelOpen = isBrowserPageToolPanelOpen(browserOsPageTools, "bookmark");
  const browserOsCurrentPageBookmarked = isBrowserPageBookmarked(browserOsPageTools, currentUrl);
  const browserOsAssistantContextSummary = summarizeBrowserAssistantContext(browserOsAssistantContext.activeItem);
  const browserOsAssistantContextHandoff = useMemo(
    () => createBrowserAssistantContextHandoffPreview(browserOsAssistantContext.activeItem, selectedWorkspace.name),
    [browserOsAssistantContext.activeItem, selectedWorkspace.name]
  );
  const browserOsProfileMenuOpen = isBrowserTopMenuPanelOpen(browserOsTopMenu, "profile");
  const browserOsMoreMenuOpen = isBrowserTopMenuPanelOpen(browserOsTopMenu, "more");
  const ActiveAgenticIcon = browserOsAssistantModeIcons[activeAgenticMode.id];
  const isBrowserOsOnboarding = browserOsRoute === "onboarding";
  const isBrowserOsCloudSignIn = browserOsRoute === "cloudSignIn";
  const isBrowserOsInternalPage = isBrowserOsOnboarding || isBrowserOsCloudSignIn;
  const displayedChromeUrl = isBrowserOsOnboarding
    ? "chrome://ai-launchpad/onboarding"
    : isBrowserOsCloudSignIn
      ? "chrome://ai-launchpad/cloud-sign-in"
      : draftUrl;

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

  const handleApplyBrowserOsShortcut = useCallback(
    (shortcut: BrowserShortcutAction) => {
      if (shortcut.id === "open_chat") {
        handleSelectTopAgenticMode("chat", `${shortcut.shortcutLabel} で Chat panel を開きました。`, "shortcut");
        return;
      }

      if (shortcut.id === "open_council") {
        handleSelectTopAgenticMode("workflow", `${shortcut.shortcutLabel} で Council hub を開きました。`, "shortcut");
        return;
      }

      const nextProviderId = getNextBrowserChatProviderId(browserOsChatProviderId);
      const nextProvider = getBrowserChatProviders().find((provider) => provider.id === nextProviderId);
      setBrowserOsChatProviderId(nextProviderId);
      handleSelectTopAgenticMode("chat", `${shortcut.shortcutLabel} で ${nextProvider?.label ?? "next provider"} に切り替えました。`, "shortcut");
    },
    [browserOsChatProviderId, handleSelectTopAgenticMode]
  );

  const handleToggleBrowserOsTopMenu = useCallback((panelId: BrowserTopMenuPanelId) => {
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsTopMenu((current) => toggleBrowserTopMenuPanel(current, panelId));
  }, []);

  const handleToggleBrowserOsPageTool = useCallback((panelId: BrowserPageToolPanelId) => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsPageTools((current) => toggleBrowserPageToolPanel(current, panelId));
  }, []);

  const handleToggleBrowserOsPrivacyShield = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsPrivacyShieldOpen((current) => !current);
  }, []);

  const handleToggleBrowserOsExtensions = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsExtensionsOpen((current) => !current);
  }, []);

  const handleToggleBrowserOsHighlights = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsHighlightsOpen((current) => !current);
  }, []);

  const handleToggleBrowserOsSmartNudges = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsSmartNudgesOpen((current) => !current);
  }, []);

  const handleToggleBrowserOsFormAutofill = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsWorkflowRecorderOpen(false);
    setBrowserOsFormAutofillOpen((current) => !current);
  }, []);

  const handleToggleBrowserOsWorkflowRecorder = useCallback(() => {
    setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, "selection") : current));
    setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, "selection") : current));
    setBrowserOsPrivacyShieldOpen(false);
    setBrowserOsExtensionsOpen(false);
    setBrowserOsHighlightsOpen(false);
    setBrowserOsSmartNudgesOpen(false);
    setBrowserOsFormAutofillOpen(false);
    setBrowserOsWorkflowRecorderOpen((current) => !current);
  }, []);

  const handleCloseBrowserOsPrivacyShield = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsPrivacyShieldOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Privacy Shield preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsExtensions = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsExtensionsOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Extensions preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsHighlights = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsHighlightsOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Highlights preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsSmartNudges = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsSmartNudgesOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Smart Nudges preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsFormAutofill = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsFormAutofillOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Form Autofill preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsWorkflowRecorder = useCallback((trigger: "selection" | "outside" | "escape" = "selection") => {
    setBrowserOsWorkflowRecorderOpen(false);
    if (trigger !== "outside") {
      setBrowserOsRailStatus("Workflow Recorder preview を閉じました。");
    }
  }, []);

  const handleCloseBrowserOsPageTool = useCallback(
    (trigger: "selection" | "outside" | "escape" = "selection") => {
      setBrowserOsPageTools((current) => (current.openPanelId ? closeBrowserPageToolPanel(current, trigger) : current));
      if (trigger !== "outside") {
        setBrowserOsRailStatus(`${getBrowserPageToolTitle(browserOsPageTools.openPanelId ?? "page_search")} を閉じました。`);
      }
    },
    [browserOsPageTools.openPanelId]
  );

  const handleUpdateBrowserOsPageSearchQuery = useCallback((query: string) => {
    setBrowserOsPageTools((current) => updateBrowserPageSearchQuery(current, query));
  }, []);

  const handleToggleCurrentBrowserOsBookmark = useCallback(() => {
    setBrowserOsPageTools((current) => toggleBrowserPageBookmark(current, currentUrl));
    setBrowserOsRailStatus(
      browserOsCurrentPageBookmarked ? `${currentTitle} の bookmark を解除しました。` : `${currentTitle} を bookmark preview に保存しました。`
    );
  }, [browserOsCurrentPageBookmarked, currentTitle, currentUrl]);

  const handleAttachBrowserOsAssistantContext = useCallback((item: BrowserAssistantContextItem) => {
    setBrowserOsAssistantContext((current) => attachBrowserAssistantContext(current, item));
    setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, "chat", "toolbar"));
    setAgenticModeId("chat");
    setBrowserOsRoute("workspace");
    setBrowserOsRailStatus(`${getBrowserAssistantContextSourceLabel(item.source)} context を Chat panel に添付しました。`);
  }, []);

  const handleClearBrowserOsAssistantContext = useCallback(() => {
    setBrowserOsAssistantContext((current) => clearBrowserAssistantContext(current));
    setBrowserOsRailStatus("Assistant context を解除しました。");
  }, []);

  const handleOpenBrowserOsAssistantContextHandoff = useCallback(
    (mode: BrowserAssistantContextHandoffMode) => {
      const action = getBrowserAssistantContextHandoffAction(browserOsAssistantContextHandoff, mode);
      if (!action) {
        return;
      }

      const modeId: AgenticModeId = mode === "workflow" ? "workflow" : "schedule";
      setAgenticModeId(modeId);
      setBrowserOsAssistantPrompt(action.promptPreview);
      setBrowserOsAssistantPanel((current) => openBrowserAssistantPanel(current, modeId, "toolbar"));
      setBrowserOsRoute("workspace");
      setBrowserOsActiveTabId("workspace");
      setBrowserOsRailStatus(`${action.label} draft に attached context を渡しました。`);
    },
    [browserOsAssistantContextHandoff]
  );

  const handleOpenBrowserOsOnboardingScheduleHandoff = useCallback(
    (draft: BrowserSchedulerTaskDraft) => {
      setBrowserOsAssistantPrompt(draft.prompt);
      handleSelectTopAgenticMode("schedule", `${draft.name} を Scheduled Tasks Manager に渡しました。`, "toolbar");
    },
    [handleSelectTopAgenticMode]
  );

  const handleCloseBrowserOsTopMenu = useCallback(
    (trigger: "selection" | "outside" | "escape" = "selection") => {
      setBrowserOsTopMenu((current) => (current.openPanelId ? closeBrowserTopMenuPanel(current, trigger) : current));
      if (trigger !== "outside") {
        setBrowserOsRailStatus(`${getBrowserTopMenuTitle(browserOsTopMenu.openPanelId ?? "more")} を閉じました。`);
      }
    },
    [browserOsTopMenu.openPanelId]
  );

  useEffect(() => {
    if (!browserOsTopMenu.openPanelId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsTopMenu((current) => closeBrowserTopMenuPanel(current, "outside"));
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsTopMenu.openPanelId]);

  useEffect(() => {
    if (!browserOsTopMenu.openPanelId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsTopMenu((current) => closeBrowserTopMenuPanel(current, "escape"));
      setBrowserOsRailStatus(`${getBrowserTopMenuTitle(browserOsTopMenu.openPanelId ?? "more")} を閉じました。`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsTopMenu.openPanelId]);

  useEffect(() => {
    if (!browserOsPageTools.openPanelId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsPageTools((current) => closeBrowserPageToolPanel(current, "outside"));
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsPageTools.openPanelId]);

  useEffect(() => {
    if (!browserOsPageTools.openPanelId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsPageTools((current) => closeBrowserPageToolPanel(current, "escape"));
      setBrowserOsRailStatus(`${getBrowserPageToolTitle(browserOsPageTools.openPanelId ?? "page_search")} を閉じました。`);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsPageTools.openPanelId]);

  useEffect(() => {
    if (!browserOsPrivacyShieldOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsPrivacyShieldOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsPrivacyShieldOpen]);

  useEffect(() => {
    if (!browserOsPrivacyShieldOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsPrivacyShieldOpen(false);
      setBrowserOsRailStatus("Privacy Shield preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsPrivacyShieldOpen]);

  useEffect(() => {
    if (!browserOsExtensionsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsExtensionsOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsExtensionsOpen]);

  useEffect(() => {
    if (!browserOsExtensionsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsExtensionsOpen(false);
      setBrowserOsRailStatus("Extensions preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsExtensionsOpen]);

  useEffect(() => {
    if (!browserOsHighlightsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsHighlightsOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsHighlightsOpen]);

  useEffect(() => {
    if (!browserOsHighlightsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsHighlightsOpen(false);
      setBrowserOsRailStatus("Highlights preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsHighlightsOpen]);

  useEffect(() => {
    if (!browserOsSmartNudgesOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsSmartNudgesOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsSmartNudgesOpen]);

  useEffect(() => {
    if (!browserOsSmartNudgesOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsSmartNudgesOpen(false);
      setBrowserOsRailStatus("Smart Nudges preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsSmartNudgesOpen]);

  useEffect(() => {
    if (!browserOsFormAutofillOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsFormAutofillOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsFormAutofillOpen]);

  useEffect(() => {
    if (!browserOsFormAutofillOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsFormAutofillOpen(false);
      setBrowserOsRailStatus("Form Autofill preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsFormAutofillOpen]);

  useEffect(() => {
    if (!browserOsWorkflowRecorderOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof Node && browserOsTopMenuRef.current?.contains(target)) {
        return;
      }

      setBrowserOsWorkflowRecorderOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [browserOsWorkflowRecorderOpen]);

  useEffect(() => {
    if (!browserOsWorkflowRecorderOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setBrowserOsWorkflowRecorderOpen(false);
      setBrowserOsRailStatus("Workflow Recorder preview を閉じました。");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [browserOsWorkflowRecorderOpen]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const shortcut = resolveBrowserShortcut(createBrowserShortcutInput(event));
      if (!shortcut) {
        return;
      }

      event.preventDefault();
      handleApplyBrowserOsShortcut(shortcut);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleApplyBrowserOsShortcut]);

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
            <BrowserOsIconButton
              label="Search page"
              icon={Search}
              active={browserOsPageSearchOpen}
              ariaExpanded={browserOsPageSearchOpen}
              ariaControls="browseros-page-search-panel"
              onClick={() => handleToggleBrowserOsPageTool("page_search")}
            />
            <BrowserOsIconButton
              label={browserOsCurrentPageBookmarked ? "Bookmark saved" : "Bookmark"}
              icon={Star}
              active={browserOsBookmarkPanelOpen || browserOsCurrentPageBookmarked}
              ariaExpanded={browserOsBookmarkPanelOpen}
              ariaControls="browseros-bookmark-panel"
              onClick={() => handleToggleBrowserOsPageTool("bookmark")}
            />
            <BrowserOsIconButton
              label={`Smart Nudges: ${browserOsSmartNudgesPreview.suggestedCount} suggested`}
              icon={Sparkles}
              active={browserOsSmartNudgesOpen}
              ariaExpanded={browserOsSmartNudgesOpen}
              ariaControls="browseros-smart-nudges-panel"
              onClick={handleToggleBrowserOsSmartNudges}
            />
            <BrowserOsIconButton
              label={`Autofill: ${browserOsFormAutofillPreview.reviewCount} review`}
              icon={TextSelect}
              active={browserOsFormAutofillOpen}
              ariaExpanded={browserOsFormAutofillOpen}
              ariaControls="browseros-form-autofill-panel"
              onClick={handleToggleBrowserOsFormAutofill}
            />
            <BrowserOsIconButton
              label={`Recorder: ${browserOsWorkflowRecorderPreview.steps.length} steps`}
              icon={Camera}
              active={browserOsWorkflowRecorderOpen}
              ariaExpanded={browserOsWorkflowRecorderOpen}
              ariaControls="browseros-workflow-recorder-panel"
              onClick={handleToggleBrowserOsWorkflowRecorder}
            />
            <BrowserOsIconButton
              label={`Highlights: ${browserOsHighlightsPreview.localOnlyCount + browserOsHighlightsPreview.reviewCount} local`}
              icon={Highlighter}
              active={browserOsHighlightsOpen}
              ariaExpanded={browserOsHighlightsOpen}
              ariaControls="browseros-highlights-panel"
              onClick={handleToggleBrowserOsHighlights}
            />
            <BrowserOsIconButton
              label={`Privacy Shield: ${browserOsPrivacyShieldPreview.blockedCount} blocked`}
              icon={ShieldCheck}
              active={browserOsPrivacyShieldOpen}
              ariaExpanded={browserOsPrivacyShieldOpen}
              ariaControls="browseros-privacy-shield-panel"
              onClick={handleToggleBrowserOsPrivacyShield}
            />
            <BrowserOsIconButton
              label={`Extensions: ${browserOsExtensionPermissionsPreview.reviewCount} review`}
              icon={Puzzle}
              active={browserOsExtensionsOpen}
              ariaExpanded={browserOsExtensionsOpen}
              ariaControls="browseros-extensions-panel"
              onClick={handleToggleBrowserOsExtensions}
            />
            <div className="mx-1 h-4 w-px bg-[#d6d6d6]" aria-hidden="true" />
            <BrowserOsToolbarAction
              label="Chat"
              icon={MessageSquare}
              active={browserOsAssistantPanelVisible && agenticModeId === "chat"}
              shortcutLabel="Option/Alt+K"
              ariaKeyShortcuts="Alt+K"
              onClick={() => handleSelectTopAgenticMode("chat")}
            />
            <BrowserOsToolbarAction
              label="Council"
              icon={Users}
              active={browserOsAssistantPanelVisible && agenticModeId === "workflow"}
              shortcutLabel="Cmd/Ctrl+Shift+U"
              ariaKeyShortcuts="Meta+Shift+U Control+Shift+U"
              onClick={() => handleSelectTopAgenticMode("workflow")}
            />
            <BrowserOsToolbarAction
              label="Assistant"
              icon={Headphones}
              active={browserOsAssistantPanelVisible && agenticModeId === "agent"}
              onClick={() => handleSelectTopAgenticMode("agent")}
            />
            <div className="mx-1 h-4 w-px bg-[#d6d6d6]" aria-hidden="true" />
            <BrowserOsIconButton
              label="Profile"
              icon={CircleUserRound}
              active={browserOsProfileMenuOpen}
              ariaExpanded={browserOsProfileMenuOpen}
              ariaControls="browseros-profile-menu"
              onClick={() => handleToggleBrowserOsTopMenu("profile")}
            />
            <BrowserOsIconButton
              label="More"
              icon={MoreVertical}
              active={browserOsMoreMenuOpen}
              ariaExpanded={browserOsMoreMenuOpen}
              ariaControls="browseros-more-menu"
              onClick={() => handleToggleBrowserOsTopMenu("more")}
            />
            {browserOsTopMenu.openPanelId ? (
              <BrowserOsTopMenuPopover
                panelId={browserOsTopMenu.openPanelId}
                workspaceName={selectedWorkspace.name}
                workspaceStage={selectedWorkspace.stage}
                playbookTitle={selectedPlaybook.title}
                activeProviderLabel={activeChatProvider.label}
                providerSettingsPreview={browserOsProviderSettingsPreview}
                cloudSyncPreview={browserOsCloudSyncPreview}
                chromeImportPreview={browserOsChromeImportPreview}
                cliControlPreview={browserOsCliControlPreview}
                captureCount={captures.length}
                knowledgeChunkCount={knowledgeChunks.length}
                connectorStatus={connectorDiagnostic?.health.status ?? (connectorCheckState === "checking" ? "checking" : "preview")}
                onOpenWorkspace={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRoute("workspace");
                  setBrowserOsActiveTabId("workspace");
                  setBrowserOsRailStatus(`${selectedWorkspace.name} workspace を表示しました。`);
                }}
                onOpenChat={() => {
                  handleCloseBrowserOsTopMenu();
                  handleSelectTopAgenticMode("chat", `${activeChatProvider.label} で Chat panel を開きました。`);
                }}
                onCheckConnector={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRoute("workspace");
                  setBrowserOsRailStatus("Local Connector diagnostics を開始しました。");
                  void handleCheckLocalConnector();
                }}
                onSavePage={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRailStatus("現在のページを capture として保存します。");
                  void handleSavePage();
                }}
                onSaveScreenshot={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRailStatus("現在のページの screenshot を保存します。");
                  void handleSaveScreenshot();
                }}
                onExplainSelection={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRailStatus("選択範囲を assistant preview に送ります。");
                  void handleExplainSelection();
                }}
                onToggleTabSearch={() => {
                  handleCloseBrowserOsTopMenu();
                  handleToggleBrowserOsTabSearch();
                  setBrowserOsRailStatus("Tab search を切り替えました。");
                }}
                onOpenRoadmap={() => {
                  handleCloseBrowserOsTopMenu();
                  setBrowserOsRailStatus("Clean-room roadmap は docs/browseros-clean-room-roadmap.md に記録されています。");
                }}
                onClose={() => handleCloseBrowserOsTopMenu()}
              />
            ) : null}
            {browserOsPrivacyShieldOpen ? (
              <BrowserOsPrivacyShieldPopover
                preview={browserOsPrivacyShieldPreview}
                onClose={() => handleCloseBrowserOsPrivacyShield()}
              />
            ) : null}
            {browserOsExtensionsOpen ? (
              <BrowserOsExtensionPermissionsPopover
                preview={browserOsExtensionPermissionsPreview}
                onClose={() => handleCloseBrowserOsExtensions()}
              />
            ) : null}
            {browserOsHighlightsOpen ? (
              <BrowserOsHighlightsPopover
                preview={browserOsHighlightsPreview}
                onClose={() => handleCloseBrowserOsHighlights()}
              />
            ) : null}
            {browserOsSmartNudgesOpen ? (
              <BrowserOsSmartNudgesPopover
                preview={browserOsSmartNudgesPreview}
                onClose={() => handleCloseBrowserOsSmartNudges()}
              />
            ) : null}
            {browserOsFormAutofillOpen ? (
              <BrowserOsFormAutofillPopover
                preview={browserOsFormAutofillPreview}
                onClose={() => handleCloseBrowserOsFormAutofill()}
              />
            ) : null}
            {browserOsWorkflowRecorderOpen ? (
              <BrowserOsWorkflowRecorderPopover
                preview={browserOsWorkflowRecorderPreview}
                onClose={() => handleCloseBrowserOsWorkflowRecorder()}
              />
            ) : null}
            {browserOsPageTools.openPanelId ? (
              <BrowserOsPageToolPopover
                panelId={browserOsPageTools.openPanelId}
                currentTitle={currentTitle}
                currentUrl={currentUrl}
                searchQuery={browserOsPageTools.searchQuery}
                searchPreview={browserOsPageSearchPreview}
                bookmarkedUrls={browserOsPageTools.bookmarkedUrls}
                currentPageBookmarked={browserOsCurrentPageBookmarked}
                onSearchQueryChange={handleUpdateBrowserOsPageSearchQuery}
                onToggleBookmark={handleToggleCurrentBrowserOsBookmark}
                onAskChat={() => {
                  handleCloseBrowserOsPageTool();
                  const item = createBrowserAssistantContextItem({
                    source: "page_search",
                    title: currentTitle,
                    url: currentUrl,
                    query: browserOsPageTools.searchQuery,
                    matches: browserOsPageSearchPreview.matches.map((match) => ({
                      label: match.label,
                      detail: match.detail
                    }))
                  });
                  setBrowserOsAssistantPrompt(
                    item.query
                      ? `このページで「${item.query}」に関連する evidence と次の action を整理してください。`
                      : "このページの重要な evidence と次の action を整理してください。"
                  );
                  handleAttachBrowserOsAssistantContext(item);
                }}
                onAttachBookmarkToChat={() => {
                  handleCloseBrowserOsPageTool();
                  const item = createBrowserAssistantContextItem({
                    source: "bookmark",
                    title: currentTitle,
                    url: currentUrl,
                    matches: [
                      {
                        label: "Bookmarked page",
                        detail: currentUrl
                      }
                    ]
                  });
                  setBrowserOsAssistantPrompt("この bookmark を再確認して、PoC に使う evidence と次の action を整理してください。");
                  handleAttachBrowserOsAssistantContext(item);
                }}
                onSavePage={() => {
                  handleCloseBrowserOsPageTool();
                  setBrowserOsRailStatus("現在のページを capture として保存します。");
                  void handleSavePage();
                }}
                onOpenBookmark={(url) => {
                  handleCloseBrowserOsPageTool();
                  const title = titleForUrl(url);
                  setDraftUrl(url);
                  setUrl(url);
                  setPageMetadata(url, title);
                  setBrowserOsRoute("workspace");
                  setBrowserOsActiveTabId("workspace");
                  setBrowserOsRailStatus(`${title} bookmark を開きました。`);
                }}
                onClose={() => handleCloseBrowserOsPageTool()}
              />
            ) : null}
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
            onOpenScheduleHandoff={handleOpenBrowserOsOnboardingScheduleHandoff}
          />
        ) : isBrowserOsCloudSignIn ? (
          <BrowserOsCloudSignInPage
            preview={browserOsCloudSignInPreview}
            onOpenWorkspace={() => {
              const workspaceTab = findBrowserRailTab(browserOsSideSections, (tab) => tab.id === "workspace");
              if (workspaceTab) {
                handleSelectBrowserOsTab(workspaceTab, `${selectedWorkspace.name} workspace を表示しました。`);
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
                  <span className="rounded-full bg-[#f4f4f5] px-2 py-1 text-[#5f6368]">{activeChatProvider.label}</span>
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
                    handoffPreview={browserOsAssistantContextHandoff}
                    onOpenHandoff={handleOpenBrowserOsAssistantContextHandoff}
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
    id: "system",
    tabs: [
      {
        id: "cloud",
        label: "Cloud Sign In",
        icon: Globe2,
        route: "cloudSignIn",
        accent: "orange"
      }
    ]
  },
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

function BrowserOsIconButton({
  label,
  icon: Icon,
  active = false,
  ariaControls,
  ariaExpanded,
  onClick
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  ariaControls?: string;
  ariaExpanded?: boolean;
  onClick?: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-pressed={active || undefined}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
        active ? "bg-[#fff1eb] text-[#f05a24]" : "text-[#5f6368] hover:bg-[#ececec]"
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}

function BrowserOsAssistantContextCard({
  item,
  handoffPreview,
  onOpenHandoff,
  onClear
}: {
  item: BrowserAssistantContextItem;
  handoffPreview: BrowserAssistantContextHandoffPreview | null;
  onOpenHandoff: (mode: BrowserAssistantContextHandoffMode) => void;
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
      {handoffPreview ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {handoffPreview.actions.map((action) => {
            const ActionIcon = action.mode === "workflow" ? Users : ClipboardList;

            return (
              <button
                key={action.id}
                type="button"
                aria-label={`${action.label} に context を渡す`}
                title={action.title}
                onClick={() => onOpenHandoff(action.mode)}
                className="inline-flex h-8 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#fed7aa] bg-white px-2 text-[11px] font-semibold text-[#9a3412] transition-colors duration-200 hover:border-[#fdba74] hover:bg-[#fffaf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <ActionIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function workflowRecorderStatusClassName(status: BrowserWorkflowRecorderStepStatus): string {
  if (status === "captured") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "suggested") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  if (status === "needs_review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function BrowserOsWorkflowRecorderPopover({
  preview,
  onClose
}: {
  preview: BrowserWorkflowRecorderPreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-workflow-recorder-panel-heading";

  return (
    <div
      id="browseros-workflow-recorder-panel"
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[402px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Camera aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label="Workflow Recorder preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          {preview.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
              <p className="text-base font-semibold text-[#c2410c]">{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.hostname || "local"}
          </span>
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.providerLabel}
          </span>
        </div>
        <p className="mt-2 rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
          {preview.localOnlyNotice}
        </p>
        <p className="mt-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-[11px] font-semibold text-[#c2410c]">
          {preview.graphSummary}
        </p>
      </div>

      <div className="max-h-[460px] overflow-auto px-3.5 py-3">
        <section aria-label="Recorder steps">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Recorder graph</p>
          <div className="mt-2 space-y-2">
            {preview.steps.map((step, index) => (
              <article key={step.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#262626]">
                      {String(index + 1).padStart(2, "0")} / {step.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{step.detail}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", workflowRecorderStatusClassName(step.status))}>
                    {step.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <span className="min-w-0 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-normal text-[#a1a1aa]">target</span>
                    <span className="block truncate text-[11px] text-[#3f3f46]">{step.targetLabel}</span>
                  </span>
                  <span className="min-w-0 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-normal text-[#a1a1aa]">evidence</span>
                    <span className="block truncate text-[11px] text-[#3f3f46]">{step.evidenceLabel}</span>
                  </span>
                </div>
                {step.approvalRequired ? (
                  <p className="mt-2 rounded-md border border-[#fed7aa] bg-white px-2 py-1.5 text-[11px] leading-4 text-[#c2410c]">
                    approval gate required
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <div className="mt-3 flex flex-wrap gap-2">
          {preview.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                  : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
              )}
            >
              <Camera aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function formAutofillDecisionClassName(decision: BrowserFormAutofillDecision): string {
  if (decision === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function BrowserOsFormAutofillPopover({
  preview,
  onClose
}: {
  preview: BrowserFormAutofillPreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-form-autofill-panel-heading";

  return (
    <div
      id="browseros-form-autofill-panel"
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[390px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TextSelect aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label="Form Autofill preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#15803d]">{preview.readyCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">ready</p>
          </div>
          <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#c2410c]">{preview.reviewCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
          </div>
          <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.hostname || "local"}
          </span>
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.providerLabel}
          </span>
        </div>
        <p className="mt-2 rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
          {preview.localOnlyNotice}
        </p>
      </div>

      <div className="max-h-[460px] overflow-auto px-3.5 py-3">
        <section aria-label="Autofill fields">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Field plan</p>
          <div className="mt-2 space-y-2">
            {preview.fields.map((field) => (
              <article key={field.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#262626]">{field.label}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{field.reason}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", formAutofillDecisionClassName(field.decision))}>
                    {field.decision}
                  </span>
                </div>
                <div className="mt-2 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-normal text-[#a1a1aa]">{field.fieldName}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#3f3f46]">{field.suggestedValue}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{field.kind}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{field.evidenceLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-3 flex flex-wrap gap-2">
          {preview.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                  : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
              )}
            >
              <TextSelect aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function smartNudgeTypeClassName(type: BrowserSmartNudgeCard["type"]): string {
  if (type === "app_connection") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
}

function smartNudgeActionClassName(enabled: boolean): string {
  return enabled
    ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
    : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]";
}

function BrowserOsSmartNudgesPopover({
  preview,
  onClose
}: {
  preview: BrowserSmartNudgePreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-smart-nudges-panel-heading";

  return (
    <div
      id="browseros-smart-nudges-panel"
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[384px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.workspaceName}</p>
        </div>
        <button
          type="button"
          aria-label="Smart Nudges preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          {preview.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
              <p className="text-base font-semibold text-[#c2410c]">{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.modeLabel}
          </span>
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            local approval gate
          </span>
        </div>
        <p className="mt-2 rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
          {preview.localOnlyNotice}
        </p>
      </div>

      <div className="max-h-[460px] overflow-auto px-3.5 py-3">
        <section aria-label="Smart Nudge cards">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Nudge cards</p>
          {preview.cards.length > 0 ? (
            <div className="mt-2 space-y-2">
              {preview.cards.map((card) => (
                <article key={card.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#262626]">{card.title}</p>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-[#71717a]">{card.description}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", smartNudgeTypeClassName(card.type))}>
                      {card.type === "app_connection" ? "app" : "schedule"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{card.triggerLabel}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{card.status}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {card.details.slice(0, 3).map((detail) => (
                      <li key={detail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
                        <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[card.primaryAction, card.secondaryAction].map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        disabled={!action.enabled}
                        title={action.reason}
                        className={cn(
                          "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                          smartNudgeActionClassName(action.enabled)
                        )}
                      >
                        <Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
              現在の mode では表示対象の Smart Nudge はありません。
            </p>
          )}
        </section>

        {preview.suppressedReasons.length > 0 ? (
          <section className="mt-3" aria-label="Suppressed nudges">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Suppressed</p>
            <div className="mt-2 space-y-1.5">
              {preview.suppressedReasons.map((reason) => (
                <div key={reason} className="rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
                  {reason}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function highlightDecisionClassName(decision: BrowserHighlightDecision): string {
  if (decision === "saved") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
}

function BrowserOsHighlightsPopover({
  preview,
  onClose
}: {
  preview: BrowserHighlightsPreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-highlights-panel-heading";

  return (
    <div
      id="browseros-highlights-panel"
      role="dialog"
      aria-labelledby={headingId}
      aria-label="Highlights Preview"
      className="absolute right-0 top-9 z-50 w-[372px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Highlighter aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label="Highlights preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#15803d]">{preview.savedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">saved</p>
          </div>
          <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#c2410c]">{preview.reviewCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
          </div>
          <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#1d4ed8]">{preview.localOnlyCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#1e40af]">local</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="max-w-full truncate rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.workspaceName}
          </span>
          <span className="max-w-full truncate rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            query: {preview.query}
          </span>
        </div>
      </div>

      <div className="max-h-[460px] overflow-auto px-3.5 py-3">
        <section aria-label="Highlights">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Highlights</p>
          <div className="mt-2 space-y-2">
            {preview.highlights.map((highlight) => (
              <article key={highlight.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#262626]">{highlight.title}</p>
                    <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-[#71717a]">{highlight.text}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", highlightDecisionClassName(highlight.decision))}>
                    {highlight.decision}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{highlight.source}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{highlight.color}</span>
                  {highlight.semanticTags.slice(0, 3).map((tag) => (
                    <span key={`${highlight.id}-${tag}`} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-3" aria-label="Semantic Recall">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Semantic Recall</p>
          {preview.recalls.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {preview.recalls.map((recall) => (
                <div key={recall.id} className="flex items-start gap-2 rounded-lg border border-[#eeeeee] bg-white p-2">
                  <span className="mt-0.5 shrink-0 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-1.5 py-0.5 text-[10px] font-semibold text-[#c2410c]">
                    {recall.score}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold text-[#262626]">{recall.title}</span>
                    <span className="block line-clamp-2 text-[11px] leading-4 text-[#71717a]">{recall.reason}</span>
                    <span className="mt-1 block truncate text-[10px] text-[#a1a1aa]">{recall.source}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-[#eeeeee] bg-white px-2 py-2 text-[11px] leading-4 text-[#71717a]">
              local capture / bookmark に一致する候補はまだありません。
            </p>
          )}
        </section>

        <div className="mt-3 flex flex-wrap gap-2">
          {preview.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                  : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
              )}
            >
              <Highlighter aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function privacyDecisionClassName(decision: BrowserPrivacyShieldDecision): string {
  if (decision === "blocked") {
    return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
}

function BrowserOsPrivacyShieldPopover({
  preview,
  onClose
}: {
  preview: BrowserPrivacyShieldPreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-privacy-shield-panel-heading";

  return (
    <div
      id="browseros-privacy-shield-panel"
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[360px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label="Privacy Shield preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
          </div>
          <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#c2410c]">{preview.reviewCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
          </div>
          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#15803d]">{preview.allowedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">allowed</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.modeLabel}
          </span>
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.hostname || "about:blank"}
          </span>
        </div>
      </div>

      <div className="max-h-[440px] overflow-auto px-3.5 py-3">
        <section aria-label="Privacy Shield rules">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Rules</p>
          <div className="mt-2 space-y-2">
            {preview.rules.map((rule) => (
              <article key={rule.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#262626]">{rule.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{rule.detail}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", privacyDecisionClassName(rule.decision))}>
                    {rule.decision}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{rule.category}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{rule.scope}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-3" aria-label="Privacy Shield events">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Request Preview</p>
          <div className="mt-2 space-y-1.5">
            {preview.events.map((event) => (
              <div key={event.id} className="flex items-start gap-2 rounded-lg border border-[#eeeeee] bg-white p-2">
                <span className={cn("mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", privacyDecisionClassName(event.decision))}>
                  {event.decision}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-[#262626]">{event.label}</span>
                  <span className="block line-clamp-2 text-[11px] leading-4 text-[#71717a]">{event.detail}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-3 flex flex-wrap gap-2">
          {preview.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                  : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
              )}
            >
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function extensionDecisionClassName(decision: BrowserExtensionDecision): string {
  if (decision === "blocked") {
    return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
}

function BrowserOsExtensionPermissionsPopover({
  preview,
  onClose
}: {
  preview: BrowserExtensionPermissionsPreview;
  onClose: () => void;
}): ReactElement {
  const headingId = "browseros-extensions-panel-heading";

  return (
    <div
      id="browseros-extensions-panel"
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[372px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Puzzle aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p id={headingId} className="text-xs font-semibold text-[#171717]">
              {preview.title}
            </p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label="Extensions preview を閉じる"
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#15803d]">{preview.allowedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">allowed</p>
          </div>
          <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#c2410c]">{preview.reviewCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
          </div>
          <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-2 text-center">
            <p className="text-base font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.installedCount} extensions
          </span>
          <span className="rounded-full border border-[#e2e2e2] bg-white px-2 py-1 text-[11px] font-semibold text-[#3f3f46]">
            {preview.hostname || "about:blank"}
          </span>
        </div>
      </div>

      <div className="max-h-[460px] overflow-auto px-3.5 py-3">
        <section aria-label="Extension permission list">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#52525b]">Extension permissions</p>
          <div className="mt-2 space-y-2">
            {preview.extensions.map((extension) => (
              <article key={extension.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#262626]">{extension.name}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{extension.detail}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", extensionDecisionClassName(extension.decision))}>
                    {extension.decision}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{extension.source}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">risk: {extension.risk}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#52525b]">{extension.siteAccess}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {extension.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start justify-between gap-2 rounded-md bg-white px-2 py-1.5">
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold text-[#262626]">{permission.label}</span>
                        <span className="block line-clamp-2 text-[10px] leading-4 text-[#71717a]">{permission.detail}</span>
                      </span>
                      <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", extensionDecisionClassName(permission.decision))}>
                        {permission.decision}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-3 flex flex-wrap gap-2">
          {preview.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              title={action.reason}
              className={cn(
                "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
                action.enabled
                  ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                  : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
              )}
            >
              <Puzzle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-1">
          {preview.guardrails.map((guardrail) => (
            <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
              <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
              <span>{guardrail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BrowserOsPageToolPopover({
  panelId,
  currentTitle,
  currentUrl,
  searchQuery,
  searchPreview,
  bookmarkedUrls,
  currentPageBookmarked,
  onSearchQueryChange,
  onToggleBookmark,
  onAskChat,
  onAttachBookmarkToChat,
  onSavePage,
  onOpenBookmark,
  onClose
}: {
  panelId: BrowserPageToolPanelId;
  currentTitle: string;
  currentUrl: string;
  searchQuery: string;
  searchPreview: BrowserPageSearchPreview;
  bookmarkedUrls: string[];
  currentPageBookmarked: boolean;
  onSearchQueryChange: (query: string) => void;
  onToggleBookmark: () => void;
  onAskChat: () => void;
  onAttachBookmarkToChat: () => void;
  onSavePage: () => void;
  onOpenBookmark: (url: string) => void;
  onClose: () => void;
}): ReactElement {
  const panelIdAttribute = panelId === "page_search" ? "browseros-page-search-panel" : "browseros-bookmark-panel";
  const headingId = `${panelIdAttribute}-heading`;
  const title = getBrowserPageToolTitle(panelId);

  return (
    <div
      id={panelIdAttribute}
      role="dialog"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 w-[340px] overflow-hidden rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <p id={headingId} className="text-xs font-semibold text-[#171717]">
            {title}
          </p>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{currentTitle}</p>
        </div>
        <button
          type="button"
          aria-label={`${title} を閉じる`}
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      {panelId === "page_search" ? (
        <div className="px-3.5 py-3">
          <label className="text-[11px] font-semibold text-[#52525b]" htmlFor="browseros-page-search-input">
            ページと保存済み evidence を検索
          </label>
          <div className="relative mt-2">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
            <input
              id="browseros-page-search-input"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="h-8 w-full rounded-full border border-[#e2e2e2] bg-white pl-9 pr-3 text-xs text-[#27272a] outline-none transition-colors duration-200 focus:border-[#f26a2e] focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="mt-3 max-h-[220px] overflow-auto rounded-lg border border-[#eeeeee]">
            {searchPreview.matches.length > 0 ? (
              searchPreview.matches.map((match) => (
                <div key={`${match.kind}-${match.label}-${match.detail}`} className="border-b border-[#f1f1f1] px-3 py-2 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-[#262626]">{match.label}</p>
                    <span className="shrink-0 rounded-full bg-[#fff1eb] px-2 py-0.5 text-[10px] font-semibold text-[#f05a24]">{match.kind}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{match.detail}</p>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-[11px] leading-5 text-[#71717a]">
                {searchPreview.normalizedQuery
                  ? "一致する page context はまだありません。Chat に渡すか、capture を増やしてください。"
                  : "検索語を入力すると、現在ページ、summary、selection、capture preview から候補を表示します。"}
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onAskChat}
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#f05a24] px-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#d94f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <MessageSquare aria-hidden="true" className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={onSavePage}
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 text-xs font-semibold text-[#27272a] transition-colors duration-200 hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <Save aria-hidden="true" className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3.5 py-3">
          <div className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
            <p className="truncate text-xs font-semibold text-[#171717]">{currentTitle}</p>
            <p className="mt-1 break-all text-[11px] leading-4 text-[#71717a]">{currentUrl}</p>
            <button
              type="button"
              onClick={onToggleBookmark}
              className={cn(
                "mt-3 inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                currentPageBookmarked
                  ? "border border-[#e4e4e7] bg-white text-[#27272a] hover:bg-[#fafafa]"
                  : "bg-[#f05a24] text-white hover:bg-[#d94f1f]"
              )}
            >
              <Star aria-hidden="true" className="h-3.5 w-3.5" />
              {currentPageBookmarked ? "Bookmark を解除" : "Bookmark に保存"}
            </button>
            <button
              type="button"
              onClick={onAttachBookmarkToChat}
              className="mt-2 inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-3 text-xs font-semibold text-[#27272a] transition-colors duration-200 hover:bg-[#fff7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <MessageSquare aria-hidden="true" className="h-3.5 w-3.5" />
              Chat に添付
            </button>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-[#52525b]">Saved bookmarks</p>
            <div className="mt-2 max-h-[180px] overflow-auto rounded-lg border border-[#eeeeee]">
              {bookmarkedUrls.length > 0 ? (
                bookmarkedUrls.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => onOpenBookmark(url)}
                    className="flex w-full cursor-pointer items-start gap-2 border-b border-[#f1f1f1] px-3 py-2 text-left transition-colors duration-200 last:border-b-0 hover:bg-[#fff7f2] focus-visible:bg-[#fff7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
                  >
                    <Star aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-[#262626]">{titleForUrl(url)}</span>
                      <span className="block break-all text-[11px] leading-4 text-[#71717a]">{url}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-[11px] leading-5 text-[#71717a]">
                  まだ bookmark はありません。現在ページを保存すると、この browser preview 内で再表示できます。
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrowserOsTopMenuPopover({
  panelId,
  workspaceName,
  workspaceStage,
  playbookTitle,
  activeProviderLabel,
  providerSettingsPreview,
  cloudSyncPreview,
  chromeImportPreview,
  cliControlPreview,
  captureCount,
  knowledgeChunkCount,
  connectorStatus,
  onOpenWorkspace,
  onOpenChat,
  onCheckConnector,
  onSavePage,
  onSaveScreenshot,
  onExplainSelection,
  onToggleTabSearch,
  onOpenRoadmap,
  onClose
}: {
  panelId: BrowserTopMenuPanelId;
  workspaceName: string;
  workspaceStage: string;
  playbookTitle: string;
  activeProviderLabel: string;
  providerSettingsPreview: BrowserProviderSettingsPreview;
  cloudSyncPreview: BrowserCloudSyncPreview;
  chromeImportPreview: BrowserChromeImportPreview;
  cliControlPreview: BrowserCliControlPreview;
  captureCount: number;
  knowledgeChunkCount: number;
  connectorStatus: string;
  onOpenWorkspace: () => void;
  onOpenChat: () => void;
  onCheckConnector: () => void;
  onSavePage: () => void;
  onSaveScreenshot: () => void;
  onExplainSelection: () => void;
  onToggleTabSearch: () => void;
  onOpenRoadmap: () => void;
  onClose: () => void;
}): ReactElement {
  const menuId = panelId === "profile" ? "browseros-profile-menu" : "browseros-more-menu";
  const headingId = `${menuId}-heading`;
  const title = getBrowserTopMenuTitle(panelId);
  const primaryText = panelId === "profile" ? workspaceName : "Quick actions";
  const secondaryText = panelId === "profile" ? `${workspaceStage} / ${playbookTitle}` : `${captureCount} captures / ${knowledgeChunkCount} chunks`;
  const rows =
    panelId === "profile"
      ? [
          {
            icon: BriefcaseBusiness,
            label: "Project workspace",
            detail: workspaceName,
            onClick: onOpenWorkspace
          },
          {
            icon: MessageSquare,
            label: "Chat provider",
            detail: activeProviderLabel,
            onClick: onOpenChat
          },
          {
            icon: DatabaseZap,
            label: "Local Connector",
            detail: connectorStatus,
            onClick: onCheckConnector
          }
        ]
      : [
          {
            icon: Save,
            label: "Save page",
            detail: "capture として保存",
            onClick: onSavePage
          },
          {
            icon: Camera,
            label: "Save screenshot",
            detail: "visual evidence を保存",
            onClick: onSaveScreenshot
          },
          {
            icon: TextSelect,
            label: "Explain selection",
            detail: "選択範囲を整理",
            onClick: onExplainSelection
          },
          {
            icon: Search,
            label: "Tab search",
            detail: "left rail の tab を検索",
            onClick: onToggleTabSearch
          },
          {
            icon: BookOpen,
            label: "Clean-room roadmap",
            detail: "実装切片の記録",
            onClick: onOpenRoadmap
          }
        ];

  return (
    <div
      id={menuId}
      role="menu"
      aria-labelledby={headingId}
      className="absolute right-0 top-9 z-50 max-h-[calc(100vh-92px)] w-[320px] overflow-auto rounded-xl border border-[#dddddd] bg-white text-[#1f2937] shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eeeeee] bg-[#fafafa] px-3.5 py-3">
        <div className="min-w-0">
          <p id={headingId} className="text-xs font-semibold text-[#171717]">
            {title}
          </p>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{primaryText}</p>
        </div>
        <button
          type="button"
          aria-label={`${title} を閉じる`}
          onClick={onClose}
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5f6368] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="border-b border-[#eeeeee] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
            {panelId === "profile" ? (
              <CircleUserRound aria-hidden="true" className="h-4 w-4" />
            ) : (
              <MoreVertical aria-hidden="true" className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#171717]">{primaryText}</p>
            <p className="truncate text-[11px] text-[#71717a]">{secondaryText}</p>
          </div>
        </div>
      </div>
      {panelId === "profile" ? (
        <>
          <BrowserOsProviderSettingsSummary preview={providerSettingsPreview} />
          <BrowserOsCloudSyncSummary preview={cloudSyncPreview} />
          <BrowserOsChromeImportSummary preview={chromeImportPreview} />
        </>
      ) : null}
      {panelId === "more" ? <BrowserOsCliControlSummary preview={cliControlPreview} /> : null}
      <div className="py-1.5">
        {rows.map((row) => (
          <BrowserOsTopMenuRow key={row.label} {...row} />
        ))}
      </div>
      <div className="border-t border-[#eeeeee] bg-[#fafafa] px-3.5 py-2.5">
        <p className="text-[11px] leading-4 text-[#71717a]">
          BrowserOS source / asset は使用せず、OCI GenAI Enterprise AI project 向けの clean-room preview として動作します。
        </p>
      </div>
    </div>
  );
}

function cliCommandStatusClassName(status: BrowserCliCommand["status"]): string {
  if (status === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "review") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function cliCommandRiskClassName(risk: BrowserCliCommand["risk"]): string {
  if (risk === "safe") {
    return "text-[#15803d]";
  }

  if (risk === "review") {
    return "text-[#1d4ed8]";
  }

  return "text-[#b91c1c]";
}

function BrowserOsCliControlSummary({ preview }: { preview: BrowserCliControlPreview }): ReactElement {
  return (
    <section className="border-b border-[#eeeeee] bg-white px-3.5 py-3" aria-label="CLI Control Preview">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Terminal aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p className="text-xs font-semibold text-[#171717]">{preview.title}</p>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{preview.routeLabel}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-1 text-[10px] font-semibold text-[#c2410c]">
          review-only
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#15803d]">{preview.readyCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">ready</p>
        </div>
        <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#1d4ed8]">{preview.reviewCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#1e40af]">review</p>
        </div>
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
        </div>
      </div>

      <div className="mt-3 max-h-[238px] overflow-auto rounded-lg border border-[#eeeeee]">
        {preview.commands.map((command) => (
          <div key={command.id} className="border-b border-[#f1f1f1] px-3 py-2 last:border-b-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-[#262626]">{command.label}</p>
                <p className="mt-1 break-all rounded-md bg-[#18181b] px-2 py-1 font-mono text-[10px] leading-4 text-[#f8fafc]">
                  {command.command}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cliCommandStatusClassName(command.status))}>
                {command.status}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] leading-4">
              <span className={cn("font-semibold", cliCommandRiskClassName(command.risk))}>{command.risk}</span>
              <span className="truncate text-[#71717a]">{command.outputPreview}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason}
            className={cn(
              "inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
              action.enabled
                ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
            )}
          >
            <Terminal aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {preview.guardrails.slice(0, 3).map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
            <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function providerSettingDecisionClassName(decision: BrowserProviderSettingDecision): string {
  if (decision === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function providerSettingIcon(kind: BrowserProviderSettingItem["kind"]): LucideIcon {
  if (kind === "primary_provider") {
    return DatabaseZap;
  }

  if (kind === "agent_routing") {
    return BrainCircuit;
  }

  if (kind === "grounding") {
    return Database;
  }

  if (kind === "local_fallback") {
    return Search;
  }

  if (kind === "external_byok") {
    return Globe2;
  }

  return KeyRound;
}

function BrowserOsProviderSettingsSummary({ preview }: { preview: BrowserProviderSettingsPreview }): ReactElement {
  return (
    <section className="border-b border-[#eeeeee] bg-white px-3.5 py-3" aria-label="AI Provider Settings Preview">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Settings aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p className="text-xs font-semibold text-[#171717]">{preview.title}</p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.activeProviderLabel}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-1 text-[10px] font-semibold text-[#c2410c]">
          OCI default
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#15803d]">{preview.readyCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">ready</p>
        </div>
        <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#c2410c]">{preview.reviewCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
        </div>
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
        </div>
      </div>

      <div className="mt-3 max-h-[236px] overflow-auto rounded-lg border border-[#eeeeee]">
        {preview.items.map((item) => {
          const ItemIcon = providerSettingIcon(item.kind);

          return (
            <div key={item.id} className="border-b border-[#f1f1f1] px-3 py-2 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f4f4f5] text-[#5f6368]">
                    <ItemIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold text-[#262626]">{item.label}</span>
                    <span className="mt-0.5 block line-clamp-2 text-[11px] leading-4 text-[#71717a]">{item.detail}</span>
                  </span>
                </div>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", providerSettingDecisionClassName(item.decision))}>
                  {item.decision}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] leading-4">
                <span className="truncate font-semibold text-[#52525b]">{item.valueLabel}</span>
                <span className="shrink-0 text-[#71717a]">{item.riskLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason}
            className={cn(
              "inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
              action.enabled
                ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
            )}
          >
            <Settings aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {preview.guardrails.slice(0, 3).map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
            <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function chromeImportDecisionClassName(decision: BrowserChromeImportDecision): string {
  if (decision === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (decision === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function chromeImportIcon(kind: BrowserChromeImportItem["kind"]): LucideIcon {
  if (kind === "bookmarks") {
    return Star;
  }

  if (kind === "history") {
    return History;
  }

  if (kind === "passwords") {
    return KeyRound;
  }

  if (kind === "extensions") {
    return Puzzle;
  }

  return Database;
}

function BrowserOsChromeImportSummary({ preview }: { preview: BrowserChromeImportPreview }): ReactElement {
  return (
    <section className="border-b border-[#eeeeee] bg-white px-3.5 py-3" aria-label="Chrome Import Preview">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Import aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
            <p className="text-xs font-semibold text-[#171717]">{preview.title}</p>
          </div>
          <p className="mt-1 truncate text-[11px] text-[#71717a]">{preview.profileLabel}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-1 text-[10px] font-semibold text-[#c2410c]">
          preview
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#15803d]">{preview.readyCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#166534]">ready</p>
        </div>
        <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#c2410c]">{preview.reviewCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">review</p>
        </div>
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#b91c1c]">{preview.blockedCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">blocked</p>
        </div>
      </div>

      <div className="mt-3 max-h-[222px] overflow-auto rounded-lg border border-[#eeeeee]">
        {preview.items.map((item) => {
          const ItemIcon = chromeImportIcon(item.kind);

          return (
            <div key={item.id} className="border-b border-[#f1f1f1] px-3 py-2 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f4f4f5] text-[#5f6368]">
                    <ItemIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-semibold text-[#262626]">{item.label}</span>
                    <span className="mt-0.5 block line-clamp-2 text-[11px] leading-4 text-[#71717a]">{item.detail}</span>
                  </span>
                </div>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", chromeImportDecisionClassName(item.decision))}>
                  {item.decision}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] leading-4">
                <span className="truncate font-semibold text-[#52525b]">{item.estimateLabel}</span>
                <span className="shrink-0 text-[#71717a]">{item.riskLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason}
            className={cn(
              "inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
              action.enabled
                ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
            )}
          >
            <Import aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {preview.guardrails.slice(0, 3).map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
            <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function cloudSyncDecisionClassName(decision: BrowserCloudSyncDecision): string {
  if (decision === "sync_candidate") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  if (decision === "local_only") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function BrowserOsCloudSyncSummary({ preview }: { preview: BrowserCloudSyncPreview }): ReactElement {
  return (
    <section className="border-b border-[#eeeeee] bg-white px-3.5 py-3" aria-label="Cloud Sync Preview">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Cloud aria-hidden="true" className="h-4 w-4 text-[#2563eb]" />
            <p className="text-xs font-semibold text-[#171717]">{preview.title}</p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#71717a]">{preview.statusLabel}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[10px] font-semibold text-[#1d4ed8]">
          local-first
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#1d4ed8]">{preview.syncCandidateCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#1e40af]">sync</p>
        </div>
        <div className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#c2410c]">{preview.localOnlyCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#9a3412]">local</p>
        </div>
        <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-2 py-1.5 text-center">
          <p className="text-sm font-semibold text-[#b91c1c]">{preview.excludedCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-normal text-[#991b1b]">excluded</p>
        </div>
      </div>

      <div className="mt-3 max-h-[188px] overflow-auto rounded-lg border border-[#eeeeee]">
        {preview.scopes.map((scope) => (
          <div key={scope.id} className="border-b border-[#f1f1f1] px-3 py-2 last:border-b-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-[#262626]">{scope.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{scope.detail}</p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cloudSyncDecisionClassName(scope.decision))}>
                {scope.decision}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={!action.enabled}
            title={action.reason}
            className={cn(
              "inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed",
              action.enabled
                ? "cursor-pointer border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-white"
                : "border-[#e4e4e7] bg-[#f4f4f5] text-[#71717a]"
            )}
          >
            <Cloud aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {preview.guardrails.slice(0, 3).map((guardrail) => (
          <li key={guardrail} className="flex gap-2 text-[11px] leading-4 text-[#71717a]">
            <CheckSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563eb]" />
            <span>{guardrail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrowserOsTopMenuRow({
  icon: Icon,
  label,
  detail,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-200 hover:bg-[#fff7f2] focus-visible:bg-[#fff7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f4f5] text-[#5f6368]">
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[#262626]">{label}</span>
        <span className="block truncate text-[11px] text-[#71717a]">{detail}</span>
      </span>
    </button>
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

const browserAiModeOnboardingIcons: Record<BrowserAiModeOnboardingModeId, LucideIcon> = {
  chat: MessageSquare,
  agent: Bot,
  graph: BrainCircuit
};

const browserQuickStartIcons: Record<BrowserQuickStartStepId, LucideIcon> = {
  sign_in: Cloud,
  import_chrome: Import,
  configure_ai: Settings,
  try_assistant: Headphones
};

const browserAssistantPromptIcons: Record<BrowserAssistantPromptTemplateId, LucideIcon> = {
  summarize_page: MessageSquare,
  extract_table: Database,
  translate_selection: TextSelect,
  fill_form_guarded: CheckSquare,
  save_report: Save
};

const browserAssistantActionStageIcons: Record<BrowserAssistantActionPlanStageId, LucideIcon> = {
  observe: Search,
  plan: ClipboardList,
  approve: ShieldCheck,
  act: Bot,
  record: History
};

function browserAiModeOnboardingStatusClassName(status: BrowserAiModeOnboardingStatus): string {
  if (status === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "needs_review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#e5e7eb] bg-[#f8fafc] text-[#64748b]";
}

function browserQuickStartStatusClassName(status: BrowserQuickStartStepStatus): string {
  if (status === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "review_only") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function browserAssistantPromptRiskClassName(risk: BrowserAssistantPromptRisk): string {
  if (risk === "safe") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (risk === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function browserAssistantActionStatusClassName(status: BrowserAssistantActionPlanStatus): string {
  if (status === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "needs_review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function browserAssistantRunHistoryStatusClassName(status: BrowserAssistantActionRunHistoryCandidate["status"]): string {
  if (status === "completed") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "needs_approval") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function browserSchedulerTaskStatusClassName(status: BrowserSchedulerTaskStatus): string {
  if (status === "ready") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "needs_approval") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  if (status === "disabled") {
    return "border-[#e5e7eb] bg-white text-[#52525b]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function cloudSignInMethodStatusClassName(status: BrowserCloudSignInMethodStatus): string {
  if (status === "available") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }

  if (status === "review_only") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#e5e7eb] bg-[#f8fafc] text-[#64748b]";
}

function cloudSignInStepStatusClassName(status: BrowserCloudSignInStepStatus): string {
  if (status === "ready") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }

  if (status === "review") {
    return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
  }

  return "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]";
}

function BrowserOsCloudSignInPage({
  preview,
  onOpenWorkspace
}: {
  preview: BrowserCloudSignInPreview;
  onOpenWorkspace: () => void;
}): ReactElement {
  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-auto bg-white"
      aria-label="Cloud Sign In preview"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(255,255,255,0.62) 0, rgba(255,255,255,0.94) 60%, rgba(255,255,255,1) 100%), linear-gradient(to right, rgba(17, 24, 39, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 24, 39, 0.045) 1px, transparent 1px)",
        backgroundSize: "72px 72px"
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-10 py-10">
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eeeeee] bg-white/95 px-4 py-2 text-sm font-medium text-[#6b7280] shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f26a2e]" />
              local-first account preview
            </div>
            <h1 className="mt-6 text-[56px] font-semibold leading-[1.08] tracking-normal text-[#050505]">
              Cloud Sign In
            </h1>
            <p className="mt-4 max-w-3xl text-xl leading-8 text-[#747681]">{preview.subtitle}</p>
          </div>
          <div className="w-[280px] shrink-0 rounded-xl border border-[#eeeeee] bg-white/95 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Cloud aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
              <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Sync status</p>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#171717]">{preview.statusLabel}</p>
            <p className="mt-2 text-xs leading-5 text-[#71717a]">{preview.localOnlyNotice}</p>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-4">
          <section className="min-w-0 rounded-xl border border-[#eeeeee] bg-white/95 p-4 shadow-sm" aria-label="Sign-in methods">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Sign-in methods</p>
                <h2 className="mt-1 text-lg font-semibold text-[#111827]">{preview.title}</h2>
              </div>
              <button
                type="button"
                disabled
                title="この切片では認証を開始しません。"
                className="inline-flex h-9 cursor-not-allowed items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#f4f4f5] px-3 text-sm font-semibold text-[#71717a]"
              >
                Start sign-in disabled
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {preview.methods.map((method) => (
                <article key={method.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                      <KeyRound aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cloudSignInMethodStatusClassName(method.status))}>
                      {method.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#171717]">{method.label}</p>
                  <p className="mt-1 min-h-[58px] text-xs leading-5 text-[#71717a]">{method.detail}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-3 inline-flex h-8 w-full cursor-not-allowed items-center justify-center rounded-md border border-[#e4e4e7] bg-white text-xs font-semibold text-[#71717a]"
                  >
                    {method.actionLabel}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="rounded-xl border border-[#eeeeee] bg-white/95 p-4 shadow-sm" aria-label="Sync scope summary">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">What syncs</p>
            <div className="mt-3 space-y-2">
              {preview.syncBuckets.map((bucket) => (
                <div key={bucket.label} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-[#262626]">{bucket.label}</p>
                    <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#171717]">{bucket.value}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-[#71717a]">{bucket.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2">
              <p className="text-xs font-semibold text-[#b91c1c]">Excluded</p>
              <p className="mt-1 text-[11px] leading-4 text-[#991b1b]">
                {preview.excludedLabels.length > 0 ? preview.excludedLabels.join(", ") : "Credentials and wallets"}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-4 grid grid-cols-[340px_minmax(0,1fr)] gap-4" aria-label="Sign-in flow">
          <div className="rounded-xl border border-[#eeeeee] bg-white/95 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">How it works</p>
            <div className="mt-3 space-y-2">
              {preview.steps.map((step, index) => (
                <div key={step.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#171717]">
                      {String(index + 1).padStart(2, "0")} / {step.label}
                    </p>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cloudSignInStepStatusClassName(step.status))}>
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-[#71717a]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#eeeeee] bg-white/95 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Clean-room guardrails</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {preview.guardrails.map((guardrail) => (
                <div key={guardrail} className="flex gap-2 rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-[11px] leading-4 text-[#71717a]">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                  <span>{guardrail}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#ff4f0a] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#ea4608] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Continue to workspace
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function BrowserOsOnboardingPage({
  onGetStarted,
  onOpenScheduleHandoff
}: {
  onGetStarted: () => void;
  onOpenScheduleHandoff: (draft: BrowserSchedulerTaskDraft) => void;
}): ReactElement {
  const [selectedAssistantPromptId, setSelectedAssistantPromptId] = useState<BrowserAssistantPromptTemplateId>("fill_form_guarded");
  const [assistantActionApprovalGranted, setAssistantActionApprovalGranted] = useState(false);
  const [assistantActionRunStartedAt, setAssistantActionRunStartedAt] = useState(() => new Date().toISOString());
  const [assistantActionRunHistory, setAssistantActionRunHistory] = useState<BrowserAssistantActionRunHistoryPreview["runs"]>([]);
  const [assistantActionRunHistoryMessage, setAssistantActionRunHistoryMessage] = useState("local run history preview はまだありません。");
  const handleAssistantPromptSelect = useCallback((templateId: BrowserAssistantPromptTemplateId) => {
    setSelectedAssistantPromptId(templateId);
    setAssistantActionApprovalGranted(false);
    setAssistantActionRunStartedAt(new Date().toISOString());
  }, []);
  const handleAssistantActionApprovalToggle = useCallback(() => {
    setAssistantActionApprovalGranted((current) => !current);
    setAssistantActionRunStartedAt(new Date().toISOString());
  }, []);
  const aiModeOnboardingPreview = createBrowserAiModeOnboardingPreview();
  const quickStartPreview = createBrowserQuickStartOnboardingPreview({
    providerLabel: "OCI GenAI Enterprise AI Project"
  });
  const assistantPromptLauncherPreview = createBrowserAssistantPromptLauncherPreview({
    providerLabel: "OCI GenAI Enterprise AI Project"
  });
  const assistantActionPlanPreview = useMemo(
    () =>
      createBrowserAssistantActionPlanPreview({
        providerLabel: "OCI GenAI Enterprise AI Project",
        templateId: selectedAssistantPromptId,
        approvalGranted: assistantActionApprovalGranted
      }),
    [assistantActionApprovalGranted, selectedAssistantPromptId]
  );
  const assistantRunHistoryCandidate = useMemo(
    () =>
      createBrowserAssistantActionRunHistoryCandidate(
        assistantActionPlanPreview,
        {
          workspaceName: "Onboarding Preview"
        },
        assistantActionRunStartedAt
      ),
    [assistantActionPlanPreview, assistantActionRunStartedAt]
  );
  const assistantRunHistoryPreview = createBrowserAssistantActionRunHistoryPreview(assistantActionRunHistory, assistantActionRunHistoryMessage);
  const assistantScheduleDraft = useMemo(() => {
    const latestRun = assistantActionRunHistory[0];

    return createBrowserSchedulerTaskDraftFromAssistantRunHistory(latestRun, {}, latestRun?.completedAt ?? assistantActionRunStartedAt);
  }, [assistantActionRunHistory, assistantActionRunStartedAt]);
  const assistantScheduleSuggestion = useMemo(
    () => createBrowserScheduleSuggestionCard(assistantScheduleDraft ?? undefined),
    [assistantScheduleDraft]
  );
  const handleAssistantRunHistoryRecord = useCallback(() => {
    const result = applyBrowserAssistantActionRunHistoryCandidatePreview(assistantActionRunHistory, assistantRunHistoryCandidate);
    setAssistantActionRunHistory(result.history);
    setAssistantActionRunHistoryMessage(result.reason);
  }, [assistantActionRunHistory, assistantRunHistoryCandidate]);
  const handleAssistantRunHistoryClear = useCallback(() => {
    setAssistantActionRunHistory([]);
    setAssistantActionRunHistoryMessage("local run history preview をクリアしました。永続化済みデータはありません。");
  }, []);

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
      aria-label="AI Launchpad onboarding"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(255,255,255,0.55) 0, rgba(255,255,255,0.92) 58%, rgba(255,255,255,1) 100%), linear-gradient(to right, rgba(17, 24, 39, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 24, 39, 0.045) 1px, transparent 1px)",
        backgroundSize: "72px 72px"
      }}
    >
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-[1320px] items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6a2a] text-white shadow-sm">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold text-[#f05a24]">AI Launchpad</p>
        </div>
        <nav className="flex items-center gap-8 text-base font-semibold text-[#5f6368]" aria-label="Onboarding links">
          <a className="hover:text-[#f05a24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" href="https://docs.oracle.com/" rel="noreferrer">
            Docs
          </a>
          <a className="hover:text-[#f05a24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" href="https://github.com/oracle-samples" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-start overflow-auto px-8 pb-8 pt-3">
        <div className="max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#eeeeee] bg-white/95 px-4 py-2 text-base font-medium text-[#6b7280] shadow-sm">
            <span className="h-3 w-3 rounded-full bg-[#f26a2e]" />
            Oracle Enterprise Agentic Browser
          </div>
          <h1 className="mt-7 text-[72px] font-semibold leading-[1.08] tracking-normal text-[#050505]">
            Welcome to <span className="text-[#ef6a32]">AI Launchpad</span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-2xl leading-[1.6] text-[#747681]">
            Turn Oracle workspaces into actions. Privacy-first enterprise AI browser layer for OCI GenAI projects.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex h-12 cursor-pointer items-center gap-4 rounded-lg bg-[#ff4f0a] px-6 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#ea4608] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Get Started
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
            <a
              href="https://github.com/oracle-samples"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-8 text-base font-semibold text-[#171717] shadow-sm transition-colors duration-200 hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <section className="mt-10 w-full max-w-6xl" aria-label={aiModeOnboardingPreview.title}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">AI entry modes</p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">{aiModeOnboardingPreview.title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#71717a]">{aiModeOnboardingPreview.subtitle}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {aiModeOnboardingPreview.stats.map((stat) => (
                <div key={stat.label} className="min-w-[82px] rounded-lg border border-[#eeeeee] bg-white/90 px-3 py-2 text-center shadow-sm">
                  <p className="text-sm font-semibold text-[#171717]">{stat.value}</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {aiModeOnboardingPreview.modes.map((mode) => {
              const ModeIcon = browserAiModeOnboardingIcons[mode.id];

              return (
                <article key={mode.id} className="rounded-xl border border-[#eeeeee] bg-white/95 p-4 text-left shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                        <ModeIcon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#171717]">{mode.label}</p>
                        <p className="mt-0.5 truncate text-[11px] text-[#71717a]">{mode.eyebrow}</p>
                      </div>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAiModeOnboardingStatusClassName(mode.status))}>
                      {mode.status}
                    </span>
                  </div>
                  <p className="mt-3 min-h-[56px] text-xs leading-5 text-[#4b5563]">{mode.summary}</p>
                  <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-[#f1f1f1] bg-[#fafafa] px-3 py-2">
                    <p className="min-w-0 truncate text-[11px] font-semibold text-[#52525b]">{mode.evidenceLabel}</p>
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-[#fed7aa] bg-white px-2 text-[11px] font-semibold text-[#c2410c] transition-colors duration-200 hover:bg-[#fff7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      {mode.primaryAction}
                    </button>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{mode.guardrail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-4 w-full max-w-6xl rounded-xl border border-[#eeeeee] bg-white/95 p-4 text-left shadow-sm" aria-label={quickStartPreview.title}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Quick Start</p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">{quickStartPreview.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#71717a]">{quickStartPreview.subtitle}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickStartPreview.metrics.map((metric) => (
                <div key={metric.label} className="min-w-[74px] rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {quickStartPreview.steps.map((step, index) => {
              const StepIcon = browserQuickStartIcons[step.id];
              const actionEnabled = step.id === "try_assistant" && step.status === "ready";

              return (
                <article key={step.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                      <StepIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserQuickStartStatusClassName(step.status))}>
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#171717]">
                    {String(index + 1).padStart(2, "0")} / {step.label}
                  </p>
                  <p className="mt-1 min-h-[72px] text-xs leading-5 text-[#71717a]">{step.detail}</p>
                  <div className="mt-3 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                    <p className="truncate text-[11px] font-semibold text-[#52525b]">{step.evidenceLabel}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!actionEnabled}
                    onClick={actionEnabled ? onGetStarted : undefined}
                    title={actionEnabled ? "workspace を開きます。" : "この切片では review-only action です。"}
                    className={cn(
                      "mt-2 inline-flex h-8 w-full items-center justify-center rounded-md border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                      actionEnabled
                        ? "cursor-pointer border-[#fed7aa] bg-white text-[#c2410c] hover:bg-[#fff7ed]"
                        : "cursor-not-allowed border-[#e4e4e7] bg-white text-[#71717a]"
                    )}
                  >
                    {step.actionLabel}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {quickStartPreview.guardrails.map((guardrail) => (
              <div key={guardrail} className="flex gap-2 rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-[11px] leading-4 text-[#71717a]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                <span>{guardrail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 w-full max-w-6xl rounded-xl border border-[#eeeeee] bg-white/95 p-4 text-left shadow-sm" aria-label={assistantPromptLauncherPreview.title}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Try Assistant</p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">{assistantPromptLauncherPreview.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#71717a]">{assistantPromptLauncherPreview.subtitle}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {assistantPromptLauncherPreview.metrics.map((metric) => (
                <div key={metric.label} className="min-w-[74px] rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-center">
                  <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-3">
            {assistantPromptLauncherPreview.templates.map((template) => {
              const PromptIcon = browserAssistantPromptIcons[template.id];
              const actionEnabled = template.risk !== "blocked";
              const promptSelected = template.id === selectedAssistantPromptId;

              return (
                <article
                  key={template.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={promptSelected}
                  onClick={() => handleAssistantPromptSelect(template.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleAssistantPromptSelect(template.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border bg-[#fafafa] p-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                    promptSelected ? "border-[#fed7aa] bg-white shadow-sm ring-1 ring-[#fed7aa]" : "border-[#eeeeee] hover:border-[#fed7aa]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                      <PromptIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantPromptRiskClassName(template.risk))}>
                      {template.risk}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#171717]">{template.title}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-normal text-[#71717a]">{template.mode}</p>
                    </div>
                  </div>
                  <p className="mt-2 min-h-[64px] rounded-md border border-[#eeeeee] bg-white px-2 py-1.5 text-[11px] leading-4 text-[#52525b]">{template.prompt}</p>
                  <p className="mt-2 min-h-[54px] text-[11px] leading-4 text-[#71717a]">{template.detail}</p>
                  <div className="mt-3 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                    <p className="truncate text-[11px] font-semibold text-[#52525b]">{template.evidenceLabel}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!actionEnabled}
                    onClick={
                      actionEnabled
                        ? (event) => {
                            event.stopPropagation();
                            onGetStarted();
                          }
                        : undefined
                    }
                    title={actionEnabled ? "workspace で prompt preview を開きます。" : "この prompt は automation guardrail により blocked です。"}
                    className={cn(
                      "mt-2 inline-flex h-8 w-full items-center justify-center rounded-md border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                      actionEnabled
                        ? "cursor-pointer border-[#fed7aa] bg-white text-[#c2410c] hover:bg-[#fff7ed]"
                        : "cursor-not-allowed border-[#e4e4e7] bg-white text-[#71717a]"
                    )}
                  >
                    {template.actionLabel}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {assistantPromptLauncherPreview.guardrails.map((guardrail) => (
              <div key={guardrail} className="flex gap-2 rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-[11px] leading-4 text-[#71717a]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                <span>{guardrail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 w-full max-w-6xl rounded-xl border border-[#eeeeee] bg-white/95 p-4 text-left shadow-sm" aria-label={assistantActionPlanPreview.title}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-normal text-[#f05a24]">Agent Loop</p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">{assistantActionPlanPreview.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#71717a]">{assistantActionPlanPreview.subtitle}</p>
              <p className="mt-2 inline-flex rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-1 text-[11px] font-semibold text-[#c2410c]">{assistantActionPlanPreview.promptTitle}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <div className="grid grid-cols-4 gap-2">
                {assistantActionPlanPreview.metrics.map((metric) => (
                  <div key={metric.label} className="min-w-[74px] rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="min-w-[220px] rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3">
                <div className="flex items-start gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#f05a24]">
                    <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#171717]">{assistantActionPlanPreview.approval.label}</p>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantActionStatusClassName(assistantActionPlanPreview.approval.status))}>
                        {assistantActionPlanPreview.approval.evidenceLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[#71717a]">{assistantActionPlanPreview.approval.detail}</p>
                    <button
                      type="button"
                      disabled={!assistantActionPlanPreview.approval.actionEnabled}
                      onClick={handleAssistantActionApprovalToggle}
                      title={assistantActionPlanPreview.approval.actionEnabled ? "local preview の approval state だけを切り替えます。" : "read-only prompt は approval 不要です。"}
                      className={cn(
                        "mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                        assistantActionPlanPreview.approval.actionEnabled
                          ? "cursor-pointer border-[#fed7aa] bg-white text-[#c2410c] hover:bg-[#fff7ed]"
                          : "cursor-not-allowed border-[#e4e4e7] bg-white text-[#71717a]"
                      )}
                    >
                      {assistantActionPlanPreview.approval.granted ? <X aria-hidden="true" className="h-3.5 w-3.5" /> : <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />}
                      {assistantActionPlanPreview.approval.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-3">
            {assistantActionPlanPreview.stages.map((stage, index) => {
              const StageIcon = browserAssistantActionStageIcons[stage.id];

              return (
                <article key={stage.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1eb] text-[#f05a24]">
                      <StageIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantActionStatusClassName(stage.status))}>
                      {stage.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#171717]">
                    {String(index + 1).padStart(2, "0")} / {stage.label}
                  </p>
                  <p className="mt-1 min-h-[54px] text-[11px] leading-4 text-[#71717a]">{stage.detail}</p>
                  <div className="mt-3 rounded-md border border-[#eeeeee] bg-white px-2 py-1.5">
                    <p className="truncate text-[11px] font-semibold text-[#52525b]">{stage.evidenceLabel}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {assistantActionPlanPreview.tools.map((tool) => (
              <article key={`${tool.category}-${tool.label}`} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#171717]">{tool.label}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-normal text-[#71717a]">{tool.category}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantActionStatusClassName(tool.decision))}>
                    {tool.decision}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-4 text-[#71717a]">{tool.detail}</p>
              </article>
            ))}
          </div>

          <section className="mt-4 rounded-xl border border-[#eeeeee] bg-[#fafafa] p-4" aria-label={assistantActionPlanPreview.run.title}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <History aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
                  <h3 className="text-sm font-semibold text-[#171717]">{assistantActionPlanPreview.run.title}</h3>
                  <span
                    aria-live="polite"
                    className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantActionStatusClassName(assistantActionPlanPreview.run.status))}
                  >
                    {assistantActionPlanPreview.run.outputLabel}
                  </span>
                </div>
                <p className="mt-2 max-w-3xl text-[11px] leading-4 text-[#71717a]">{assistantActionPlanPreview.run.policyReason}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {assistantActionPlanPreview.run.metrics.map((metric) => (
                  <div key={metric.label} className="min-w-[70px] rounded-lg border border-[#eeeeee] bg-white px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {assistantActionPlanPreview.run.steps.map((step) => (
                <article key={step.id} className="rounded-lg border border-[#eeeeee] bg-white px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#171717]">{step.label}</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{step.evidenceLabel}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantActionStatusClassName(step.status))}>
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{step.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-[#eeeeee] bg-white p-4" aria-label={assistantRunHistoryCandidate.title}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.95fr)]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CheckSquare aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
                  <h3 className="text-sm font-semibold text-[#171717]">{assistantRunHistoryCandidate.title}</h3>
                  <span
                    aria-live="polite"
                    className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantRunHistoryStatusClassName(assistantRunHistoryCandidate.status))}
                  >
                    {assistantRunHistoryCandidate.status}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-4 text-[#71717a]">{assistantRunHistoryCandidate.reason}</p>
                <p className="mt-2 rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-[11px] leading-4 text-[#52525b]">
                  {assistantRunHistoryCandidate.localOnlyNotice}
                </p>
                <button
                  type="button"
                  disabled={!assistantRunHistoryCandidate.canRecord}
                  onClick={handleAssistantRunHistoryRecord}
                  title={assistantRunHistoryCandidate.canRecord ? "renderer state の local preview にだけ追加します。" : "blocked candidate は追加できません。"}
                  className={cn(
                    "mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                    assistantRunHistoryCandidate.canRecord
                      ? "cursor-pointer border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-white"
                      : "cursor-not-allowed border-[#e4e4e7] bg-[#fafafa] text-[#71717a]"
                  )}
                >
                  <History aria-hidden="true" className="h-3.5 w-3.5" />
                  {assistantRunHistoryCandidate.canRecord ? "Local preview に追加" : "Record disabled"}
                </button>
              </div>

              <div className="min-w-0">
                <div className="grid grid-cols-4 gap-2">
                  {assistantRunHistoryCandidate.metrics.map((metric) => (
                    <div key={metric.label} className="min-w-[70px] rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {assistantRunHistoryCandidate.run.events.slice(0, 3).map((event) => (
                    <article key={event.id} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-[#171717]">{event.stepId}</p>
                        <span className="shrink-0 rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#52525b]">
                          {event.level}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{event.message}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-[#eeeeee] bg-[#fafafa] p-4" aria-label={assistantRunHistoryPreview.title}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ClipboardList aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
                  <h3 className="text-sm font-semibold text-[#171717]">{assistantRunHistoryPreview.title}</h3>
                  <span className="rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#52525b]">
                    {assistantRunHistoryPreview.statusLabel}
                  </span>
                </div>
                <p aria-live="polite" className="mt-2 max-w-3xl text-[11px] leading-4 text-[#71717a]">{assistantRunHistoryPreview.message}</p>
                <p className="mt-2 max-w-3xl text-[11px] leading-4 text-[#52525b]">{assistantRunHistoryPreview.localOnlyNotice}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <div className="grid grid-cols-4 gap-2">
                  {assistantRunHistoryPreview.metrics.map((metric) => (
                    <div key={metric.label} className="min-w-[70px] rounded-lg border border-[#eeeeee] bg-white px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-[#171717]">{metric.value}</p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!assistantRunHistoryPreview.active}
                  onClick={handleAssistantRunHistoryClear}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                    assistantRunHistoryPreview.active
                      ? "cursor-pointer border-[#e5e7eb] bg-white text-[#52525b] hover:bg-[#fff7ed]"
                      : "cursor-not-allowed border-[#e4e4e7] bg-white text-[#a1a1aa]"
                  )}
                >
                  Clear preview
                </button>
              </div>
            </div>

            {assistantRunHistoryPreview.active ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {assistantRunHistoryPreview.runs.map((run) => (
                  <article key={run.id} className="rounded-lg border border-[#eeeeee] bg-white px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#171717]">{run.task}</p>
                        <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">{run.id}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserAssistantRunHistoryStatusClassName(run.status))}>
                        {run.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#71717a]">{run.planSummary}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase tracking-normal text-[#71717a]">
                      <span className="truncate rounded-md border border-[#eeeeee] bg-[#fafafa] px-2 py-1">steps {run.steps.length}</span>
                      <span className="truncate rounded-md border border-[#eeeeee] bg-[#fafafa] px-2 py-1">events {run.events.length}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-xl border border-[#eeeeee] bg-white p-4" aria-label="Assistant Schedule Handoff Preview">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ListPlus aria-hidden="true" className="h-4 w-4 text-[#f05a24]" />
                  <h3 className="text-sm font-semibold text-[#171717]">Assistant Schedule Handoff Preview</h3>
                  {assistantScheduleSuggestion ? (
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserSchedulerTaskStatusClassName(assistantScheduleSuggestion.status))}>
                      {assistantScheduleSuggestion.status}
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#e5e7eb] bg-[#fafafa] px-2 py-0.5 text-[10px] font-semibold text-[#71717a]">empty</span>
                  )}
                </div>
                <p className="mt-2 max-w-3xl text-[11px] leading-4 text-[#71717a]">
                  {assistantScheduleSuggestion
                    ? assistantScheduleSuggestion.description
                    : "local run history preview に追加した assistant run から schedule card 候補を作成します。"}
                </p>
              </div>
              <button
                type="button"
                disabled={!assistantScheduleDraft}
                onClick={() => {
                  if (assistantScheduleDraft) {
                    onOpenScheduleHandoff(assistantScheduleDraft);
                  }
                }}
                title="Workspace の Scheduled Tasks Manager に local draft として渡します。保存や alarm 登録は行いません。"
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                  assistantScheduleDraft
                    ? "cursor-pointer border-[#fed7aa] bg-white text-[#c2410c] hover:bg-[#fff7ed]"
                    : "cursor-not-allowed border-[#e4e4e7] bg-[#fafafa] text-[#71717a]"
                )}
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                {assistantScheduleSuggestion ? "Schedule preview に渡す" : "Run history required"}
              </button>
            </div>

            {assistantScheduleSuggestion ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <article className="rounded-lg border border-[#eeeeee] bg-[#fafafa] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#171717]">{assistantScheduleSuggestion.title}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-normal text-[#71717a]">{assistantScheduleSuggestion.taskName}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", browserSchedulerTaskStatusClassName(assistantScheduleSuggestion.status))}>
                      {assistantScheduleSuggestion.approvalPolicy}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-4 text-[#71717a]">{assistantScheduleSuggestion.promptPreview}</p>
                  {assistantScheduleSuggestion.blockedReason ? (
                    <p className="mt-2 rounded-md border border-[#fed7aa] bg-[#fff7ed] px-2 py-1 text-[11px] leading-4 text-[#c2410c]">
                      {assistantScheduleSuggestion.blockedReason}
                    </p>
                  ) : null}
                </article>
                <div className="grid grid-cols-2 gap-2">
                  {assistantScheduleSuggestion.details.map((detail) => (
                    <div key={detail} className="rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2">
                      <p className="truncate text-[11px] font-semibold text-[#52525b]">{detail}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2">
                    <p className="truncate text-[11px] font-semibold text-[#52525b]">next: {assistantScheduleSuggestion.nextRunAt ?? "review required"}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {assistantActionPlanPreview.guardrails.map((guardrail) => (
              <div key={guardrail} className="flex gap-2 rounded-lg border border-[#eeeeee] bg-[#fafafa] px-3 py-2 text-[11px] leading-4 text-[#71717a]">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f05a24]" />
                <span>{guardrail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-10 pb-5 text-center text-base text-[#747681]">
        AI Launchpad for Oracle © 2026 - Clean-room Agentic Browser
      </footer>
    </section>
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
