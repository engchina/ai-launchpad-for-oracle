import type { BrowserAgentRunStatus } from "./agentRuns";
import type { BrowserMcpApprovalQueueItem, BrowserMcpApprovalQueueItemStatus } from "./browserMcpApprovalQueue";
import type { BrowserMcpRequest, BrowserMcpToolsCallRequest } from "./browserMcpProtocol";

export type BrowserMcpApprovalDecisionStatus = "approved_preview" | "revoked_preview";

export type BrowserMcpApprovalDecision = {
  id: string;
  auditEventId: string;
  status: BrowserMcpApprovalDecisionStatus;
  decidedAt: string;
  sessionId?: string;
  requestId?: string;
  workspaceName: string;
  mcpMethod: string;
  toolId: string;
  policyReason: string;
  confirmationSummary: string;
};

export type BrowserMcpApprovalDecisionPayload = Omit<BrowserMcpApprovalDecision, "id"> & {
  id?: string;
};

export type BrowserMcpExecutionConfirmation = {
  id: string;
  auditEventId: string;
  queueItemId: string;
  title: string;
  toolId: string;
  mcpMethod: string;
  workspaceName: string;
  policyReason: string;
  finalConfirmation: string;
  decisionStatus: BrowserMcpApprovalQueueItemStatus;
  runPreviewStatus: BrowserAgentRunStatus;
  actionLabel: string;
};

function createDecisionId(auditEventId: string, status: BrowserMcpApprovalDecisionStatus): string {
  return `mcp-approval-decision-${auditEventId}-${status}`;
}

export function createBrowserMcpExecutionConfirmation(
  queue: BrowserMcpApprovalQueueItem[]
): BrowserMcpExecutionConfirmation | null {
  const item = queue[0];
  if (!item) {
    return null;
  }

  const approved = item.status === "approved_preview";
  const policyReason = `${item.mcpMethod} / ${item.toolId} は browser state を変更できる MCP request のため、実行前に user approval が必要です。`;

  return {
    id: `mcp-execution-confirmation-${item.auditEventId}`,
    auditEventId: item.auditEventId,
    queueItemId: item.id,
    title: `${item.toolId} の実行前確認`,
    toolId: item.toolId,
    mcpMethod: item.mcpMethod,
    workspaceName: item.workspaceName,
    policyReason,
    finalConfirmation: approved
      ? "承認 preview は保存済みです。この段階では実 browser 操作はまだ実行しません。"
      : "承認 preview を保存すると、この request は run history preview にだけ接続されます。",
    decisionStatus: item.status,
    runPreviewStatus: item.runPreview.status,
    actionLabel: approved ? "Undo preview" : "Approve preview"
  };
}

export function createBrowserMcpApprovalDecision(
  item: BrowserMcpApprovalQueueItem,
  status: BrowserMcpApprovalDecisionStatus,
  decidedAt: string
): BrowserMcpApprovalDecision {
  const confirmation = createBrowserMcpExecutionConfirmation([item]);

  return {
    id: createDecisionId(item.auditEventId, status),
    auditEventId: item.auditEventId,
    status,
    decidedAt,
    sessionId: item.sessionId,
    requestId: item.requestId,
    workspaceName: item.workspaceName,
    mcpMethod: item.mcpMethod,
    toolId: item.toolId,
    policyReason: confirmation?.policyReason ?? item.rationale,
    confirmationSummary:
      status === "revoked_preview"
        ? "承認 preview を取り消しました。この MCP request は引き続き実行前 approval gate で停止します。"
        : (confirmation?.finalConfirmation ?? item.rationale)
  };
}

export function getApprovedBrowserMcpAuditEventIds(decisions: BrowserMcpApprovalDecision[]): string[] {
  const latestByAuditEventId = new Map<string, BrowserMcpApprovalDecision>();

  for (const decision of decisions) {
    const current = latestByAuditEventId.get(decision.auditEventId);
    if (!current || decision.decidedAt >= current.decidedAt) {
      latestByAuditEventId.set(decision.auditEventId, decision);
    }
  }

  return [...latestByAuditEventId.values()]
    .filter((decision) => decision.status === "approved_preview")
    .map((decision) => decision.auditEventId);
}

function isToolsCallRequest(request: BrowserMcpRequest): request is BrowserMcpToolsCallRequest {
  return request.method === "tools/call" && typeof (request as BrowserMcpToolsCallRequest).params?.toolId === "string";
}

export function findBrowserMcpApprovalDecisionForRequest(
  request: BrowserMcpRequest,
  decisions: BrowserMcpApprovalDecision[]
): BrowserMcpApprovalDecision | undefined {
  if (!isToolsCallRequest(request)) {
    return undefined;
  }

  return decisions
    .filter(
      (decision) =>
        decision.requestId === request.id &&
        decision.workspaceName === request.workspaceName &&
        decision.mcpMethod === request.method &&
        decision.toolId === request.params.toolId
    )
    .sort((left, right) => right.decidedAt.localeCompare(left.decidedAt))[0];
}
