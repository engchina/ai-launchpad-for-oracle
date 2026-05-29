import type {
  BrowserMcpLocalConnectorResult,
  BrowserMcpLocalConnectorSummary,
  BrowserMcpRequest,
  BrowserMcpResponse
} from "../shared/api";
import { handleBrowserMcpRequest, type BrowserMcpRequestOptions } from "../shared/browserMcpProtocol";

function summarizeBrowserMcpResponse(response: BrowserMcpResponse, handledAt: string): BrowserMcpLocalConnectorSummary {
  const baseSummary = {
    connector: "local-connector" as const,
    bridge: "browser-mcp" as const,
    requestId: response.id,
    method: response.method,
    handledAt
  };

  if (!response.ok) {
    return {
      ...baseSummary,
      status: "error",
      errorCode: response.error.code
    };
  }

  if (response.method === "tools/list") {
    return {
      ...baseSummary,
      status: "ok",
      toolCount: response.result.tools.length
    };
  }

  return {
    ...baseSummary,
    status: "ok",
    executionStatus: response.result.execution.status,
    approvalDecisionStatus: response.result.approvalDecision?.status
  };
}

export function handleLocalConnectorBrowserMcp(
  request: BrowserMcpRequest,
  handledAt = new Date().toISOString(),
  options: BrowserMcpRequestOptions = {}
): BrowserMcpLocalConnectorResult {
  const response = handleBrowserMcpRequest(request, undefined, options);

  return {
    response,
    summary: summarizeBrowserMcpResponse(response, handledAt)
  };
}
