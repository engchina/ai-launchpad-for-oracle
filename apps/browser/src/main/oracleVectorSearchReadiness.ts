import type { AdbWalletCheckResult, SqlclCheckResult } from "../shared/api";
import type { OracleVectorSearchReadinessCheck } from "../shared/oracleVectorSearch";

export function createOracleVectorSearchReadinessChecks(
  sqlcl: SqlclCheckResult,
  adbWallet: AdbWalletCheckResult
): OracleVectorSearchReadinessCheck[] {
  return [
    {
      name: "SQLcl",
      status: sqlcl.status,
      message: sqlcl.message,
      path: sqlcl.executablePath
    },
    {
      name: "ADB wallet",
      status: adbWallet.status,
      message: adbWallet.message,
      path: adbWallet.walletPath
    }
  ];
}
