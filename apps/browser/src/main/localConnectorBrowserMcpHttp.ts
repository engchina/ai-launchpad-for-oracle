import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type {
  BrowserMcpApprovalDecision,
  BrowserMcpAuditEventPayload,
  BrowserMcpLocalConnectorResult,
  BrowserMcpRequest
} from "../shared/api";
import { handleLocalConnectorBrowserMcp } from "./localConnectorBrowserMcp";

export const BROWSER_MCP_HTTP_ENDPOINT_PATH = "/mcp";
export const BROWSER_MCP_HTTP_HEALTH_PATH = "/health";
export const BROWSER_MCP_HTTP_STREAM_PATH = "/sse";
const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

type BrowserMcpHttpErrorCode = "invalid_json" | "invalid_request" | "method_not_allowed" | "not_found" | "payload_too_large";

type BrowserMcpHttpErrorBody = {
  ok: false;
  error: {
    code: BrowserMcpHttpErrorCode;
    message: string;
  };
};

export type BrowserMcpHttpRouteInput = {
  method: string;
  pathname: string;
  body?: string;
  endpointPath?: string;
  healthPath?: string;
  streamPath?: string;
  handledAt?: string;
  maxBodyBytes?: number;
  approvalDecisions?: BrowserMcpApprovalDecision[];
};

export type BrowserMcpHttpRouteResult = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  auditEvent?: BrowserMcpAuditEventPayload;
};

export type BrowserMcpHttpServerOptions = {
  endpointPath?: string;
  healthPath?: string;
  streamPath?: string;
  maxBodyBytes?: number;
  now?: () => string;
  onAuditEvent?: (event: BrowserMcpAuditEventPayload) => void | Promise<void>;
  getApprovalDecisions?: () => BrowserMcpApprovalDecision[] | Promise<BrowserMcpApprovalDecision[]>;
};

function createJsonRouteResult(
  statusCode: number,
  payload: BrowserMcpLocalConnectorResult | BrowserMcpHttpErrorBody | Record<string, unknown>,
  auditEvent?: BrowserMcpAuditEventPayload
): BrowserMcpHttpRouteResult {
  return {
    statusCode,
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-origin": "http://127.0.0.1",
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload),
    auditEvent
  };
}

function createNoContentRouteResult(): BrowserMcpHttpRouteResult {
  return {
    statusCode: 204,
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-origin": "http://127.0.0.1"
    },
    body: ""
  };
}

function createSseRouteResult(payload: Record<string, unknown>, auditEvent?: BrowserMcpAuditEventPayload): BrowserMcpHttpRouteResult {
  return {
    statusCode: 200,
    headers: {
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-origin": "http://127.0.0.1",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
      "x-accel-buffering": "no"
    },
    body: [`event: endpoint.status`, `data: ${JSON.stringify(payload)}`, ""].join("\n"),
    auditEvent
  };
}

