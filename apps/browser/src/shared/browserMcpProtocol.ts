import { createBrowserToolCatalog, summarizeBrowserToolCatalog, type BrowserToolDefinition } from "./browserToolCatalog";
import { executeBrowserToolDryRun, type BrowserToolExecutionPreview } from "./browserToolExecutor";
import {
  approveBrowserToolInvocation,
  createBrowserToolInvocationPreview,
  type BrowserToolInvocationAuditEvent,
  type BrowserToolInvocationDraft,
  type BrowserToolInvocationPayload
} from "./browserToolInvocation";
import {
  findBrowserMcpApprovalDecisionForRequest,
  type BrowserMcpApprovalDecision,
  type BrowserMcpApprovalDecisionStatus
} from "./browserMcpApprovalDecision";

export type BrowserMcpMethod = "tools/list" | "tools/call";

export type BrowserMcpRequestBase = {
  id: string;
  method: BrowserMcpMethod | string;
  workspaceName: string;
  createdAt?: string;
};

export type BrowserMcpToolsListRequest = BrowserMcpRequestBase & {
  method: "tools/list";
  params?: {
    category?: BrowserToolDefinition["category"];
  };
};

export type BrowserMcpToolsCallRequest = BrowserMcpRequestBase & {
  method: "tools/call";
  params: {
    toolId: string;
    input?: Record<string, unknown>;
    requestedBy?: BrowserToolInvocationPayload["requestedBy"];
  };
};

export type BrowserMcpRequest = BrowserMcpToolsListRequest | BrowserMcpToolsCallRequest | BrowserMcpRequestBase;

export type BrowserMcpToolDescriptor = {
  name: string;
  title: string;
  description: string;
  category: BrowserToolDefinition["category"];
  safety: BrowserToolDefinition["safety"];
  approval: BrowserToolDefinition["approval"];
  runtimeScope: BrowserToolDefinition["runtimeScope"];
  inputSchema: {
    type: "object";
    additionalProperties: boolean;
  };
};

export type BrowserMcpToolsListResult = {
  tools: BrowserMcpToolDescriptor[];
  summary: ReturnType<typeof summarizeBrowserToolCatalog>;
};

export type BrowserMcpToolsCallResult = {
  invocation: BrowserToolInvocationDraft;
  execution: BrowserToolExecutionPreview;
  events: BrowserToolInvocationAuditEvent[];
  approvalDecision?: {
    id: string;
    status: BrowserMcpApprovalDecisionStatus;
    decidedAt: string;
    policyReason: string;
  };
};

export type BrowserMcpSuccessResponse =
  | {
      id: string;
      ok: true;
      method: "tools/list";
      result: BrowserMcpToolsListResult;
    }
  | {
      id: string;
      ok: true;
      method: "tools/call";
      result: BrowserMcpToolsCallResult;
    };

export type BrowserMcpErrorResponse = {
  id: string;
  ok: false;
  method: string;
  error: {
    code: "unknown_method" | "invalid_params";
    message: string;
  };
};

export type BrowserMcpResponse = BrowserMcpSuccessResponse | BrowserMcpErrorResponse;

function toDescriptor(tool: BrowserToolDefinition): BrowserMcpToolDescriptor {
  return {
    name: tool.compatibleName,
    title: tool.label,
    description: tool.description,
    category: tool.category,
    safety: tool.safety,
    approval: tool.approval,
    runtimeScope: tool.runtimeScope,
    inputSchema: {
      type: "object",
      additionalProperties: true
    }
  };
}

function listTools(request: BrowserMcpToolsListRequest, catalog: BrowserToolDefinition[]): BrowserMcpSuccessResponse {
  const filteredTools = request.params?.category ? catalog.filter((tool) => tool.category === request.params?.category) : catalog;

  return {
    id: request.id,
    ok: true,
    method: "tools/list",
    result: {
      tools: filteredTools.map(toDescriptor),
      summary: summarizeBrowserToolCatalog(filteredTools)
    }
  };
}

export type BrowserMcpRequestOptions = {
  approvalDecisions?: BrowserMcpApprovalDecision[];
};

function callTool(
  request: BrowserMcpToolsCallRequest,
  catalog: BrowserToolDefinition[],
  options: BrowserMcpRequestOptions
): BrowserMcpSuccessResponse {
  const invocation = createBrowserToolInvocationPreview(
    {
      toolId: request.params.toolId,
      input: request.params.input,
      requestedBy: request.params.requestedBy ?? "mcp_client",
      workspaceName: request.workspaceName,
      createdAt: request.createdAt
    },
    catalog
  );
  const approvalDecision = findBrowserMcpApprovalDecisionForRequest(request, options.approvalDecisions ?? []);
  const approvedInvocation =
    approvalDecision?.status === "approved_preview" ? approveBrowserToolInvocation(invocation.draft) : invocation;
  const execution = executeBrowserToolDryRun(approvedInvocation.draft, approvedInvocation.draft.createdAt);
  const approvalDecisionSummary = approvalDecision
    ? {
        id: approvalDecision.id,
        status: approvalDecision.status,
        decidedAt: approvalDecision.decidedAt,
        policyReason: approvalDecision.policyReason
      }
    : undefined;

  return {
    id: request.id,
    ok: true,
    method: "tools/call",
    result: {
      invocation: approvedInvocation.draft,
      execution,
      events: [...invocation.events, ...(approvedInvocation === invocation ? [] : approvedInvocation.events), ...execution.events],
      approvalDecision: approvalDecisionSummary
    }
  };
}

function hasCallParams(request: BrowserMcpRequestBase): request is BrowserMcpToolsCallRequest {
  const params = (request as BrowserMcpToolsCallRequest).params;

  return typeof params?.toolId === "string" && params.toolId.trim().length > 0;
}

export function handleBrowserMcpRequest(
  request: BrowserMcpRequest,
  catalog = createBrowserToolCatalog(),
  options: BrowserMcpRequestOptions = {}
): BrowserMcpResponse {
  if (request.method === "tools/list") {
    return listTools(request as BrowserMcpToolsListRequest, catalog);
  }

  if (request.method === "tools/call") {
    if (!hasCallParams(request)) {
      return {
        id: request.id,
        ok: false,
        method: request.method,
        error: {
          code: "invalid_params",
          message: "tools/call requires params.toolId."
        }
      };
    }

    return callTool(request, catalog, options);
  }

  return {
    id: request.id,
    ok: false,
    method: request.method,
    error: {
      code: "unknown_method",
      message: `Unsupported method: ${request.method}`
    }
  };
}
