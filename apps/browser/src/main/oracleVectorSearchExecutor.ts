import type { OracleVectorSearchPlan, OracleVectorSearchRow } from "../shared/oracleVectorSearch";

// Oracle AI Database 26ai の Vector Search を Local Connector worker から実行するための
// optional な live executor。oracledb driver と接続 credential は connector 側 (env) にのみ保持し、
// LLM prompt / renderer / UI には返さない。driver 未インストールや credential 未設定の場合は
// graceful に live=false を返し、呼び出し側は既存の dry-run 契約へ fallback する。

export const ORACLE_VECTOR_LIVE_ENV_FLAG = "AI_LAUNCHPAD_ORACLE_VECTOR_LIVE";

export type OracleVectorEnv = Record<string, string | undefined>;

export type OracleVectorLiveCredentials = {
  user: string;
  password: string;
  connectString: string;
  walletDir?: string;
  walletPassword?: string;
};

export type OracleVectorLiveReadiness =
  | { enabled: false; reason: "disabled" | "incomplete"; missing: string[] }
  | { enabled: true; credentials: OracleVectorLiveCredentials };

export type OracleVectorLiveExecution =
  | { ok: true; rows: OracleVectorSearchRow[] }
  | { ok: false; reason: string };

const requiredCredentialEnv: Array<{ key: string; label: string }> = [
  { key: "ORACLE_VECTOR_USER", label: "ORACLE_VECTOR_USER" },
  { key: "ORACLE_VECTOR_PASSWORD", label: "ORACLE_VECTOR_PASSWORD" },
  { key: "ORACLE_VECTOR_CONNECT_STRING", label: "ORACLE_VECTOR_CONNECT_STRING" }
];

