import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createOracleVectorSearchReadinessChecks } from "./oracleVectorSearchReadiness";

test("createOracleVectorSearchReadinessChecks maps SQLcl and wallet probe results", () => {
  const checks = createOracleVectorSearchReadinessChecks(
    {
      status: "ready",
      executablePath: "C:\\oracle\\sqlcl\\bin\\sql.exe",
      message: "SQLcl executable を確認しました。"
    },
    {
      status: "invalid",
      walletPath: "C:\\wallets\\missing",
      message: "ADB wallet path を読み取れません。"
    }
  );

  assert.deepEqual(checks, [
    {
      name: "SQLcl",
      status: "ready",
      message: "SQLcl executable を確認しました。",
      path: "C:\\oracle\\sqlcl\\bin\\sql.exe"
    },
    {
      name: "ADB wallet",
      status: "invalid",
      message: "ADB wallet path を読み取れません。",
      path: "C:\\wallets\\missing"
    }
  ]);
});
