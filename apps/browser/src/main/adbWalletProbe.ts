import { access, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { AdbWalletCheckResult } from "../shared/api";

export type AdbWalletProbeOptions = {
  walletPath?: string;
  tnsAdmin?: string;
  cwd?: string;
};

const requiredWalletFiles = ["tnsnames.ora", "sqlnet.ora", "ewallet.pem"];

function normalizePath(path: string, options: AdbWalletProbeOptions): string {
  if (path === "~" || path.startsWith("~/") || path.startsWith("~\\")) {
    return path;
  }

  if (isAbsolute(path)) {
    return path;
  }

  return resolve(options.cwd ?? process.cwd(), path);
}

async function canReadPath(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function getWalletPath(options: AdbWalletProbeOptions): string | undefined {
  return options.walletPath ?? process.env.ADB_WALLET_PATH ?? options.tnsAdmin ?? process.env.TNS_ADMIN;
}

function isWalletZip(path: string): boolean {
  return path.toLowerCase().endsWith(".zip");
}

export async function checkAdbWallet(options: AdbWalletProbeOptions = {}): Promise<AdbWalletCheckResult> {
  const configuredPath = getWalletPath(options);

  if (!configuredPath) {
    return {
      status: "not-configured",
      message: "ADB wallet path が未設定です。ADB_WALLET_PATH または TNS_ADMIN を設定してください。",
      checks: [
        {
          name: "wallet_path",
          ok: false,
          message: "ADB wallet path が設定されていません。"
        }
      ]
    };
  }

  const walletPath = normalizePath(configuredPath, options);
  if (!(await canReadPath(walletPath))) {
    return {
      status: "invalid",
      walletPath,
      message: `ADB wallet path を読み取れません: ${walletPath}`,
      checks: [
        {
          name: "wallet_path",
          ok: false,
          message: "ADB wallet path を読み取れません。"
        }
      ]
    };
  }

  const walletStat = await stat(walletPath);
  if (walletStat.isFile()) {
    const isZip = isWalletZip(walletPath);
    return {
      status: isZip ? "ready" : "invalid",
      walletPath,
      message: isZip
        ? "ADB wallet zip を確認しました。zip の展開や DB 接続はまだ実行していません。"
        : "ADB wallet path はファイルですが、.zip ではありません。",
      checks: [
        {
          name: "wallet_file",
          ok: isZip,
          message: isZip ? "ADB wallet zip は読み取り可能です。" : "ADB wallet zip として認識できません。"
        }
      ]
    };
  }

  const fileNames = new Set((await readdir(walletPath)).map((fileName) => fileName.toLowerCase()));
  const checks = requiredWalletFiles.map((fileName) => ({
    name: fileName,
    ok: fileNames.has(fileName),
    message: fileNames.has(fileName) ? `${fileName} を確認しました。` : `${fileName} が見つかりません。`
  }));
  const missingFiles = checks.filter((check) => !check.ok).map((check) => check.name);

  return {
    status: missingFiles.length === 0 ? "ready" : "invalid",
    walletPath,
    message:
      missingFiles.length === 0
        ? "ADB wallet directory の必須ファイルを確認しました。実 DB 接続はまだ実行していません。"
        : `ADB wallet directory に不足ファイルがあります: ${missingFiles.join(", ")}`,
    checks
  };
}
