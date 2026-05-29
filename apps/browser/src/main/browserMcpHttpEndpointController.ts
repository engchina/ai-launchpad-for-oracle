import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import type {
  BrowserMcpApprovalDecisionPayload,
  BrowserMcpAuditEventPayload,
  BrowserMcpEndpointConfig,
  BrowserMcpEndpointStartPayload,
  BrowserMcpEndpointState,
  ClearBrowserMcpApprovalDecisionsResult,
  ClearBrowserMcpAuditEventsResult,
  ListBrowserMcpApprovalDecisionsResult,
  ListBrowserMcpAuditEventsResult,
  SaveBrowserMcpApprovalDecisionResult
} from "../shared/api";
import {
  BROWSER_MCP_HTTP_ENDPOINT_PATH,
  BROWSER_MCP_HTTP_HEALTH_PATH,
  BROWSER_MCP_HTTP_STREAM_PATH,
  createBrowserMcpHttpServer
} from "./localConnectorBrowserMcpHttp";
import {
  appendBrowserMcpAuditEvent,
  clearBrowserMcpAuditEvents,
  listBrowserMcpAuditEvents
} from "./localBrowserMcpAuditStore";
import {
  clearBrowserMcpApprovalDecisions,
  listBrowserMcpApprovalDecisions,
  upsertBrowserMcpApprovalDecision
} from "./localBrowserMcpApprovalStore";

const BROWSER_MCP_HTTP_HOST: BrowserMcpEndpointConfig["host"] = "127.0.0.1";
const DEFAULT_BROWSER_MCP_HTTP_PORT = 9239;

function normalizePath(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return fallback;
  }

  return trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;
}

function normalizePort(value: number | undefined): number {
  const port = value ?? DEFAULT_BROWSER_MCP_HTTP_PORT;

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("Browser MCP endpoint port must be an integer between 0 and 65535.");
  }

  return port;
}

function createConfig(payload: BrowserMcpEndpointStartPayload = {}): BrowserMcpEndpointConfig {
  return {
    host: BROWSER_MCP_HTTP_HOST,
    port: normalizePort(payload.port),
    endpointPath: normalizePath(payload.endpointPath, BROWSER_MCP_HTTP_ENDPOINT_PATH),
    healthPath: normalizePath(payload.healthPath, BROWSER_MCP_HTTP_HEALTH_PATH),
    streamPath: normalizePath(payload.streamPath, BROWSER_MCP_HTTP_STREAM_PATH)
  };
}

function createUrl(config: BrowserMcpEndpointConfig, path: string): string {
  return `http://${config.host}:${config.port}${path}`;
}

function createState(patch: Omit<BrowserMcpEndpointState, "config"> & { config?: BrowserMcpEndpointConfig }): BrowserMcpEndpointState {
  const config = patch.config ?? createConfig();

  return {
    ...patch,
    config,
    url: patch.status === "running" ? createUrl(config, config.endpointPath) : undefined,
    healthUrl: patch.status === "running" ? createUrl(config, config.healthPath) : undefined,
    streamUrl: patch.status === "running" ? createUrl(config, config.streamPath) : undefined
  };
}

async function listen(server: Server, config: BrowserMcpEndpointConfig): Promise<BrowserMcpEndpointConfig> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address() as AddressInfo;

  return {
    ...config,
    port: address.port
  };
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

type BrowserMcpHttpEndpointControllerOptions = {
  getStoreBaseDir?: () => string;
  now?: () => string;
};

export class BrowserMcpHttpEndpointController {
  private readonly getStoreBaseDir?: () => string;
  private readonly now: () => string;
  private server: Server | null = null;
  private sessionId: string | undefined;
  private state: BrowserMcpEndpointState = createState({
    status: "stopped",
    message: "Browser MCP HTTP endpoint は停止中です。"
  });