const oracleIdentifierPathPattern = /^[A-Za-z][A-Za-z0-9_$#]*(\.[A-Za-z][A-Za-z0-9_$#]*)*$/;

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function readEnv(env: OracleVectorEnv, key: string): string {
  return (env[key] ?? "").trim();
}

export function resolveLiveOracleVectorReadiness(env: OracleVectorEnv): OracleVectorLiveReadiness {
  if (!isTruthyFlag(env[ORACLE_VECTOR_LIVE_ENV_FLAG])) {
    return { enabled: false, reason: "disabled", missing: [ORACLE_VECTOR_LIVE_ENV_FLAG] };
  }

  const missing = requiredCredentialEnv.filter(({ key }) => !readEnv(env, key)).map(({ label }) => label);
  if (missing.length > 0) {
    return { enabled: false, reason: "incomplete", missing };
  }

  const walletDir = readEnv(env, "ORACLE_VECTOR_WALLET_DIR");
  const walletPassword = readEnv(env, "ORACLE_VECTOR_WALLET_PASSWORD");

  return {
    enabled: true,
    credentials: {
      user: readEnv(env, "ORACLE_VECTOR_USER"),
      password: readEnv(env, "ORACLE_VECTOR_PASSWORD"),
      connectString: readEnv(env, "ORACLE_VECTOR_CONNECT_STRING"),
      ...(walletDir ? { walletDir } : {}),
      ...(walletPassword ? { walletPassword } : {})
    }
  };
}

// plan の table / vector column / text column は呼び出し前に Oracle identifier として検証済み。
// embedding model 名は VECTOR_EMBEDDING 構文の一部となるため、ここで identifier として再検証する。
export function buildLiveVectorSearchSql(
  plan: OracleVectorSearchPlan
): { ok: true; sql: string } | { ok: false; error: string } {
  if (!oracleIdentifierPathPattern.test(plan.embeddingModel)) {
    return {
      ok: false,
      error: "embedding model は Oracle identifier 形式で指定してください。live 実行を中止しました。"
    };
  }
  if (!oracleIdentifierPathPattern.test(plan.tableName) || !oracleIdentifierPathPattern.test(plan.vectorColumn) || !oracleIdentifierPathPattern.test(plan.textColumn)) {
    return {
      ok: false,
      error: "table / vector column / text column が安全な identifier ではありません。live 実行を中止しました。"
    };
  }

  const topK = Math.max(1, Math.min(Math.trunc(plan.topK), 20));
  const sql = [
    "SELECT",
    `  ${plan.textColumn} AS CHUNK_TEXT,`,
    `  VECTOR_DISTANCE(${plan.vectorColumn}, VECTOR_EMBEDDING(${plan.embeddingModel} USING :query_text AS data), COSINE) AS DISTANCE`,
    `FROM ${plan.tableName}`,
    "ORDER BY DISTANCE",
    `FETCH FIRST ${topK} ROWS ONLY`
  ].join("\n");

  return { ok: true, sql };
}

type OracleDbConnectionLike = {
  execute: (
    sql: string,
    binds: Record<string, unknown>,
    options: Record<string, unknown>
  ) => Promise<{ rows?: Array<Record<string, unknown>> }>;
  close: () => Promise<void>;
};

type OracleDbModuleLike = {
  getConnection: (attrs: Record<string, unknown>) => Promise<OracleDbConnectionLike>;
  fetchAsString?: unknown[];
  CLOB?: unknown;
  OUT_FORMAT_OBJECT?: number;
};

async function loadOracleDbModule(): Promise<OracleDbModuleLike | null> {
  // 変数経由の dynamic import にして、未インストール環境でも型解決・bundle 解決を強制しない。
  const moduleName: string = "oracledb";
  try {
    const imported = (await import(moduleName)) as { default?: OracleDbModuleLike } & OracleDbModuleLike;
    return imported.default ?? imported;
  } catch {
    return null;
  }
}

function mapRow(row: Record<string, unknown>): OracleVectorSearchRow {
  const chunkText = row.CHUNK_TEXT ?? row.chunk_text ?? "";
  const distanceValue = row.DISTANCE ?? row.distance;
  const distance = typeof distanceValue === "number" ? distanceValue : Number(distanceValue);
  return {
    chunkText: typeof chunkText === "string" ? chunkText : String(chunkText ?? ""),
    ...(Number.isFinite(distance) ? { distance } : {})
  };
}

export async function executeLiveOracleVectorSearch(
  plan: OracleVectorSearchPlan,
  question: string,
  env: OracleVectorEnv
): Promise<OracleVectorLiveExecution> {
  const readiness = resolveLiveOracleVectorReadiness(env);
  if (!readiness.enabled) {
    return {
      ok: false,
      reason:
        readiness.reason === "disabled"
          ? `${ORACLE_VECTOR_LIVE_ENV_FLAG} が未設定のため live 実行は無効です。`
          : `live 実行に必要な credential が不足しています: ${readiness.missing.join(", ")}`
    };
  }

  const sqlResult = buildLiveVectorSearchSql(plan);
  if (!sqlResult.ok) {
    return { ok: false, reason: sqlResult.error };
  }

  const oracledb = await loadOracleDbModule();
  if (!oracledb) {
    return { ok: false, reason: "oracledb driver が未インストールです。`pnpm add oracledb` で live 実行を有効化できます。" };
  }

  if (oracledb.CLOB !== undefined) {
    oracledb.fetchAsString = [oracledb.CLOB];
  }

  const { credentials } = readiness;
  let connection: OracleDbConnectionLike | null = null;
  try {
    connection = await oracledb.getConnection({
      user: credentials.user,
      password: credentials.password,
      connectString: credentials.connectString,
      ...(credentials.walletDir ? { configDir: credentials.walletDir, walletLocation: credentials.walletDir } : {}),
      ...(credentials.walletPassword ? { walletPassword: credentials.walletPassword } : {})
    });

    const result = await connection.execute(
      sqlResult.sql,
      { query_text: question },
      { outFormat: oracledb.OUT_FORMAT_OBJECT ?? 4002 }
    );

    return { ok: true, rows: (result.rows ?? []).map(mapRow) };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Oracle Vector Search の live 実行に失敗しました。"
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch {
        // close 失敗は live 結果に影響させない。
      }
    }
  }
}