function createErrorRouteResult(
  statusCode: number,
  code: BrowserMcpHttpErrorCode,
  message: string,
  context?: {
    handledAt: string;
    method: string;
    path: string;
  }
): BrowserMcpHttpRouteResult {
  return createJsonRouteResult(
    statusCode,
    {
      ok: false,
      error: {
        code,
        message
      }
    },
    context
      ? {
          kind: "http_error",
          status: "error",
          occurredAt: context.handledAt,
          httpMethod: context.method,
          path: context.path,
          httpStatus: statusCode,
          errorCode: code,
          message
        }
      : undefined
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBrowserMcpRequest(value: unknown): value is BrowserMcpRequest {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.method === "string" && typeof value.workspaceName === "string";
}

function normalizeMethod(method: string): string {
  return method.trim().toUpperCase();
}

export function handleBrowserMcpHttpRoute(input: BrowserMcpHttpRouteInput): BrowserMcpHttpRouteResult {
  const method = normalizeMethod(input.method);
  const endpointPath = input.endpointPath ?? BROWSER_MCP_HTTP_ENDPOINT_PATH;
  const healthPath = input.healthPath ?? BROWSER_MCP_HTTP_HEALTH_PATH;
  const streamPath = input.streamPath ?? BROWSER_MCP_HTTP_STREAM_PATH;
  const maxBodyBytes = input.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const handledAt = input.handledAt ?? new Date().toISOString();

  if (method === "OPTIONS") {
    return createNoContentRouteResult();
  }

  if (input.pathname === healthPath && method === "GET") {
    return createJsonRouteResult(
      200,
      {
        ok: true,
        connector: "local-connector",
        bridge: "browser-mcp",
        transport: "http",
        endpointPath,
        streamPath,
        handledAt
      },
      {
        kind: "health_check",
        status: "ok",
        occurredAt: handledAt,
        httpMethod: method,
        path: input.pathname,
        httpStatus: 200,
        message: "Browser MCP health check completed."
      }
    );
  }

  if (input.pathname === streamPath) {
    if (method !== "GET") {
      return createErrorRouteResult(405, "method_not_allowed", "Browser MCP SSE preview requires GET.", {
        handledAt,
        method,
        path: input.pathname
      });
    }

    return createSseRouteResult(
      {
        ok: true,
        connector: "local-connector",
        bridge: "browser-mcp",
        transport: "sse",
        endpointPath,
        streamPath,
        handledAt
      },
      {
        kind: "stream_preview",
        status: "ok",
        occurredAt: handledAt,
        httpMethod: method,
        path: input.pathname,
        httpStatus: 200,
        message: "Browser MCP SSE preview served."
      }
    );
  }

  if (input.pathname !== endpointPath) {
    return createErrorRouteResult(404, "not_found", `Unsupported Browser MCP HTTP path: ${input.pathname}`, {
      handledAt,
      method,
      path: input.pathname
    });
  }

  if (method !== "POST") {
    return createErrorRouteResult(405, "method_not_allowed", "Browser MCP HTTP endpoint requires POST.", {
      handledAt,
      method,
      path: input.pathname
    });
  }

  if (!input.body) {
    return createErrorRouteResult(400, "invalid_request", "Browser MCP HTTP request body is required.", {
      handledAt,
      method,
      path: input.pathname
    });
  }

  if (Buffer.byteLength(input.body, "utf8") > maxBodyBytes) {
    return createErrorRouteResult(413, "payload_too_large", "Browser MCP HTTP request body is too large.", {
      handledAt,
      method,
      path: input.pathname
    });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(input.body);
  } catch {
    return createErrorRouteResult(400, "invalid_json", "Browser MCP HTTP request body must be valid JSON.", {
      handledAt,
      method,
      path: input.pathname
    });
  }

  if (!isBrowserMcpRequest(parsedBody)) {
    return createErrorRouteResult(400, "invalid_request", "Browser MCP HTTP request requires id, method, and workspaceName.", {
      handledAt,
      method,
      path: input.pathname
    });
  }

  const result = handleLocalConnectorBrowserMcp(parsedBody, handledAt, {
    approvalDecisions: input.approvalDecisions
  });
  const requestParams: unknown = "params" in parsedBody ? parsedBody.params : undefined;
  const toolId = isRecord(requestParams) && typeof requestParams.toolId === "string" ? requestParams.toolId : undefined;
  const executionStatus = result.summary.executionStatus;
  const status =
    executionStatus === "waiting_approval" || executionStatus === "blocked" ? executionStatus : result.summary.status;

  return createJsonRouteResult(200, result, {
    kind: "mcp_request",
    status,
    occurredAt: handledAt,
    httpMethod: method,
    path: input.pathname,
    httpStatus: 200,
    requestId: parsedBody.id,
    workspaceName: parsedBody.workspaceName,
    mcpMethod: parsedBody.method,
    toolId,
    toolCount: result.summary.toolCount,
    executionStatus,
    approvalDecisionId:
      result.response.ok && result.response.method === "tools/call" ? result.response.result.approvalDecision?.id : undefined,
    approvalDecisionStatus: result.summary.approvalDecisionStatus,
    errorCode: result.summary.errorCode,
    message: `${parsedBody.method} handled by Browser MCP bridge.`
  });
}

async function readRequestBody(request: IncomingMessage, maxBodyBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > maxBodyBytes) {
      throw new Error("payload_too_large");
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function writeRouteResult(response: ServerResponse, routeResult: BrowserMcpHttpRouteResult): void {
  response.writeHead(routeResult.statusCode, routeResult.headers);
  response.end(routeResult.body);
}

async function writeAuditEvent(
  onAuditEvent: BrowserMcpHttpServerOptions["onAuditEvent"],
  event: BrowserMcpAuditEventPayload | undefined
): Promise<void> {
  if (!onAuditEvent || !event) {
    return;
  }

  try {
    await onAuditEvent(event);
  } catch {
    // Audit write failures must not break the local MCP endpoint.
  }
}

export function createBrowserMcpHttpServer(options: BrowserMcpHttpServerOptions = {}): Server {
  const endpointPath = options.endpointPath ?? BROWSER_MCP_HTTP_ENDPOINT_PATH;
  const healthPath = options.healthPath ?? BROWSER_MCP_HTTP_HEALTH_PATH;
  const streamPath = options.streamPath ?? BROWSER_MCP_HTTP_STREAM_PATH;
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const now = options.now ?? (() => new Date().toISOString());
  const onAuditEvent = options.onAuditEvent;
  const getApprovalDecisions = options.getApprovalDecisions;

  return createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");

    try {
      const method = request.method ?? "GET";
      const body = normalizeMethod(method) === "POST" ? await readRequestBody(request, maxBodyBytes) : undefined;
      const approvalDecisions = getApprovalDecisions ? await getApprovalDecisions() : undefined;
      const routeResult = handleBrowserMcpHttpRoute({
        method,
        pathname: requestUrl.pathname,
        body,
        endpointPath,
        healthPath,
        streamPath,
        handledAt: now(),
        maxBodyBytes,
        approvalDecisions
      });

      await writeAuditEvent(onAuditEvent, routeResult.auditEvent);
      writeRouteResult(response, routeResult);
    } catch (error) {
      const method = request.method ?? "GET";
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const routeResult =
        error instanceof Error && error.message === "payload_too_large"
          ? createErrorRouteResult(413, "payload_too_large", "Browser MCP HTTP request body is too large.", {
              handledAt: now(),
              method: normalizeMethod(method),
              path: requestUrl.pathname
            })
          : createErrorRouteResult(500, "invalid_request", "Browser MCP HTTP request failed.", {
              handledAt: now(),
              method: normalizeMethod(method),
              path: requestUrl.pathname
            });
      await writeAuditEvent(onAuditEvent, routeResult.auditEvent);
      writeRouteResult(response, routeResult);
    }
  });
}
