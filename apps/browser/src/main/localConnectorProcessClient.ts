import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { utilityProcess, type UtilityProcess } from "electron";
import type {
  GeneratePocAssetsPayload,
  GeneratePocAssetsResult,
  LocalConnectorHealth,
} from "../shared/api";
import type {
  LocalConnectorRequestFor,
  LocalConnectorRequestPayloadByType,
  LocalConnectorRequestType,
  LocalConnectorResponse,
  LocalConnectorResponsePayloadByType
} from "./localConnectorProtocol";

type PendingRequest<T extends LocalConnectorRequestType = LocalConnectorRequestType> = {
  resolve: (payload: LocalConnectorResponsePayloadByType[T]) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

const LOCAL_CONNECTOR_TIMEOUT_MS = 5_000;

export class LocalConnectorProcessClient {
  private worker: UtilityProcess | null = null;
  private pendingRequests = new Map<string, PendingRequest>();

  health(): Promise<LocalConnectorHealth> {
    return this.request("health", undefined);
  }

  generatePocAssets(payload: GeneratePocAssetsPayload): Promise<GeneratePocAssetsResult> {
    return this.request("generatePocAssets", payload);
  }

  dispose(): void {
    const worker = this.worker;
    this.worker = null;

    for (const [requestId, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timeout);
      pendingRequest.reject(new Error("Local Connector process was disposed."));
      this.pendingRequests.delete(requestId);
    }

    worker?.kill();
  }

  private request<T extends LocalConnectorRequestType>(
    type: T,
    payload: LocalConnectorRequestPayloadByType[T]
  ): Promise<LocalConnectorResponsePayloadByType[T]> {
    const requestId = randomUUID();
    const request: LocalConnectorRequestFor<T> = {
      requestId,
      type,
      payload
    };
    const worker = this.ensureWorker();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Local Connector request timed out: ${type}`));
      }, LOCAL_CONNECTOR_TIMEOUT_MS);

      this.pendingRequests.set(requestId, {
        resolve: resolve as PendingRequest["resolve"],
        reject,
        timeout
      });
      worker.postMessage(request);
    });
  }

  private ensureWorker(): UtilityProcess {
    if (this.worker?.pid) {
      return this.worker;
    }

    const workerPath = join(__dirname, "localConnectorWorker.js");
    const worker = utilityProcess.fork(workerPath, [], {
      serviceName: "AI Launchpad Local Connector",
      stdio: "pipe"
    });

    worker.on("message", (message) => this.handleWorkerMessage(message as LocalConnectorResponse));
    worker.on("exit", (code) => this.handleWorkerExit(code));
    worker.stdout?.on("data", (chunk) => {
      console.info(`[local-connector] ${chunk.toString().trim()}`);
    });
    worker.stderr?.on("data", (chunk) => {
      console.warn(`[local-connector] ${chunk.toString().trim()}`);
    });

    this.worker = worker;
    return worker;
  }

  private handleWorkerMessage(response: LocalConnectorResponse): void {
    const pendingRequest = this.pendingRequests.get(response.requestId);
    if (!pendingRequest) {
      return;
    }

    clearTimeout(pendingRequest.timeout);
    this.pendingRequests.delete(response.requestId);

    if (response.ok) {
      pendingRequest.resolve(response.payload);
      return;
    }

    pendingRequest.reject(new Error(response.error.message));
  }

  private handleWorkerExit(code: number): void {
    this.worker = null;

    for (const [requestId, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timeout);
      pendingRequest.reject(new Error(`Local Connector process exited with code ${code}.`));
      this.pendingRequests.delete(requestId);
    }
  }
}
