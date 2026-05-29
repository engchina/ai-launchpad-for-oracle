import type { BrowserMcpAuditEvent } from "./api";
import type { BrowserAgentRun, BrowserAgentRunEvent, BrowserAgentRunStatus, BrowserAgentRunStep } from "./agentRuns";
import type { BrowserMcpApprovalDecision, BrowserMcpApprovalDecisionStatus } from "./browserMcpApprovalDecision";

export type BrowserMcpRunHistoryStage = "approval_gate" | "guarded_executor" | "recorded";
export type BrowserMcpRunHistorySchedulePolicy = "manual_preview_only";

export type BrowserMcpRunHistoryEntry = {
  id: string;
  auditEventId: string;
  occurredAt: string;
  sessionId?: string;
  requestId?: string;
  workspaceName: string;
  mcpMethod: string;
  toolId: string;
  stage: BrowserMcpRunHistoryStage;
  status: BrowserAgentRunStatus;
  executionStatus: string;
  approvalDecisionStatus?: BrowserMcpApprovalDecisionStatus;
  schedulerPolicy: BrowserMcpRunHistorySchedulePolicy;
  title: string;
  summary: string;
  run: BrowserAgentRun;
};

function normalizeLabel(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function latestDecisionsByAuditEventId(decisions: BrowserMcpApprovalDecision[]): Map<string, BrowserMcpApprovalDecision> {
  const latest = new Map<string, BrowserMcpApprovalDecision>();

  for (const decision of decisions) {
    const current = latest.get(decision.auditEventId);
    if (!current || decision.decidedAt >= current.decidedAt) {
      latest.set(decision.auditEventId, decision);
    }
  }

  return latest;
}

function statusForEvent(event: BrowserMcpAuditEvent, decision?: BrowserMcpApprovalDecision): BrowserAgentRunStatus {
  if (event.status === "blocked" || event.status === "error") {
    return "blocked";
  }

  if (event.status === "waiting_approval" && decision?.status !== "approved_preview") {
    return "needs_approval";
  }

  return "completed";
}

function stageForEvent(event: BrowserMcpAuditEvent, status: BrowserAgentRunStatus): BrowserMcpRunHistoryStage {
  if (status === "needs_approval") {
    return "approval_gate";
  }

  if (event.executionStatus === "completed") {
    return "recorded";
  }

  return "guarded_executor";
}

function createRunStep(
  event: BrowserMcpAuditEvent,
  status: BrowserAgentRunStatus,
  approvalDecisionStatus?: BrowserMcpApprovalDecisionStatus
): BrowserAgentRunStep {
  const toolId = normalizeLabel(event.toolId, "unknown_tool");
  const approved = approvalDecisionStatus === "approved_preview";

  if (status === "blocked") {
    return {
      stepId: `mcp-history-${event.id}`,
      order: 1,
      title: `MCP run history: ${toolId}`,
      actionLabel: toolId,
      actionKind: "prepare_mcp_scope",
      risk: "blocked",
      status: "blocked",
      message: "MCP request は audit log 上で error または blocked として記録されています。"
    };
  }

  if (status === "needs_approval") {
    return {
      stepId: `mcp-history-${event.id}`,
      order: 1,
      title: `MCP run history: ${toolId}`,
      actionLabel: toolId,
      actionKind: "prepare_mcp_scope",
      risk: "review",
      status: "skipped",
      message: "approval decision がないため run history では承認待ちとして保持します。"
    };
  }

  return {
    stepId: `mcp-history-${event.id}`,
    order: 1,
    title: `MCP run history: ${toolId}`,
    actionLabel: toolId,
    actionKind: "prepare_mcp_scope",
    risk: approved ? "review" : "safe",
    status: approved ? "approved" : "completed",
    message: approved
      ? "保存済み approval decision と一致し、guarded dry-run executor の結果として記録しました。"
      : "read-only または approval 不要の MCP request として run history に記録しました。"
  };
}

function createRunEvent(step: BrowserAgentRunStep, event: BrowserMcpAuditEvent, status: BrowserAgentRunStatus): BrowserAgentRunEvent {
  const level = status === "blocked" ? "blocked" : status === "needs_approval" ? "approval" : step.status === "approved" ? "approval" : "info";

  return {
    id: `${step.stepId}-${step.status}`,
    stepId: step.stepId,
    level,
    message: `${step.actionLabel}: ${step.message}`,
    createdAt: event.occurredAt
  };
}

function createEntry(event: BrowserMcpAuditEvent, decision?: BrowserMcpApprovalDecision): BrowserMcpRunHistoryEntry {
  const workspaceName = normalizeLabel(event.workspaceName, "Browser MCP Workspace");
  const mcpMethod = normalizeLabel(event.mcpMethod, "tools/call");
  const toolId = normalizeLabel(event.toolId, "unknown_tool");
  const approvalDecisionStatus = event.approvalDecisionStatus ?? decision?.status;
  const status = statusForEvent(event, decision);
  const stage = stageForEvent(event, status);
  const executionStatus = normalizeLabel(event.executionStatus, status);
  const step = createRunStep(event, status, approvalDecisionStatus);
  const run: BrowserAgentRun = {
    id: `agent-run-mcp-history-${event.id}`,
    task: `Record MCP tool call ${toolId}`,
    status,
    startedAt: event.occurredAt,
    completedAt: event.occurredAt,
    planSummary: `${mcpMethod} / ${toolId} を workflow / scheduler 共通の run history contract に変換しました。`,
    workspaceName,
    steps: [step],
    events: [createRunEvent(step, event, status)]
  };

  return {
    id: `mcp-run-history-${event.id}`,
    auditEventId: event.id,
    occurredAt: event.occurredAt,
    sessionId: event.sessionId,
    requestId: event.requestId,
    workspaceName,
    mcpMethod,
    toolId,
    stage,
    status,
    executionStatus,
    approvalDecisionStatus,
    schedulerPolicy: "manual_preview_only",
    title: `${toolId} / ${stage}`,
    summary: run.planSummary,
    run
  };
}

export function createBrowserMcpRunHistory(
  events: BrowserMcpAuditEvent[],
  decisions: BrowserMcpApprovalDecision[] = []
): BrowserMcpRunHistoryEntry[] {
  const decisionsByAuditEventId = latestDecisionsByAuditEventId(decisions);

  return events
    .filter((event) => event.kind === "mcp_request")
    .map((event) => createEntry(event, decisionsByAuditEventId.get(event.id)));
}
