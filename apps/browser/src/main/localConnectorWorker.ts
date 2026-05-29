import type {
  GeneratePocAssetsPayload,
  LocalConnectorHealth,
  OracleVectorSearchExecutionPayload,
  OracleVectorSearchExecutionResult
} from "../shared/api";
import { executeOracleVectorSearchDryRun } from "../shared/oracleVectorSearch";
import { checkAdbWallet } from "./adbWalletProbe";
import { checkObjectStorage } from "./objectStorageProbe";
import { checkOciConfig as probeOciConfig } from "./ociConfigProbe";
import { generatePocAssets } from "./pocAssetGenerator";
import { createOracleVectorSearchReadinessChecks } from "./oracleVectorSearchReadiness";
import { executeLiveOracleVectorSearch } from "./oracleVectorSearchExecutor";
import { checkSqlcl } from "./sqlclProbe";
import type {
  LocalConnectorRequest,
  LocalConnectorRequestType,
  LocalConnectorResponse,
  LocalConnectorResponsePayloadByType
} from "./localConnectorProtocol";

type ParentPortMessageEvent = {
  data: unknown;
};

const connectorParentPort = process.parentPort;

if (!connectorParentPort) {
  throw new Error("Local Connector worker requires Electron utility process parentPort.");
}

function createHealth(): LocalConnectorHealth {
  return {
    status: "mock-ready",
    connector: "local-connector",
    mode: "not-connected",
    message: "Local Connector worker process は起動済みです。OCI / Oracle DB adapter はまだ接続していません。"
  };
}

async function executeOracleVectorSearchWithReadiness(
  payload: OracleVectorSearchExecutionPayload
): Promise<OracleVectorSearchExecutionResult> {
  const execution = executeOracleVectorSearchDryRun(payload);

  if (execution.status !== "dry_run") {
    return execution;
  }

  const [ociConfig, sqlcl, adbWallet] = await Promise.all([probeOciConfig(), checkSqlcl(), checkAdbWallet()]);
  const readinessChecks = createOracleVectorSearchReadinessChecks(ociConfig, sqlcl, adbWallet);

  // plan が valid な場合のみ live 実行を試みる。credential / driver 未整備なら dry-run に fallback する。
  if (execution.plan) {
    const live = await executeLiveOracleVectorSearch(execution.plan, payload.question, process.env);
    if (live.ok) {
      return {
        ...execution,
        status: "executed",
        message: "Oracle Vector Search を Oracle AI Database に対して実行しました。",
        rows: live.rows,
        readinessChecks,
        executedAt: new Date().toISOString()
      };
    }

    return {
      ...execution,
      readinessChecks,
      validationErrors: [...(execution.validationErrors ?? []), `live 実行は fallback しました: ${live.reason}`]
    };
  }

  return {
    ...execution,
    readinessChecks
  };
}

async function handleRequest<T extends LocalConnectorRequestType>(
  request: Extract<LocalConnectorRequest, { type: T }>
): Promise<LocalConnectorResponsePayloadByType[T]> {
  if (request.type === "health") {
    return createHealth() as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "ociCheckConfig") {
    return (await probeOciConfig()) as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "sqlclCheck") {
    return (await checkSqlcl()) as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "adbWalletCheck") {
    return (await checkAdbWallet()) as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "objectStorageCheck") {
    return checkObjectStorage() as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "generatePocAssets" && request.payload) {
    return generatePocAssets(request.payload as GeneratePocAssetsPayload) as LocalConnectorResponsePayloadByType[T];
  }

  if (request.type === "oracleVectorSearch" && request.payload) {
    return (await executeOracleVectorSearchWithReadiness(
      request.payload as OracleVectorSearchExecutionPayload
    )) as LocalConnectorResponsePayloadByType[T];
  }

  throw new Error(`Unsupported Local Connector request: ${String(request.type)}`);
}

connectorParentPort.on("message", async (event: ParentPortMessageEvent) => {
  const request = event.data as LocalConnectorRequest;

  try {
    const response = {
      requestId: request.requestId,
      type: request.type,
      ok: true,
      payload: await handleRequest(request)
    } as LocalConnectorResponse;
    connectorParentPort.postMessage(response);
  } catch (error) {
    const response: LocalConnectorResponse = {
      requestId: request.requestId,
      type: request.type,
      ok: false,
      error: {
        message: error instanceof Error ? error.message : "Local Connector worker request failed."
      }
    };
    connectorParentPort.postMessage(response);
  }
});
