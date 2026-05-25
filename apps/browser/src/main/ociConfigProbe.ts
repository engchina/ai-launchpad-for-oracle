import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { OciCheckConfigResult } from "../shared/api";

type OciProfile = Record<string, string>;

export type OciConfigProbeOptions = {
  configPath?: string;
  profile?: string;
  homeDir?: string;
};

const requiredOciFields = ["tenancy", "user", "fingerprint", "key_file", "region"];

function resolveHomeDir(options: OciConfigProbeOptions): string {
  return options.homeDir ?? homedir();
}

export function getDefaultOciConfigPath(options: OciConfigProbeOptions = {}): string {
  return options.configPath ?? process.env.OCI_CONFIG_FILE ?? join(resolveHomeDir(options), ".oci", "config");
}

function normalizeProfileName(options: OciConfigProbeOptions): string {
  return options.profile ?? process.env.OCI_CLI_PROFILE ?? "DEFAULT";
}

function stripInlineComment(value: string): string {
  const commentIndex = value.search(/\s[#;]/);
  return commentIndex === -1 ? value.trim() : value.slice(0, commentIndex).trim();
}

export function parseOciConfig(content: string): Map<string, OciProfile> {
  const profiles = new Map<string, OciProfile>();
  let currentProfile = "DEFAULT";
  profiles.set(currentProfile, {});

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)]$/);
    if (sectionMatch) {
      currentProfile = sectionMatch[1].trim();
      profiles.set(currentProfile, profiles.get(currentProfile) ?? {});
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripInlineComment(line.slice(separatorIndex + 1));
    profiles.get(currentProfile)![key] = value;
  }

  return profiles;
}

function resolveKeyFilePath(keyFile: string, configPath: string, options: OciConfigProbeOptions): string {
  if (keyFile === "~" || keyFile.startsWith("~/") || keyFile.startsWith("~\\")) {
    return resolve(resolveHomeDir(options), keyFile.slice(2));
  }

  if (isAbsolute(keyFile)) {
    return keyFile;
  }

  return resolve(dirname(configPath), keyFile);
}

async function canReadFile(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function checkOciConfig(options: OciConfigProbeOptions = {}): Promise<OciCheckConfigResult> {
  const configPath = getDefaultOciConfigPath(options);
  const profile = normalizeProfileName(options);

  if (!(await canReadFile(configPath))) {
    return {
      status: "not-configured",
      profile,
      configPath,
      message: `OCI config が見つからないか読み取れません: ${configPath}`,
      checks: [
        {
          name: "config_file",
          ok: false,
          message: "OCI config file を読み取れません。"
        }
      ]
    };
  }

  const configContent = await readFile(configPath, "utf8");
  const profiles = parseOciConfig(configContent);
  const selectedProfile = profiles.get(profile);

  if (!selectedProfile) {
    return {
      status: "invalid",
      profile,
      configPath,
      message: `OCI config に profile [${profile}] がありません。`,
      checks: [
        {
          name: "profile",
          ok: false,
          message: `profile [${profile}] が見つかりません。`
        }
      ]
    };
  }

  const missingFields = requiredOciFields.filter((field) => !selectedProfile[field]);
  const keyFilePath = selectedProfile.key_file ? resolveKeyFilePath(selectedProfile.key_file, configPath, options) : undefined;
  const keyFileReadable = keyFilePath ? await canReadFile(keyFilePath) : false;
  const checks = [
    {
      name: "config_file",
      ok: true,
      message: "OCI config file を読み取りました。"
    },
    {
      name: "profile",
      ok: true,
      message: `profile [${profile}] を確認しました。`
    },
    {
      name: "required_fields",
      ok: missingFields.length === 0,
      message:
        missingFields.length === 0
          ? "必須フィールドは揃っています。"
          : `不足フィールド: ${missingFields.join(", ")}`
    },
    {
      name: "key_file",
      ok: keyFileReadable,
      message: keyFileReadable ? "key_file は読み取り可能です。" : "key_file が未設定、または読み取れません。"
    }
  ];

  if (missingFields.length > 0 || !keyFileReadable) {
    return {
      status: "invalid",
      profile,
      configPath,
      keyFilePath,
      missingFields,
      checks,
      message: "OCI config は見つかりましたが、必須項目または key_file に問題があります。"
    };
  }

  return {
    status: "ready",
    profile,
    configPath,
    keyFilePath,
    checks,
    message: "OCI config と key_file を確認しました。実 OCI API 呼び出しはまだ実行していません。"
  };
}
