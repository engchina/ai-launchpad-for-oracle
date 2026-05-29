export type BrowserCoworkOperationKind = "browser_research" | "file_read" | "file_write" | "command_preview" | "artifact_review";
export type BrowserCoworkOperationStatus = "ready" | "needs_review" | "blocked";
export type BrowserCoworkRisk = "safe" | "review" | "blocked";

export type BrowserCoworkOperation = {
  id: string;
  kind: BrowserCoworkOperationKind;
  title: string;
  detail: string;
  inputLabel: string;
  outputLabel: string;
  scopeLabel: string;
  status: BrowserCoworkOperationStatus;
  risk: BrowserCoworkRisk;
  approvalRequired: boolean;
};

export type BrowserCoworkArtifactDraft = {
  id: string;
  fileName: string;
  title: string;
  format: "markdown" | "json" | "text";
  sourceOperationId: string;
  canWrite: false;
  reason: string;
};

export type BrowserCoworkPreview = {
  id: string;
  title: string;
  workspaceName: string;
  workspaceRootLabel: string;
  pageTitle: string;
  pageUrl: string;
  operationCount: number;
  readyCount: number;
  reviewCount: number;
  blockedCount: number;
  canRun: false;
  primaryActionLabel: string;
  operations: BrowserCoworkOperation[];
  artifacts: BrowserCoworkArtifactDraft[];
  details: string[];
  guardrails: string[];
};

export type BrowserCoworkPreviewOptions = {
  workspaceName: string;
  playbookTitle: string;
  currentTitle: string;
  currentUrl: string;
  task: string;
  captureCount: number;
  knowledgeChunkCount: number;
};

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 47 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}

function normalizeText(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : fallback;
}

function previewText(value: string, maxLength: number): string {
  const normalized = normalizeText(value, "");
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}...`;
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || fallback;
}

function createOperation(
  kind: BrowserCoworkOperationKind,
  title: string,
  detail: string,
  inputLabel: string,
  outputLabel: string,
  scopeLabel: string,
  status: BrowserCoworkOperationStatus,
  risk: BrowserCoworkRisk
): BrowserCoworkOperation {
  return {
    id: `cowork-${kind}`,
    kind,
    title,
    detail,
    inputLabel,
    outputLabel,
    scopeLabel,
    status,
    risk,
    approvalRequired: risk !== "safe"
  };
}

export function createBrowserCoworkPreview(options: BrowserCoworkPreviewOptions): BrowserCoworkPreview {
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const playbookTitle = normalizeText(options.playbookTitle, "Browser task");
  const currentTitle = normalizeText(options.currentTitle, "Current page");
  const currentUrl = normalizeText(options.currentUrl, "about:blank");
  const task = normalizeText(options.task, "現在ページから research report を作成する。");
  const workspaceSlug = slugify(workspaceName, "workspace");
  const reportSlug = slugify(currentTitle, "current-page");
  const workspaceRootLabel = `workspace://${workspaceSlug}`;
  const operations = [
    createOperation(
      "browser_research",
      "Research page",
      "現在ページ、capture、Knowledge を読み取り、report に入れる evidence を整理する。",
      `${currentTitle} / ${options.captureCount} captures / ${options.knowledgeChunkCount} chunks`,
      "ranked evidence",
      "browser read-only",
      "ready",
      "safe"
    ),
    createOperation(
      "file_read",
      "Inspect workspace files",
      "選択 workspace 配下の README、notes、既存 report だけを読み取り候補にする。",
      workspaceRootLabel,
      "file context summary",
      "workspace-scoped read",
      "ready",
      "safe"
    ),
    createOperation(
      "file_write",
      "Draft report file",
      "research 結果を Markdown report として保存する前に diff preview を表示する。",
      previewText(task, 96),
      `reports/${reportSlug}.md`,
      "workspace-scoped write",
      "needs_review",
      "review"
    ),
    createOperation(
      "command_preview",
      "Command preview",
      "ユーザー承認なしで shell command は実行せず、必要な場合だけ command plan を表示する。",
      "optional local command",
      "blocked until explicit approval",
      "no shell execution",
      "blocked",
      "blocked"
    ),
    createOperation(
      "artifact_review",
      "Review artifact",
      "report、follow-up、handover の artifact を送信前確認に回す。",
      playbookTitle,
      "review checklist",
      "local artifact only",
      "needs_review",
      "review"
    )
  ];
  const artifacts: BrowserCoworkArtifactDraft[] = [
    {
      id: `cowork-artifact-report-${hashSeed(`${workspaceName}:${currentUrl}`)}`,
      fileName: `reports/${reportSlug}.md`,
      title: `${currentTitle} research report`,
      format: "markdown",
      sourceOperationId: "cowork-file_write",
      canWrite: false,
      reason: "この切片では file write preview のみで、workspace への保存は開始しません。"
    },
    {
      id: `cowork-artifact-summary-${hashSeed(`${playbookTitle}:${task}`)}`,
      fileName: `reports/${reportSlug}.summary.json`,
      title: "Evidence summary metadata",
      format: "json",
      sourceOperationId: "cowork-artifact_review",
      canWrite: false,
      reason: "JSON metadata は review-only で、外部送信や cloud sync は行いません。"
    }
  ];

  return {
    id: `browser-cowork-${hashSeed(`${workspaceName}:${currentTitle}:${currentUrl}:${task}`)}`,
    title: `${previewText(currentTitle, 44)} Cowork preview`,
    workspaceName,
    workspaceRootLabel,
    pageTitle: currentTitle,
    pageUrl: currentUrl,
    operationCount: operations.length,
    readyCount: operations.filter((operation) => operation.status === "ready").length,
    reviewCount: operations.filter((operation) => operation.status === "needs_review").length,
    blockedCount: operations.filter((operation) => operation.status === "blocked").length,
    canRun: false,
    primaryActionLabel: "Review cowork plan",
    operations,
    artifacts,
    details: [
      `workspace: ${workspaceName}`,
      `scope: ${workspaceRootLabel}`,
      `captures: ${options.captureCount}`,
      `knowledge chunks: ${options.knowledgeChunkCount}`,
      `artifacts: ${artifacts.length}`
    ],
    guardrails: [
      "BrowserOS source / asset / implementation reuse なし",
      "workspace 配下だけを対象にし、絶対 path や親 directory への write は許可しない",
      "この preview では file write、shell command、external MCP、OCI call、cloud sync を開始しない",
      "credential、secret、private key は read / write / report 候補から除外する"
    ]
  };
}
