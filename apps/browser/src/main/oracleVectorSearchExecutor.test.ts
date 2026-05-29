import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { OracleVectorSearchPlan } from "../shared/oracleVectorSearch";
import {
  ORACLE_VECTOR_LIVE_ENV_FLAG,
  buildLiveVectorSearchSql,
  executeLiveOracleVectorSearch,
  resolveLiveOracleVectorReadiness
} from "./oracleVectorSearchExecutor";

const basePlan: OracleVectorSearchPlan = {
  connectionName: "ADB_DEMO",
  tableName: "DEMO.KNOWLEDGE_CHUNKS",
  vectorColumn: "VECTOR_EMBEDDING",
  textColumn: "CHUNK_TEXT",
  embeddingModel: "DEMO_EMBED_MODEL",
  topK: 3,
  sqlPreview: "",
  sqlclScriptPreview: "",
  bindVariables: []
};

test("resolveLiveOracleVectorReadiness は flag 未設定なら disabled", () => {
  const readiness = resolveLiveOracleVectorReadiness({});
  assert.equal(readiness.enabled, false);
  assert.deepEqual(readiness, { enabled: false, reason: "disabled", missing: [ORACLE_VECTOR_LIVE_ENV_FLAG] });
});

test("resolveLiveOracleVectorReadiness は flag 有効でも credential 不足なら incomplete", () => {
  const readiness = resolveLiveOracleVectorReadiness({ [ORACLE_VECTOR_LIVE_ENV_FLAG]: "1" });
  assert.equal(readiness.enabled, false);
  assert.deepEqual(readiness, {
    enabled: false,
    reason: "incomplete",
    missing: ["ORACLE_VECTOR_USER", "ORACLE_VECTOR_PASSWORD", "ORACLE_VECTOR_CONNECT_STRING"]
  });
});

test("resolveLiveOracleVectorReadiness は全 credential が揃うと enabled", () => {
  const readiness = resolveLiveOracleVectorReadiness({
    [ORACLE_VECTOR_LIVE_ENV_FLAG]: "true",
    ORACLE_VECTOR_USER: "demo",
    ORACLE_VECTOR_PASSWORD: "secret",
    ORACLE_VECTOR_CONNECT_STRING: "adb_high",
    ORACLE_VECTOR_WALLET_DIR: "C:/wallets/demo"
  });
  assert.equal(readiness.enabled, true);
  if (readiness.enabled) {
    assert.equal(readiness.credentials.user, "demo");
    assert.equal(readiness.credentials.connectString, "adb_high");
    assert.equal(readiness.credentials.walletDir, "C:/wallets/demo");
  }
});

test("buildLiveVectorSearchSql は in-DB embedding を使う VECTOR_DISTANCE クエリを生成", () => {
  const result = buildLiveVectorSearchSql(basePlan);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.match(result.sql, /VECTOR_EMBEDDING\(DEMO_EMBED_MODEL USING :query_text AS data\)/);
    assert.match(result.sql, /VECTOR_DISTANCE\(VECTOR_EMBEDDING, /);
    assert.match(result.sql, /FROM DEMO\.KNOWLEDGE_CHUNKS/);
    assert.match(result.sql, /FETCH FIRST 3 ROWS ONLY/);
  }
});

test("buildLiveVectorSearchSql は安全でない embedding model を拒否", () => {
  const result = buildLiveVectorSearchSql({ ...basePlan, embeddingModel: "model; DROP TABLE" });
  assert.equal(result.ok, false);
});

test("executeLiveOracleVectorSearch は live 無効時に fallback 理由を返す", async () => {
  const execution = await executeLiveOracleVectorSearch(basePlan, "Oracle Vector Search とは", {});
  assert.equal(execution.ok, false);
  if (!execution.ok) {
    assert.match(execution.reason, new RegExp(ORACLE_VECTOR_LIVE_ENV_FLAG));
  }
});
