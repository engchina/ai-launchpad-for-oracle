import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createOracleVectorSearchReadinessChecks } from "./oracleVectorSearchReadiness";

test("createOracleVectorSearchReadinessChecks maps SQLcl and wallet probe results", () => {
  const checks = createOracleVectorSearchReadinessChecks(
    {
      status: "ready",
      profile: "DEFAULT",
      configPath: "C:\\Users\\demo\\.oci\\config",
      keyFilePath: "C:\\Users\\demo\\.oci\\oci_api_key.pem",
      message: "OCI config と key_file を確認しました。",
      checks: [
        {
          name: "config_file",
          ok: true,
          message: "OCI config file を読み取りました。"
        }
      ]
    },
    {
      status: "ready",
      executablePath: "C:\\oracle\\sqlcl\\bin\\sql.exe",
      message: "SQLcl executable を確認しました。",
      checks: [
        {
          name: "sqlcl_path",
          ok: true,
          message: "SQLCL_PATH の executable は読み取り可能です。"
        }
      ]
    },
    {
      status: "invalid",
      walletPath: "C:\\wallets\\missing",
      message: "ADB wallet path を読み取れません。"
    }
  );

  assert.deepEqual(checks, [
    {
      name: "OCI config",
      status: "ready",
      message: "OCI config と key_file を確認しました。",
      path: "C:\\Users\\demo\\.oci\\config",
      checks: [
        {
          name: "config_file",
          ok: true,
          message: "OCI config file を読み取りました。"
        }
      ]
    },
    {
      name: "SQLcl",
      status: "ready",
      message: "SQLcl executable を確認しました。",
      path: "C:\\oracle\\sqlcl\\bin\\sql.exe",
      checks: [
        {
          name: "sqlcl_path",
          ok: true,
          message: "SQLCL_PATH の executable は読み取り可能です。"
        }
      ]
    },
    {
      name: "ADB wallet",
      status: "invalid",
      message: "ADB wallet path を読み取れません。",
      path: "C:\\wallets\\missing"
    }
  ]);
});
