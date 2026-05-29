import { app, shell } from "electron";
import type { UpdateCheckResult } from "../shared/api";

const GITHUB_LATEST_RELEASE_API_URL =
  "https://api.github.com/repos/engchina/ai-launchpad-for-oracle/releases/latest";
const UPDATE_CHECKER_USER_AGENT = "AI Launchpad for Oracle Update Checker";

type UpdatePlatform = "windows" | "macos" | "linux";
type UpdateArchitecture = "x86_64" | "arm64" | "x86" | "other";

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubLatestReleaseResponse {
  tag_name: string;
  html_url: string;
  body?: string;
  published_at?: string;
  assets: GitHubReleaseAsset[];
}

function parseVersion(versionStr: string): number[] {
  const clean = versionStr.trim().replace(/^[vV]/, "");
  return clean.split(".").map((x) => parseInt(x, 10) || 0);
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = parseVersion(v1);
  const parts2 = parseVersion(v2);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const val1 = parts1[i] ?? 0;
    const val2 = parts2[i] ?? 0;
    if (val1 !== val2) {
      return val1 - val2;
    }
  }
  return 0;
}

function getUpdatePlatform(): UpdatePlatform {
  const p = process.platform;
  if (p === "win32") return "windows";
  if (p === "darwin") return "macos";
  return "linux";
}

function getUpdateArchitecture(): UpdateArchitecture {
  const arch = process.arch;
  if (arch === "x64") return "x86_64";
  if (arch === "arm64") return "arm64";
  if (arch === "ia32") return "x86";
  return "other";
}

function platformExtensionScore(name: string, platform: UpdatePlatform): number | null {
  const lower = name.toLowerCase();
  switch (platform) {
    case "windows":
      if (lower.endsWith(".msi")) return 3;
      if (lower.endsWith(".exe")) return 2;
      return null;
    case "macos":
      if (lower.endsWith(".dmg")) return 3;
      return null;
    case "linux":
      if (lower.endsWith(".appimage")) return 3;
      if (lower.endsWith(".deb")) return 2;
      if (lower.endsWith(".rpm")) return 1;
      return null;
  }
}

function mentionsOtherPlatform(name: string, platform: UpdatePlatform): boolean {
  const lower = name.toLowerCase();
  const windowsTokens = ["windows", "win32", "win64"];
  const macTokens = ["macos", "darwin", "osx"];
  const linuxTokens = ["linux", "appimage", ".deb", ".rpm"];

  const containsAny = (val: string, tokens: string[]) => tokens.some((t) => val.includes(t));

  switch (platform) {
    case "windows":
      return containsAny(lower, macTokens) || containsAny(lower, linuxTokens);
    case "macos":
      return containsAny(lower, windowsTokens) || containsAny(lower, linuxTokens);
    case "linux":
      return containsAny(lower, windowsTokens) || containsAny(lower, macTokens);
  }
}

function architectureMatchScore(name: string, architecture: UpdateArchitecture): number | null {
  const lower = name.toLowerCase();
  const x86_64Tokens = ["x86_64", "x64", "amd64"];
  const arm64Tokens = ["arm64", "aarch64"];
  const x86Tokens = ["i686", "ia32", "x86"];

  const containsAny = (val: string, tokens: string[]) => tokens.some((t) => val.includes(t));

  const mentionsX86_64 = containsAny(lower, x86_64Tokens);
  const mentionsArm64 = containsAny(lower, arm64Tokens);
  const mentionsX86 = !mentionsX86_64 && containsAny(lower, x86Tokens);

  switch (architecture) {
    case "x86_64":
      if (mentionsArm64 || mentionsX86) return null;
      return mentionsX86_64 ? 2 : 1;
    case "arm64":
      if (mentionsX86_64 || mentionsX86) return null;
      return mentionsArm64 ? 2 : 1;
    case "x86":
      if (mentionsX86_64 || mentionsArm64) return null;
      return mentionsX86 ? 2 : 1;
    case "other":
      return 1;
  }
}

function mentionsAnyArchitecture(name: string): boolean {
  const lower = name.toLowerCase();
  const tokens = ["x86_64", "x64", "amd64", "arm64", "aarch64", "i686", "ia32", "x86"];
  return tokens.some((t) => lower.includes(t));
}

function scoreAsset(
  asset: GitHubReleaseAsset,
  platform: UpdatePlatform,
  architecture: UpdateArchitecture
): [number, number, number] | null {
  const extScore = platformExtensionScore(asset.name, platform);
  if (extScore === null) return null;

  if (mentionsOtherPlatform(asset.name, platform)) {
    return null;
  }

  const archScore = architectureMatchScore(asset.name, architecture);
  if (archScore === null) return null;

  const genericScore = mentionsAnyArchitecture(asset.name) ? 0 : 1;

  return [extScore, archScore, genericScore];
}

function compareScores(s1: [number, number, number], s2: [number, number, number]): number {
  if (s1[0] !== s2[0]) return s1[0] - s2[0];
  if (s1[1] !== s2[1]) return s1[1] - s2[1];
  return s1[2] - s2[2];
}

function selectBestAsset(
  assets: GitHubReleaseAsset[],
  platform: UpdatePlatform,
  architecture: UpdateArchitecture
): GitHubReleaseAsset | null {
  let bestAsset: GitHubReleaseAsset | null = null;
  let bestScore: [number, number, number] | null = null;

  for (const asset of assets) {
    const score = scoreAsset(asset, platform, architecture);
    if (score === null) continue;

    if (bestScore === null || compareScores(score, bestScore) > 0) {
      bestScore = score;
      bestAsset = asset;
    }
  }

  return bestAsset;
}

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = app.getVersion();

  try {
    const response = await fetch(GITHUB_LATEST_RELEASE_API_URL, {
      headers: {
        "User-Agent": UPDATE_CHECKER_USER_AGENT,
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = (await response.json()) as GitHubLatestReleaseResponse;
    const latestVersion = data.tag_name.replace(/^[vV]/, "");

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    const platform = getUpdatePlatform();
    const architecture = getUpdateArchitecture();
    const bestAsset = selectBestAsset(data.assets, platform, architecture);

    return {
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseUrl: data.html_url,
      downloadUrl: bestAsset ? bestAsset.browser_download_url : null,
      assetName: bestAsset ? bestAsset.name : null,
      releaseNotes: data.body?.trim() ?? "",
      publishedAt: data.published_at ?? null
    };
  } catch (error) {
    console.error("Failed to check for app update:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function openUpdateUrl(url: string): Promise<void> {
  await shell.openExternal(url);
}
