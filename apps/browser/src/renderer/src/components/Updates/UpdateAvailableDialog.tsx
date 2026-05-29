import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { downloadAvailableRelease, formatPublishedAt, normalizeReleaseNotes } from "../../lib/updateActions";
import { useUpdateStore } from "../../store/update";

interface UpdateDialogFrameBounds {
  top: number;
  bottom: number;
}

const UPDATE_DIALOG_FRAME_SELECTOR = '[data-overlay-boundary="true"]';
const UPDATE_DIALOG_EDGE_GAP_PX = 16;
const DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS: UpdateDialogFrameBounds = { top: 0, bottom: 0 };

export default function UpdateAvailableDialog() {
  const dialogOpen = useUpdateStore((state) => state.dialogOpen);
  const release = useUpdateStore((state) => state.availableRelease);
  const closeUpdateDialog = useUpdateStore((state) => state.closeUpdateDialog);
  const skipVersion = useUpdateStore((state) => state.skipVersion);
  const dialogRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const [dialogFrameBounds, setDialogFrameBounds] = useState<UpdateDialogFrameBounds>(() =>
    resolveUpdateDialogFrameBounds()
  );

  useEffect(() => {
    if (!dialogOpen) return;
    const activeBefore = document.activeElement as HTMLElement;

    if (downloadButtonRef.current) {
      downloadButtonRef.current.focus({ preventScroll: true });
    }

    return () => {
      if (activeBefore && typeof activeBefore.focus === "function") {
        activeBefore.focus({ preventScroll: true });
      }
    };
  }, [dialogOpen]);

  useLayoutEffect(() => {
    if (!dialogOpen) return;

    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | null = null;

    const updateFrameBounds = () => {
      rafId = null;
      const nextBounds = resolveUpdateDialogFrameBounds();
      setDialogFrameBounds((currentBounds) =>
        areUpdateDialogFrameBoundsEqual(currentBounds, nextBounds) ? currentBounds : nextBounds
      );
    };

    const scheduleFrameBoundsUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateFrameBounds);
    };

    updateFrameBounds();
    window.addEventListener("resize", scheduleFrameBoundsUpdate);
    window.addEventListener("orientationchange", scheduleFrameBoundsUpdate);

    const frameSurface = getUpdateDialogFrameSurface();
    if (frameSurface && typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(scheduleFrameBoundsUpdate);
      resizeObserver.observe(frameSurface);
    }

    return () => {
      window.removeEventListener("resize", scheduleFrameBoundsUpdate);
      window.removeEventListener("orientationchange", scheduleFrameBoundsUpdate);
      resizeObserver?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [dialogOpen]);

  useEffect(() => {
    if (!dialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (trapUpdateDialogTabFocus(event, dialogRef.current)) return;

      if (event.key !== "Escape") return;
      event.preventDefault();
      closeUpdateDialog();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeUpdateDialog, dialogOpen]);

  const releaseNotes = useMemo(() => {
    if (!release) return "";
    return normalizeReleaseNotes(release.releaseNotes);
  }, [release]);

  if (!dialogOpen || !release) return null;

  const publishedAt = formatPublishedAt(release.publishedAt);
  const dialogFrameStyle: CSSProperties = {
    top: `${dialogFrameBounds.top}px`,
    bottom: `${dialogFrameBounds.bottom}px`,
    paddingTop: `${UPDATE_DIALOG_EDGE_GAP_PX}px`,
    paddingBottom: `${UPDATE_DIALOG_EDGE_GAP_PX}px`
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] overflow-hidden"
      style={{ background: "color-mix(in srgb, var(--bg-primary, #ffffff) 34%, rgba(0, 0, 0, 0.44))" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeUpdateDialog();
      }}
    >
      <div
        data-update-dialog-frame="editor"
        className="pointer-events-none fixed inset-x-0 flex items-center justify-center px-3 sm:px-4"
        style={dialogFrameStyle}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-dialog-title"
          aria-describedby="update-dialog-description"
          tabIndex={-1}
          className="pointer-events-auto flex w-full max-w-[min(640px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[1.5rem] shadow-2xl border bg-white"
          style={{
            maxHeight: "100%",
            borderColor: "var(--border, #e2e8f0)"
          }}
        >
          <div
            className="flex flex-shrink-0 items-start gap-4 px-5 py-3.5 border-b"
            style={{ borderColor: "var(--border, #e2e8f0)" }}
          >
            <div
              className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"
            >
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="update-dialog-title" className="text-base font-semibold text-zinc-900">
                新しいアップデートが利用可能です
              </h2>
              <p id="update-dialog-description" className="mt-1 text-sm leading-6 text-zinc-500">
                新しいバージョンの AI Launchpad for Oracle がダウンロード可能です。
              </p>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
            style={{ scrollbarGutter: "stable" }}
          >
            <div className="grid grid-cols-2 gap-3">
              <UpdateVersionCard
                label="現在のバージョン"
                value={`v${release.currentVersion}`}
              />
              <UpdateVersionCard
                label="最新のバージョン"
                value={`v${release.latestVersion}`}
                accent
              />
            </div>

            {publishedAt && (
              <div
                className="rounded-2xl px-4 py-2.5 text-sm border bg-zinc-50 border-zinc-100"
              >
                <span className="text-zinc-400">公開日</span>
                <span className="ml-2 font-medium text-zinc-800">
                  {publishedAt}
                </span>
              </div>
            )}

            <section
              className="rounded-[1.25rem] px-4 py-3.5 border bg-zinc-50 border-zinc-100"
            >
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <h3 className="flex-shrink-0 text-sm font-semibold text-zinc-800">
                  リリースノート
                </h3>
                {release.assetName && (
                  <span
                    className="min-w-0 max-w-[65%] truncate rounded-full px-2.5 py-1 text-[11px] font-medium bg-orange-100 text-orange-600"
                  >
                    {release.assetName}
                  </span>
                )}
              </div>
              <div
                className="overflow-y-auto rounded-xl px-3 py-3 text-sm leading-6 bg-white border border-zinc-100 text-zinc-600 whitespace-pre-wrap"
                style={{
                  maxHeight: "clamp(96px, 26vh, 220px)"
                }}
              >
                {releaseNotes || "リリースノートはありません。"}
              </div>
            </section>
          </div>

          <div
            className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 px-5 py-3 border-t"
            style={{ borderColor: "var(--border, #e2e8f0)" }}
          >
            <button
              ref={downloadButtonRef}
              type="button"
              onClick={() => {
                void (async () => {
                  try {
                    await downloadAvailableRelease(release);
                    closeUpdateDialog();
                  } catch {
                    // エラーは既にハンドリングされています
                  }
                })();
              }}
              className="min-h-[38px] rounded-xl px-4 py-2 text-sm font-medium transition-colors bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
              アップデートをダウンロード
            </button>
            <button
              type="button"
              onClick={() => skipVersion(release.latestVersion)}
              className="min-h-[38px] rounded-xl px-4 py-2 text-sm font-medium transition-colors bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm"
            >
              このバージョンをスキップ
            </button>
            <button
              type="button"
              onClick={closeUpdateDialog}
              className="min-h-[38px] rounded-xl px-4 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-zinc-50 text-zinc-500"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function UpdateVersionCard({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.25rem] px-4 py-3.5 border ${
        accent
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </div>
      <div className={`mt-2 text-lg font-semibold ${accent ? "text-orange-600" : "text-zinc-800"}`}>
        {value}
      </div>
    </div>
  );
}

function getUpdateDialogFrameSurface(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(UPDATE_DIALOG_FRAME_SELECTOR);
}

function resolveUpdateDialogFrameBounds(): UpdateDialogFrameBounds {
  if (typeof window === "undefined") return DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS;

  const frameSurface = getUpdateDialogFrameSurface();
  if (!frameSurface) return DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS;
  }

  const rect = frameSurface.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS;
  }

  const top = clampUpdateDialogFrameInset(Math.round(rect.top), viewportHeight);
  const bottom = clampUpdateDialogFrameInset(Math.round(viewportHeight - rect.bottom), viewportHeight);

  if (top + bottom >= viewportHeight) return DEFAULT_UPDATE_DIALOG_FRAME_BOUNDS;
  return { top, bottom };
}

function clampUpdateDialogFrameInset(value: number, viewportHeight: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), viewportHeight);
}

function areUpdateDialogFrameBoundsEqual(
  currentBounds: UpdateDialogFrameBounds,
  nextBounds: UpdateDialogFrameBounds
): boolean {
  return currentBounds.top === nextBounds.top && currentBounds.bottom === nextBounds.bottom;
}

function getUpdateDialogFocusableElements(dialog: HTMLElement): HTMLElement[] {
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") return false;
    return element.getClientRects().length > 0;
  });
}

function trapUpdateDialogTabFocus(event: KeyboardEvent, dialog: HTMLElement | null): boolean {
  if (event.key !== "Tab" || !dialog) return false;

  const focusableElements = getUpdateDialogFocusableElements(dialog);
  const fallbackFocusTarget = focusableElements[0] ?? dialog;
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement) || !dialog.contains(activeElement)) {
    event.preventDefault();
    fallbackFocusTarget.focus({ preventScroll: true });
    return true;
  }

  if (focusableElements.length === 0) {
    event.preventDefault();
    dialog.focus({ preventScroll: true });
    return true;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus({ preventScroll: true });
    return true;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus({ preventScroll: true });
    return true;
  }

  return false;
}
