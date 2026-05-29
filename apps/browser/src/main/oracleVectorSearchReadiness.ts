import type { AdbWalletCheckResult, OciCheckConfigResult, SqlclCheckResult } from "../shared/api";
import type { OracleVectorSearchReadinessCheck } from "../shared/oracleVectorSearch";

function mapProbeChecks(
  checks?: Array<{
    name: string;
    ok: boolean;
    message: string;
  }>
): Pick<OracleVectorSearchReadinessCheck, "checks"> {
  return checks && checks.length > 0 ? { checks } : {};
}

export function createOracleVectorSearchReadinessChecks(
  ociConfig: OciCheckConfigResult,
  sqlcl: SqlclCheckResult,
  adbWallet: AdbWalletCheckResult
): OracleVectorSearchReadinessCheck[] {
  return [
    {
      name: "OCI config",
      status: ociConfig.status,
      message: ociConfig.message,
      path: ociConfig.configPath,
      ...mapProbeChecks(ociConfig.checks)
    },
    {
      name: "SQLcl",
      status: sqlcl.status,
      message: sqlcl.message,
      path: sqlcl.executablePath,
      ...mapProbeChecks(sqlcl.checks)
    },
    {
      name: "ADB wallet",
      status: adbWallet.status,
      message: adbWallet.message,
      path: adbWallet.walletPath,
      ...mapProbeChecks(adbWallet.checks)
    }
  ];
}
