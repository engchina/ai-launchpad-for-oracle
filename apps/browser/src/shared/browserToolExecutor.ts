import type {
  BrowserToolInvocationAuditEvent,
  BrowserToolInvocationDraft,
  BrowserToolInvocationEventLevel,
  BrowserToolInvocationStatus
} from "./browserToolInvocation";

export type BrowserToolExecutionStatus = "completed" | "waiting_approval" | "blocked" | "unknown_tool";
export type BrowserToolExecutionMode = "dry_run";

export type BrowserToolExecutionOutput = {
  summary: string;
  data: Record<string, unknown>;
};

export type BrowserToolExecutionPreview = {
  id: string;
  invocationId: string;
  toolId: string;
  compatibleName: string;
  label: string;
  workspaceName: string;
  status: BrowserToolExecutionStatus;
  mode: BrowserToolExecutionMode;
  createdAt: string;
  output: BrowserToolExecutionOutput;
  events: BrowserToolInvocationAuditEvent[];
};

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 37 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(7, "0").slice(0, 7);
}

function executionId(invocationId: string, createdAt: string): string {
  const timestamp = createdAt.replace(/[^0-9]/g, "").slice(0, 14) || "00000000000000";

  return `tool-exec-${timestamp}-${hashSeed(invocationId)}`;
}

function statusForInvocation(status: BrowserToolInvocationStatus): BrowserToolExecutionStatus {
  if (status === "ready" || status === "approved") {
    return "completed";
  }

  if (status === "waiting_approval") {
    return "waiting_approval";
  }

  if (status === "unknown_tool") {
    return "unknown_tool";
  }

  return "blocked";
}

function levelForStatus(status: BrowserToolExecutionStatus): BrowserToolInvocationEventLevel {
  if (status === "completed") {
    return "info";
  }

  if (status === "waiting_approval") {
    return "approval";
  }

  return "blocked";
}

function outputForDraft(draft: BrowserToolInvocationDraft, status: BrowserToolExecutionStatus): BrowserToolExecutionOutput {
  if (status === "completed" && draft.status === "ready") {
    return {
      summary: `${draft.label} を read-only dry-run として完了しました。`,
      data: {
        compatibleName: draft.compatibleName,
        category: draft.category,
        inputKeys: Object.keys(draft.input)
      }
    };
  }

  if (status === "completed") {
    return {
      summary: `${draft.label} は承認済みですが、この executor では dry-run event のみ生成します。`,
      data: {
        compatibleName: draft.compatibleName,
        category: draft.category,
        dryRunOnly: true
      }
    };
  }

  if (status === "waiting_approval") {
    return {
      summary: `${draft.label} は approval required のため executor では停止しました。`,
      data: {
        compatibleName: draft.compatibleName,
        category: draft.category,
        requiredApproval: true
      }
    };
  }

  return {
    summary: `${draft.label} は policy により実行されません。`,
    data: {
      compatibleName: draft.compatibleName,
      category: draft.category,
      blocked: true
    }
  };
}

function eventForExecution(
  draft: BrowserToolInvocationDraft,
  executionStatus: BrowserToolExecutionStatus,
  executionIdValue: string,
  createdAt: string
): BrowserToolInvocationAuditEvent {
  return {
    id: `${executionIdValue}-${executionStatus}`,
    invocationId: draft.id,
    level: levelForStatus(executionStatus),
    message: `${draft.label}: ${outputForDraft(draft, executionStatus).summary}`,
    createdAt
  };
}

export function executeBrowserToolDryRun(
  draft: BrowserToolInvocationDraft,
  createdAt = new Date().toISOString()
): BrowserToolExecutionPreview {
  const status = statusForInvocation(draft.status);
  const id = executionId(draft.id, createdAt);

  return {
    id,
    invocationId: draft.id,
    toolId: draft.toolId,
    compatibleName: draft.compatibleName,
    label: draft.label,
    workspaceName: draft.workspaceName,
    status,
    mode: "dry_run",
    createdAt,
    output: outputForDraft(draft, status),
    events: [eventForExecution(draft, status, id, createdAt)]
  };
}
