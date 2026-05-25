import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter, isAbsolute, join, resolve } from "node:path";
import type { SqlclCheckResult } from "../shared/api";

export type SqlclProbeOptions = {
  sqlclPath?: string;
  pathValue?: string;
  cwd?: string;
};

const sqlclExecutableNames =
  process.platform === "win32" ? ["sql.exe", "sql.cmd", "sql.bat", "sql", "sqlcl.exe", "sqlcl.cmd", "sqlcl.bat"] : ["sql", "sqlcl"];

async function canReadFile(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizeCandidatePath(path: string, options: SqlclProbeOptions): string {
  if (path === "~" || path.startsWith("~/") || path.startsWith("~\\")) {
    return path;
  }

  if (isAbsolute(path)) {
    return path;
  }

  return resolve(options.cwd ?? process.cwd(), path);
}

async function findSqlclOnPath(options: SqlclProbeOptions): Promise<string | undefined> {
  const pathEntries = (options.pathValue ?? process.env.PATH ?? "")
    .split(delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const entry of pathEntries) {
    for (const executableName of sqlclExecutableNames) {
      const candidate = join(entry, executableName);
      if (await canReadFile(candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

export async function checkSqlcl(options: SqlclProbeOptions = {}): Promise<SqlclCheckResult> {
  const explicitPath = options.sqlclPath ?? process.env.SQLCL_PATH;

  if (explicitPath) {
    const executablePath = normalizeCandidatePath(explicitPath, options);
    const readable = await canReadFile(executablePath);
    return {
      status: readable ? "ready" : "not-configured",
      executablePath,
      message: readable
        ? "SQLcl executable を確認しました。実 DB 接続はまだ実行していません。"
        : `SQLCL_PATH は設定されていますが読み取れません: ${executablePath}`,
      checks: [
        {
          name: "sqlcl_path",
          ok: readable,
          message: readable ? "SQLCL_PATH の executable は読み取り可能です。" : "SQLCL_PATH の executable を読み取れません。"
        }
      ]
    };
  }

  const pathExecutable = await findSqlclOnPath(options);
  if (pathExecutable) {
    return {
      status: "ready",
      executablePath: pathExecutable,
      message: "PATH から SQLcl executable を確認しました。実 DB 接続はまだ実行していません。",
      checks: [
        {
          name: "path_lookup",
          ok: true,
          message: "PATH から SQLcl executable を見つけました。"
        }
      ]
    };
  }

  return {
    status: "not-configured",
    message: "SQLcl executable が見つかりません。SQLCL_PATH を設定するか、sql / sqlcl を PATH に追加してください。",
    checks: [
      {
        name: "path_lookup",
        ok: false,
        message: "PATH から SQLcl executable を見つけられませんでした。"
      }
    ]
  };
}
