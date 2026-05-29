import { useUpdateStore } from "../store/update";
import type { AvailableRelease } from "../../../shared/api";

export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function shouldAutoCheckUpdates(
  autoCheckEnabled: boolean,
  lastCheckedAt: number | null,
  now = Date.now()
): boolean {
  if (!autoCheckEnabled) return false;
  if (lastCheckedAt === null) return true;
  return now - lastCheckedAt >= UPDATE_CHECK_INTERVAL_MS;
}

export function shouldShowUpdateDialog(
  source: "manual" | "auto",
  latestVersion: string,
  skippedVersion: string | null
): boolean {
  return source === "manual" || skippedVersion !== latestVersion;
}

export function normalizeReleaseNotes(notes: string): string {
  const trimmed = notes.replace(/\r\n?/g, "\n").trim();
  if (!trimmed) return "";

  return trimmed
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatPublishedAt(publishedAt: string | null): string | null {
  if (!publishedAt) return null;

  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(date);
}

export async function runUpdateCheck(
  source: "manual" | "auto",
  onMessage?: (msg: string, isError?: boolean) => void
): Promise<void> {
  const store = useUpdateStore.getState();
  if (store.isChecking) return;

  if (!window.aiLaunchpad) {
    if (source === "manual") {
      onMessage?.("デスクトップアプリ環境ではないため、アップデートを確認できません。", true);
    }
    return;
  }

  store.startChecking();

  try {
    const result = await window.aiLaunchpad.updateApi.checkForAppUpdate();

    store.markChecked();

    if (store.skippedVersion && store.skippedVersion !== result.latestVersion) {
      store.clearSkippedVersion();
    }

    if (!result.hasUpdate) {
      store.closeUpdateDialog();
      if (source === "manual") {
        onMessage?.(`お使いのバージョンは最新です。 (v${result.currentVersion})`);
      }
      return;
    }

    if (!shouldShowUpdateDialog(source, result.latestVersion, store.skippedVersion)) {
      return;
    }

    store.openUpdateDialog(result as AvailableRelease);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    store.failChecking(message);

    if (source === "manual") {
      onMessage?.(`アップデート確認中にエラーが発生しました: ${message}`, true);
    } else {
      console.error("Automatic update check failed:", error);
    }
  } finally {
    if (useUpdateStore.getState().isChecking) {
      useUpdateStore.getState().finishChecking();
    }
  }
}

export async function runManualUpdateCheck(
  onMessage?: (msg: string, isError?: boolean) => void
): Promise<void> {
  await runUpdateCheck("manual", onMessage);
}

export async function maybeRunAutomaticUpdateCheck(): Promise<void> {
  const store = useUpdateStore.getState();
  if (!window.aiLaunchpad) return;
  if (!shouldAutoCheckUpdates(store.autoCheckEnabled, store.lastCheckedAt)) return;

  await runUpdateCheck("auto");
}

export async function downloadAvailableRelease(
  release: Pick<AvailableRelease, "downloadUrl" | "releaseUrl">
): Promise<void> {
  if (!window.aiLaunchpad) return;
  const targetUrl = release.downloadUrl ?? release.releaseUrl;
  await window.aiLaunchpad.updateApi.openUpdateUrl(targetUrl);
}
