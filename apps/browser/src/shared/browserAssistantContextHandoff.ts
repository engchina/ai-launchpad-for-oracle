import {
  getBrowserAssistantContextSourceLabel,
  type BrowserAssistantContextItem
} from "./browserAssistantContext";
import {
  calculateNextBrowserScheduleRunAt,
  createBrowserScheduleSuggestionCard,
  formatBrowserScheduleCadence,
  type BrowserScheduleSuggestionCard,
  type BrowserSchedulerTaskDraft
} from "./browserSchedulerRegistry";
import {
  createBrowserWorkflowGraphDraft,
  type BrowserWorkflowGraphDraft
} from "./browserWorkflowGraph";

export type BrowserAssistantContextHandoffMode = "workflow" | "schedule";

export type BrowserAssistantContextHandoffAction = {
  id: string;
  mode: BrowserAssistantContextHandoffMode;
  label: string;
  title: string;
  status: "draft_only";
  promptPreview: string;
  details: string[];
  guardrails: string[];
};

export type BrowserAssistantContextHandoffPreview = {
  id: string;
  sourceContextId: string;
  workspaceName: string;
  actions: BrowserAssistantContextHandoffAction[];
};

export function createBrowserAssistantContextHandoffPreview(
  item: BrowserAssistantContextItem | null,
  workspaceName: string
): BrowserAssistantContextHandoffPreview | null {
  if (!item) {
    return null;
  }

  const workspace = workspaceName.trim() || "Workspace";
  const contextLines = formatContextLines(item, workspace);
  const previewId = `${item.id}:handoff:${normalizeHandoffIdPart(workspace)}`;

  return {
    id: previewId,
    sourceContextId: item.id,
    workspaceName: workspace,
    actions: [
      {
        id: `${previewId}:workflow`,
        mode: "workflow",
        label: "Council",
        title: "Council workflow draft",
        status: "draft_only",
        promptPreview: [
          "Attached browser context を Council / Workflow Graph の draft に変換してください。",
          "",
          ...contextLines,
          "",
          "Draft requirements:",
          "- Observe / Compare / Plan / Review の node に分ける",
          "- OCI GenAI Enterprise AI Project を既定 provider として扱う",
          "- destructive action は approval gate に分離する",
          "- 保存前に user review が必要な項目を明示する"
        ].join("\n"),
        details: ["Workflow Graph draft", "Evidence-linked nodes", "Approval gates"],
        guardrails: ["BrowserOS source / asset reuse なし", "外部送信は preview のみ"]
      },
      {
        id: `${previewId}:schedule`,
        mode: "schedule",
        label: "Schedule",
        title: "Scheduled task draft",
        status: "draft_only",
        promptPreview: [
          "Attached browser context を Scheduled Task の draft に変換してください。",
          "",
          ...contextLines,
          "",
          "Draft requirements:",
          "- cadence 候補、実行 prompt、workspace、approval policy を提案する",
          "- credential、secret、private key は prompt に含めない",
          "- connector 未接続時の skip condition を明示する",
          "- この段階では保存も自動実行も行わない"
        ].join("\n"),
        details: ["Scheduled Tasks draft", "Cadence candidate", "Local run guardrails"],
        guardrails: ["draft-only / 未保存", "credential と secret は除外"]
      }
    ]
  };
}

export function getBrowserAssistantContextHandoffAction(
  preview: BrowserAssistantContextHandoffPreview | null,
  mode: BrowserAssistantContextHandoffMode
): BrowserAssistantContextHandoffAction | null {
  return preview?.actions.find((action) => action.mode === mode) ?? null;
}

