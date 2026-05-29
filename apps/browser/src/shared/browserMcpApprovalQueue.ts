import type { BrowserMcpAuditEvent } from "./api";
import type { BrowserAgentRun, BrowserAgentRunEvent, BrowserAgentRunStep } from "./agentRuns";

export type BrowserMcpApprovalQueueItemStatus = "waiting_approval" | "approved_preview";

export type BrowserMcpApprovalQueueItem = {
  id: string;
  auditEventId: string;
  status: BrowserMcpApprovalQueueItemStatus;
  occurredAt: string;
  sessionId?: string;
  requestId?: string;
  workspaceName: string;
  mcpMethod: string;
  toolId: string;
  title: string;
  rationale: string;
  runPreview: BrowserAgentRun;
};

function normalizeLabel(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function createQueueItemId(event: BrowserMcpAuditEvent): string {
  return `mcp-approval-${event.id}`;
}

function createRunStep(event: BrowserMcpAuditEvent, approved: boolean): BrowserAgentRunStep {
  const toolId = normalizeLabel(event.toolId, "unknown_tool");

  return {
    stepId: `mcp-audit-${event.id}`,
    order: 1,
    title: `MCP tool approval: ${toolId}`,
    actionLabel: toolId,
    actionKind: "prepare_mcp_scope",
    risk: "review",
    status: approved ? "approved" : "skipped",
    message: approved
      ? "MCP client からの tool call を承認済み preview として扱います。"
      : "MCP client からの tool call は承認待ちのため停止しています。"
  };
}

function createRunEvent(step: BrowserAgentRunStep, event: BrowserMcpAuditEvent, approved: boolean): BrowserAgentRunEvent {
  return {
    id: `${step.stepId}-${step.status}`,
    stepId: step.stepId,
    level: "approval",
    message: approved
      ? `${step.actionLabel}: approval queue で承認済み preview にしました。`
      : `${step.actionLabel}: ${event.requestId ?? "MCP request"} は approval queue で待機中です。`,
    createdAt: event.occurredAt
  };
}

function createRunPreview(event: BrowserMcpAuditEvent, approved: boolean): BrowserAgentRun {
  const workspaceName = normalizeLabel(event.workspaceName, "Browser MCP Workspace");
  const mcpMethod = normalizeLabel(event.mcpMethod, "tools/call");
  const toolId = normalizeLabel(event.toolId, "unknown_tool");
  const step = createRunStep(event, approved);

  return {
    id: `agent-run-mcp-approval-${event.id}`,
    task: `Review MCP tool call ${toolId}`,
    status: approved ? "completed" : "needs_approval",
    startedAt: event.occurredAt,
    completedAt: event.occurredAt,
    planSummary: `${mcpMethod} / ${toolId} を human approval gate に接続する clean-room run preview です。`,
    workspaceName,
    steps: [step],
    events: [createRunEvent(step, event, approved)]
  };
}

export function createBrowserMcpApprovalQueue(
  events: BrowserMcpAuditEvent[],
  approvedAuditEventIds: string[] = []
): BrowserMcpApprovalQueueItem[] {
  const approvedIds = new Set(approvedAuditEventIds);

  return events
    .filter((event) => event.kind === "mcp_request" && event.status === "waiting_approval")
    .map((event) => {
      const approved = approvedIds.has(event.id);
      const toolId = normalizeLabel(event.toolId, "unknown_tool");
      const mcpMethod = normalizeLabel(event.mcpMethod, "tools/call");
      const workspaceName = normalizeLabel(event.workspaceName, "Browser MCP Workspace");

      return {
        id: createQueueItemId(event),
        auditEventId: event.id,
        status: approved ? "approved_preview" : "waiting_approval",
        occurredAt: event.occurredAt,
        sessionId: event.sessionId,
        requestId: event.requestId,
        workspaceName,
        mcpMethod,
        toolId,
        title: `${toolId} requires approval`,
        rationale: `${mcpMethod} from ${workspaceName} is paused at the MCP boundary until the user approves it.`,
        runPreview: createRunPreview(event, approved)
      };
    });
}
