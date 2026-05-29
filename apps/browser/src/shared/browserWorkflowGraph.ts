export type BrowserWorkflowGraphSource = "playbook_blueprint" | "assistant_context";
export type BrowserWorkflowNodeKind = "observe" | "compare" | "plan" | "approval_gate" | "act" | "record";
export type BrowserWorkflowNodeStatus = "ready" | "needs_review" | "blocked";

export type BrowserWorkflowGraphNode = {
  id: string;
  kind: BrowserWorkflowNodeKind;
  step: string;
  title: string;
  detail: string;
  toolLabel: string;
  inputLabel: string;
  outputLabel: string;
  status: BrowserWorkflowNodeStatus;
  approvalRequired: boolean;
};

export type BrowserWorkflowGraphEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
};

export type BrowserWorkflowGraphDraft = {
  id: string;
  source: BrowserWorkflowGraphSource;
  sourceContextId?: string;
  title: string;
  workspaceName: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  approvalGateCount: number;
  canSave: boolean;
  saveLabel: string;
  nodes: BrowserWorkflowGraphNode[];
  edges: BrowserWorkflowGraphEdge[];
  details: string[];
  guardrails: string[];
};

export type BrowserWorkflowGraphDraftOptions = {
  source?: BrowserWorkflowGraphSource;
  sourceContextId?: string;
  workspaceName: string;
  playbookTitle: string;
  currentTitle: string;
  currentUrl: string;
  promptPreview?: string;
  evidenceLabels?: string[];
};

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 43 + char.charCodeAt(0)) >>> 0;
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

function createNode(
  kind: BrowserWorkflowNodeKind,
  step: string,
  title: string,
  detail: string,
  toolLabel: string,
  inputLabel: string,
  outputLabel: string,
  status: BrowserWorkflowNodeStatus,
  approvalRequired: boolean
): BrowserWorkflowGraphNode {
  return {
    id: `workflow-node-${step}-${kind}`,
    kind,
    step,
    title,
    detail,
    toolLabel,
    inputLabel,
    outputLabel,
    status,
    approvalRequired
  };
}

function createLinearEdges(nodes: BrowserWorkflowGraphNode[]): BrowserWorkflowGraphEdge[] {
  return nodes.slice(0, -1).map((node, index) => {
    const nextNode = nodes[index + 1]!;
    return {
      id: `workflow-edge-${node.id}-${nextNode.id}`,
      fromNodeId: node.id,
      toNodeId: nextNode.id,
      label: `${node.title} -> ${nextNode.title}`
    };
  });
}

export function createBrowserWorkflowGraphDraft(options: BrowserWorkflowGraphDraftOptions): BrowserWorkflowGraphDraft {
  const source = options.source ?? "playbook_blueprint";
  const workspaceName = normalizeText(options.workspaceName, "Workspace");
  const playbookTitle = normalizeText(options.playbookTitle, "Browser task");
  const currentTitle = normalizeText(options.currentTitle, "Current page");
  const currentUrl = normalizeText(options.currentUrl, "about:blank");
  const promptPreview =
    options.promptPreview ??
    [
      `${playbookTitle} を repeatable browser workflow として整理する。`,
      `Target page: ${currentTitle}`,
      `URL: ${currentUrl}`
    ].join("\n");
  const evidenceLabels = (options.evidenceLabels ?? []).map((label) => normalizeText(label, "")).filter(Boolean);
  const contextSummary =
    source === "assistant_context"
      ? `attached browser context から ${currentTitle} の workflow draft を作成します。`
      : `${playbookTitle} を Oracle workspace 向けの workflow draft に変換します。`;
  const nodes = [
    createNode(
      "observe",
      "01",
      "Observe",
      `${currentTitle}、URL、workspace、既存 capture を観測する。`,
      "page context",
      currentUrl,
      "context bundle",
      "ready",
      false
    ),
    createNode(
      "compare",
      "02",
      "Compare",
      evidenceLabels.length > 0
        ? `${evidenceLabels.slice(0, 3).join(" / ")} を evidence として照合する。`
        : "保存済み capture、Knowledge、page summary を照合する。",
      "local evidence",
      "attached context / captures",
      "ranked evidence",
      "ready",
      false
    ),
    createNode(
      "plan",
      "03",
      "Plan",
      "OCI GenAI Enterprise AI Project を既定 provider として browser action と Oracle task に分解する。",
      "OCI GenAI Project",
      previewText(promptPreview, 96),
      "step plan",
      "needs_review",
      true
    ),
    createNode(
      "approval_gate",
      "04",
      "Approval Gate",
      "browser write、外部送信、credential 参照、OCI Console 変更を実行前に停止する。",
      "human review",
      "planned actions",
      "approved actions only",
      "needs_review",
      true
    ),
    createNode(
      "act",
      "05",
      "Act",
      "承認済みの read-only browser / connector preview だけを実行候補にする。",
      "guarded executor",
      "approved actions",
      "dry-run result",
      "needs_review",
      true
    ),
    createNode(
      "record",
      "06",
      "Record",
      "run history、capture、memory、schedule handoff に結果を残す。",
      "local stores",
      "dry-run result",
      "reviewable artifact",
      "ready",
      false
    )
  ];
  const edges = createLinearEdges(nodes);
  const approvalGateCount = nodes.filter((node) => node.approvalRequired).length;

  return {
    id: `browser-workflow-${hashSeed(`${source}:${workspaceName}:${currentTitle}:${currentUrl}:${promptPreview}`)}`,
    source,
    sourceContextId: options.sourceContextId,
    title: `${previewText(currentTitle, 44)} workflow`,
    workspaceName,
    description: contextSummary,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    approvalGateCount,
    canSave: false,
    saveLabel: "Review before save",
    nodes,
    edges,
    details: [
      `source: ${source}`,
      `workspace: ${workspaceName}`,
      `nodes: ${nodes.length}`,
      `edges: ${edges.length}`,
      `approval gates: ${approvalGateCount}`
    ],
    guardrails: [
      "BrowserOS source / asset / UI implementation reuse なし",
      "保存前 review-only。local workflow store、external MCP、OCI call は開始しない",
      "credential、secret、private key は node input に含めない"
    ]
  };
}