export function createBrowserAssistantContextScheduleTaskDraft(
  preview: BrowserAssistantContextHandoffPreview | null,
  createdAt = new Date().toISOString()
): BrowserSchedulerTaskDraft | null {
  const action = getBrowserAssistantContextHandoffAction(preview, "schedule");
  if (!preview || !action) {
    return null;
  }

  const cadence = {
    type: "daily" as const,
    timeOfDay: "08:00",
    timezone: "Asia/Tokyo"
  };
  const name = `${createPreviewText(getScheduleContextTitle(action.promptPreview), 48)} 定期確認`;

  return {
    id: `browser-context-scheduler-${hashSeed(`${preview.id}:${action.id}`)}`,
    source: "assistant_context",
    sourceRunHistoryId: preview.sourceContextId,
    name,
    prompt: action.promptPreview,
    workspaceName: preview.workspaceName,
    cadence,
    cadenceLabel: formatBrowserScheduleCadence(cadence),
    enabled: true,
    status: "ready",
    approvalPolicy: "manual_review_required",
    nextRunAt: calculateNextBrowserScheduleRunAt(cadence, createdAt),
    lastRunStatus: "completed",
    runHistory: []
  };
}

export function createBrowserAssistantContextScheduleSuggestionCard(
  preview: BrowserAssistantContextHandoffPreview | null,
  createdAt = new Date().toISOString()
): BrowserScheduleSuggestionCard | null {
  return createBrowserScheduleSuggestionCard(createBrowserAssistantContextScheduleTaskDraft(preview, createdAt) ?? undefined);
}

export function createBrowserAssistantContextWorkflowGraphDraft(
  preview: BrowserAssistantContextHandoffPreview | null
): BrowserWorkflowGraphDraft | null {
  const action = getBrowserAssistantContextHandoffAction(preview, "workflow");
  if (!preview || !action) {
    return null;
  }

  return createBrowserWorkflowGraphDraft({
    source: "assistant_context",
    sourceContextId: preview.sourceContextId,
    workspaceName: preview.workspaceName,
    playbookTitle: action.title,
    currentTitle: getContextTitle(action.promptPreview),
    currentUrl: getContextUrl(action.promptPreview),
    promptPreview: action.promptPreview,
    evidenceLabels: getContextEvidenceLabels(action.promptPreview)
  });
}

function formatContextLines(item: BrowserAssistantContextItem, workspaceName: string): string[] {
  const lines = [
    `Target workspace: ${workspaceName}`,
    "Attached browser context:",
    `- Source: ${getBrowserAssistantContextSourceLabel(item.source)}`,
    `- Title: ${item.title}`,
    `- URL: ${item.url}`
  ];

  if (item.query) {
    lines.push(`- Query: ${item.query}`);
  }

  if (item.matches.length > 0) {
    lines.push("- Matched evidence:");
    for (const match of item.matches.slice(0, 3)) {
      lines.push(`  - ${match.label}: ${match.detail}`);
    }
  }

  return lines;
}

function normalizeHandoffIdPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/\/+$/, "");
}

function getScheduleContextTitle(promptPreview: string): string {
  const titleLine = promptPreview.split("\n").find((line) => line.startsWith("- Title:"));
  return titleLine?.replace("- Title:", "").trim() || "Attached context";
}

function getContextTitle(promptPreview: string): string {
  const titleLine = promptPreview.split("\n").find((line) => line.startsWith("- Title:"));
  return titleLine?.replace("- Title:", "").trim() || "Attached context";
}

function getContextUrl(promptPreview: string): string {
  const urlLine = promptPreview.split("\n").find((line) => line.startsWith("- URL:"));
  return urlLine?.replace("- URL:", "").trim() || "about:blank";
}

function getContextEvidenceLabels(promptPreview: string): string[] {
  const lines = promptPreview.split("\n");
  const evidenceStartIndex = lines.findIndex((line) => line.trim() === "- Matched evidence:");
  if (evidenceStartIndex < 0) {
    return [];
  }

  return lines
    .slice(evidenceStartIndex + 1)
    .filter((line) => line.startsWith("  - "))
    .map((line) => line.replace("  - ", "").trim())
    .filter(Boolean);
}

function createPreviewText(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 1))}...`;
}

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 37 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}