  constructor(options: BrowserMcpHttpEndpointControllerOptions = {}) {
    this.getStoreBaseDir = options.getStoreBaseDir;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  status(): BrowserMcpEndpointState {
    return this.state;
  }

  async listAuditEvents(): Promise<ListBrowserMcpAuditEventsResult> {
    if (!this.getStoreBaseDir) {
      return {
        events: []
      };
    }

    return {
      events: await listBrowserMcpAuditEvents(this.getStoreBaseDir())
    };
  }

  async clearAuditEvents(): Promise<ClearBrowserMcpAuditEventsResult> {
    if (this.getStoreBaseDir) {
      await clearBrowserMcpAuditEvents(this.getStoreBaseDir());
    }

    return {
      ok: true,
      clearedAt: this.now()
    };
  }

  async listApprovalDecisions(): Promise<ListBrowserMcpApprovalDecisionsResult> {
    if (!this.getStoreBaseDir) {
      return {
        decisions: []
      };
    }

    return {
      decisions: await listBrowserMcpApprovalDecisions(this.getStoreBaseDir())
    };
  }

  async saveApprovalDecision(payload: BrowserMcpApprovalDecisionPayload): Promise<SaveBrowserMcpApprovalDecisionResult> {
    if (!this.getStoreBaseDir) {
      return {
        decision: {
          ...payload,
          id: payload.id ?? `mcp-approval-decision-${payload.auditEventId}-${payload.status}`
        }
      };
    }

    return {
      decision: await upsertBrowserMcpApprovalDecision(this.getStoreBaseDir(), payload)
    };
  }

  async clearApprovalDecisions(): Promise<ClearBrowserMcpApprovalDecisionsResult> {
    if (this.getStoreBaseDir) {
      await clearBrowserMcpApprovalDecisions(this.getStoreBaseDir());
    }

    return {
      ok: true,
      clearedAt: this.now()
    };
  }

  private async appendAuditEvent(payload: BrowserMcpAuditEventPayload): Promise<void> {
    if (!this.getStoreBaseDir) {
      return;
    }

    await appendBrowserMcpAuditEvent(this.getStoreBaseDir(), payload);
  }

  async start(payload: BrowserMcpEndpointStartPayload = {}): Promise<BrowserMcpEndpointState> {
    if (this.server) {
      return this.state;
    }

    let config: BrowserMcpEndpointConfig;
    try {
      config = createConfig(payload);
    } catch (error) {
      this.state = createState({
        status: "error",
        message: "Browser MCP HTTP endpoint の設定が不正です。",
        error: error instanceof Error ? error.message : "Browser MCP endpoint configuration failed."
      });
      return this.state;
    }

    const sessionId = `browser-mcp-${randomUUID()}`;
    this.sessionId = sessionId;
    this.state = createState({
      status: "starting",
      config,
      sessionId,
      message: "Browser MCP HTTP endpoint を起動しています。"
    });

    const server = createBrowserMcpHttpServer({
      endpointPath: config.endpointPath,
      healthPath: config.healthPath,
      streamPath: config.streamPath,
      now: this.now,
      getApprovalDecisions: () => (this.getStoreBaseDir ? listBrowserMcpApprovalDecisions(this.getStoreBaseDir()) : []),
      onAuditEvent: (event) =>
        this.appendAuditEvent({
          ...event,
          sessionId
        })
    });

    try {
      const runningConfig = await listen(server, config);
      this.server = server;
      const startedAt = this.now();
      this.state = createState({
        status: "running",
        config: runningConfig,
        sessionId,
        startedAt,
        message: "Browser MCP HTTP endpoint は 127.0.0.1 で起動中です。"
      });
      await this.appendAuditEvent({
        kind: "endpoint_started",
        status: "ok",
        occurredAt: startedAt,
        sessionId,
        httpMethod: "LISTEN",
        path: runningConfig.endpointPath,
        httpStatus: 200,
        message: `Browser MCP HTTP endpoint started on ${runningConfig.host}:${runningConfig.port}.`
      });
      server.on("error", (error) => {
        const occurredAt = this.now();
        this.state = createState({
          status: "error",
          config: runningConfig,
          sessionId,
          message: "Browser MCP HTTP endpoint でエラーが発生しました。",
          error: error.message
        });
        void this.appendAuditEvent({
          kind: "endpoint_error",
          status: "error",
          occurredAt,
          sessionId,
          errorCode: "server_error",
          message: error.message
        });
      });
      return this.state;
    } catch (error) {
      this.server = null;
      const occurredAt = this.now();
      this.state = createState({
        status: "error",
        config,
        sessionId,
        message: "Browser MCP HTTP endpoint を起動できませんでした。",
        error: error instanceof Error ? error.message : "Browser MCP endpoint start failed."
      });
      await this.appendAuditEvent({
        kind: "endpoint_error",
        status: "error",
        occurredAt,
        sessionId,
        errorCode: "start_failed",
        message: this.state.error
      });
      return this.state;
    }
  }

  async stop(): Promise<BrowserMcpEndpointState> {
    const server = this.server;
    const sessionId = this.sessionId;
    this.server = null;
    this.sessionId = undefined;

    if (!server) {
      this.state = createState({
        status: "stopped",
        config: this.state.config,
        stoppedAt: this.now(),
        message: "Browser MCP HTTP endpoint は停止中です。"
      });
      return this.state;
    }

    await close(server);
    const stoppedAt = this.now();
    this.state = createState({
      status: "stopped",
      config: this.state.config,
      stoppedAt,
      message: "Browser MCP HTTP endpoint を停止しました。"
    });
    await this.appendAuditEvent({
      kind: "endpoint_stopped",
      status: "ok",
      occurredAt: stoppedAt,
      sessionId,
      httpMethod: "CLOSE",
      path: this.state.config.endpointPath,
      httpStatus: 200,
      message: "Browser MCP HTTP endpoint stopped."
    });
    return this.state;
  }

  async dispose(): Promise<void> {
    await this.stop();
  }
}
