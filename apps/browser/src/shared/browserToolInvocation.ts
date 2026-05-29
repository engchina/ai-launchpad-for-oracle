import {
  createBrowserToolCatalog,
  type BrowserToolApproval,
  type BrowserToolDefinition,
  type BrowserToolSafety
} from "./browserToolCatalog";

export type BrowserToolInvocationStatus = "ready" | "waiting_approval" | "approved" | "blocked" | "unknown_tool";
export type BrowserToolInvocationEventLevel = "info" | "approval" | "blocked";

export type BrowserToolInvocationPayload = {
  toolId: string;
  input?: Record<string, unknown>;
  requestedBy: "agent_plan" | "user_preview" | "scheduler" | "mcp_client";
  workspaceName: string;
  createdAt?: string;
};

export type BrowserToolInvocationDraft = {
  id: string;
  toolId: string;
  compatibleName: string;
  label: string;
  category: string;
  workspaceName: string;
  input: Record<string, unknown>;
  requestedBy: BrowserToolInvocationPayload["requestedBy"];
  safety: BrowserToolSafety | "unknown";
  approval: BrowserToolApproval | "unknown";
  status: BrowserToolInvocationStatus;
  createdAt: string;
  rationale: string;
};

export type BrowserToolInvocationAuditEvent = {
  id: string;
  invocationId: string;
  level: BrowserToolInvocationEventLevel;
  message: string;
  createdAt: string;
};

export type BrowserToolInvocationPreview = {
  draft: BrowserToolInvocationDraft;
  events: BrowserToolInvocationAuditEvent[];
};

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}

function invocationId(seed: string, createdAt: string): string {
  const timestamp = createdAt.replace(/[^0-9]/g, "").slice(0, 14) || "00000000000000";

  return `tool-call-${timestamp}-${hashSeed(seed)}`;
}

function statusForApproval(approval: BrowserToolApproval): BrowserToolInvocationStatus {
  if (approval === "not_required") {
    return "ready";
  }

  if (approval === "blocked_by_default") {
    return "blocked";
  }

  return "waiting_approval";
}

function rationaleForTool(tool: BrowserToolDefinition): string {
  if (tool.approval === "not_required") {
    return "read-only tool のため、dry-run preview では自動実行候補にできます。";
  }

  if (tool.approval === "blocked_by_default") {
    return "destructive tool のため、既定では blocked として扱います。";
  }

  return "browser state、local workspace、または memory store に影響するため承認が必要です。";
}

function eventForDraft(draft: BrowserToolInvocationDraft): BrowserToolInvocationAuditEvent {
  const levelByStatus: Record<BrowserToolInvocationStatus, BrowserToolInvocationEventLevel> = {
    ready: "info",
    waiting_approval: "approval",
    approved: "approval",
    blocked: "blocked",
    unknown_tool: "blocked"
  };

  return {
    id: `${draft.id}-${draft.status}`,
    invocationId: draft.id,
    level: levelByStatus[draft.status],
    message: `${draft.label}: ${draft.rationale}`,
    createdAt: draft.createdAt
  };
}

export function createBrowserToolInvocationPreview(
  payload: BrowserToolInvocationPayload,
  tools = createBrowserToolCatalog()
): BrowserToolInvocationPreview {
  const createdAt = payload.createdAt ?? new Date().toISOString();
  const tool = tools.find((candidate) => candidate.id === payload.toolId || candidate.compatibleName === payload.toolId);
  const seed = `${payload.workspaceName}:${payload.requestedBy}:${payload.toolId}:${JSON.stringify(payload.input ?? {})}`;

  if (!tool) {
    const draft: BrowserToolInvocationDraft = {
      id: invocationId(seed, createdAt),
      toolId: payload.toolId,
      compatibleName: payload.toolId,
      label: "Unknown tool",
      category: "unknown",
      workspaceName: payload.workspaceName,
      input: payload.input ?? {},
      requestedBy: payload.requestedBy,
      safety: "unknown",
      approval: "unknown",
      status: "unknown_tool",
      createdAt,
      rationale: "catalog に存在しない tool は実行せず blocked として audit に残します。"
    };

    return {
      draft,
      events: [eventForDraft(draft)]
    };
  }

  const draft: BrowserToolInvocationDraft = {
    id: invocationId(seed, createdAt),
    toolId: tool.id,
    compatibleName: tool.compatibleName,
    label: tool.label,
    category: tool.category,
    workspaceName: payload.workspaceName,
    input: payload.input ?? {},
    requestedBy: payload.requestedBy,
    safety: tool.safety,
    approval: tool.approval,
    status: statusForApproval(tool.approval),
    createdAt,
    rationale: rationaleForTool(tool)
  };

  return {
    draft,
    events: [eventForDraft(draft)]
  };
}

export function approveBrowserToolInvocation(draft: BrowserToolInvocationDraft): BrowserToolInvocationPreview {
  if (draft.status !== "waiting_approval") {
    return {
      draft,
      events: [eventForDraft(draft)]
    };
  }

  const approvedDraft: BrowserToolInvocationDraft = {
    ...draft,
    status: "approved",
    rationale: "ユーザー承認済みのため、次の executor dry-run に渡せます。"
  };

  return {
    draft: approvedDraft,
    events: [eventForDraft(approvedDraft)]
  };
}
