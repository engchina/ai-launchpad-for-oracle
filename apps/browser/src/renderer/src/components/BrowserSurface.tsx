import { CheckSquare } from "lucide-react";
import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { type PageSourceType } from "../../../shared/api";
import { clampBrowserViewZoomFactor } from "../../../shared/browserViewZoom";
import { cn } from "@renderer/lib/utils";

type WebviewEvent = Event & {
  url?: string;
  title?: string;
  isMainFrame?: boolean;
};

type ElectronWebviewElement = HTMLElement & {
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  reloadIgnoringCache?: () => void;
  loadURL: (url: string) => void;
  getURL: () => string;
  getTitle: () => string;
  getZoomFactor?: () => number;
  setZoomFactor?: (factor: number) => void;
  executeJavaScript: <T>(code: string) => Promise<T>;
  capturePage: () => Promise<{
    toDataURL: () => string;
  }>;
};

export type BrowserSurfaceHandle = {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  forceReload: () => void;
  getSelectedText: () => Promise<string>;
  getPageMetadata: () => Promise<{ url: string; title: string }>;
  captureScreenshot: () => Promise<string>;
};

export type BrowserSurfaceState = {
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
};

type BrowserSurfaceProps = {
  currentTitle: string;
  currentUrl: string;
  zoomFactor: number;
  sourceType: PageSourceType;
  onPageMetadataChange: (metadata: { url: string; title: string }) => void;
  onNavigationStateChange: (state: BrowserSurfaceState) => void;
};

function isElectronWebviewAvailable(): boolean {
  return Boolean(window.aiLaunchpad);
}

function safeWebviewCall<T>(fallback: T, action: () => T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

function setWebviewZoomFactor(webview: ElectronWebviewElement, zoomFactor: number): void {
  safeWebviewCall(undefined, () => webview.setZoomFactor?.(clampBrowserViewZoomFactor(zoomFactor)));
}

function buildMockScreenshotDataUrl(title: string, url: string): string {
  const safeTitle = title.replace(/[<>&"]/g, "");
  const safeUrl = url.replace(/[<>&"]/g, "");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <rect width="960" height="540" fill="#f8fafc"/>
  <rect x="32" y="32" width="896" height="476" rx="8" fill="#ffffff" stroke="#d9e2ec"/>
  <rect x="32" y="32" width="896" height="56" rx="8" fill="#eff4f8"/>
  <text x="64" y="67" fill="#0f172a" font-family="Segoe UI, Arial" font-size="22" font-weight="700">AI Launchpad Browser Capture</text>
  <rect x="64" y="128" width="832" height="120" rx="6" fill="#f1f5f9"/>
  <text x="92" y="174" fill="#0369a1" font-family="Segoe UI, Arial" font-size="18" font-weight="700">Renderer preview mock screenshot</text>
  <text x="92" y="210" fill="#475569" font-family="Segoe UI, Arial" font-size="16">${safeTitle}</text>
  <text x="92" y="296" fill="#334155" font-family="Segoe UI, Arial" font-size="14">${safeUrl}</text>
  <text x="92" y="360" fill="#64748b" font-family="Segoe UI, Arial" font-size="15">Electron 実行時は実ページの PNG が保存されます。</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const BrowserSurface = forwardRef<BrowserSurfaceHandle, BrowserSurfaceProps>(
  ({ currentTitle, currentUrl, zoomFactor, sourceType, onPageMetadataChange, onNavigationStateChange }, ref): ReactElement => {
    const webviewRef = useRef<ElectronWebviewElement | null>(null);
    const [loadError, setLoadError] = useState<string>("");
    const canUseWebview = isElectronWebviewAvailable();

    useImperativeHandle(
      ref,
      () => ({
        goBack: () => {
          const webview = webviewRef.current;
          if (webview && safeWebviewCall(false, () => webview.canGoBack())) {
            webview.goBack();
          }
        },
        goForward: () => {
          const webview = webviewRef.current;
          if (webview && safeWebviewCall(false, () => webview.canGoForward())) {
            webview.goForward();
          }
        },
        reload: () => {
          const webview = webviewRef.current;
          if (webview) {
            safeWebviewCall(undefined, () => webview.reload());
          }
        },
        forceReload: () => {
          const webview = webviewRef.current;
          if (webview) {
            safeWebviewCall(undefined, () => (webview.reloadIgnoringCache ? webview.reloadIgnoringCache() : webview.reload()));
          }
        },
        getSelectedText: async () => {
          const webview = webviewRef.current;
          if (!webview) {
            return "";
          }

          return safeWebviewCall(Promise.resolve(""), () =>
            webview.executeJavaScript<string>("window.getSelection()?.toString() ?? ''")
          );
        },
        getPageMetadata: async () => {
          const webview = webviewRef.current;
          if (!webview) {
            return { url: currentUrl, title: currentTitle };
          }

          return {
            url: safeWebviewCall(currentUrl, () => webview.getURL()) || currentUrl,
            title: safeWebviewCall(currentTitle, () => webview.getTitle()) || currentTitle
          };
        },
        captureScreenshot: async () => {
          const webview = webviewRef.current;
          if (!webview) {
            return buildMockScreenshotDataUrl(currentTitle, currentUrl);
          }

          return safeWebviewCall(Promise.resolve(buildMockScreenshotDataUrl(currentTitle, currentUrl)), async () => {
            const image = await webview.capturePage();
            return image.toDataURL();
          });
        }
      }),
      [currentTitle, currentUrl]
    );

    useEffect(() => {
      const webview = webviewRef.current;
      if (!canUseWebview || !webview) {
        onNavigationStateChange({ canGoBack: false, canGoForward: false, isLoading: false });
        return;
      }

      const syncState = (): void => {
        onNavigationStateChange({
          canGoBack: safeWebviewCall(false, () => webview.canGoBack()),
          canGoForward: safeWebviewCall(false, () => webview.canGoForward()),
          isLoading: false
        });
      };

      const syncMetadata = (event?: WebviewEvent): void => {
        const nextUrl = event?.url || safeWebviewCall(currentUrl, () => webview.getURL()) || currentUrl;
        const nextTitle = event?.title || safeWebviewCall(currentTitle, () => webview.getTitle()) || currentTitle;
        onPageMetadataChange({ url: nextUrl, title: nextTitle });
        syncState();
      };

      const handleStartLoading = (): void => {
        setLoadError("");
        onNavigationStateChange({
          canGoBack: safeWebviewCall(false, () => webview.canGoBack()),
          canGoForward: safeWebviewCall(false, () => webview.canGoForward()),
          isLoading: true
        });
      };

      const handleDomReady = (): void => {
        setWebviewZoomFactor(webview, zoomFactor);
      };

      const handleStopLoading = (): void => {
        syncMetadata();
      };

      const handleFailLoad = (event: WebviewEvent): void => {
        if (event.isMainFrame === false) {
          return;
        }

        setLoadError("ページを読み込めませんでした。URL、ネットワーク、またはサイト側の埋め込み制限を確認してください。");
        syncState();
      };

      webview.addEventListener("did-start-loading", handleStartLoading);
      webview.addEventListener("dom-ready", handleDomReady);
      webview.addEventListener("did-stop-loading", handleStopLoading);
      webview.addEventListener("did-navigate", syncMetadata);
      webview.addEventListener("did-navigate-in-page", syncMetadata);
      webview.addEventListener("page-title-updated", syncMetadata);
      webview.addEventListener("did-fail-load", handleFailLoad);

      return () => {
        webview.removeEventListener("did-start-loading", handleStartLoading);
        webview.removeEventListener("dom-ready", handleDomReady);
        webview.removeEventListener("did-stop-loading", handleStopLoading);
        webview.removeEventListener("did-navigate", syncMetadata);
        webview.removeEventListener("did-navigate-in-page", syncMetadata);
        webview.removeEventListener("page-title-updated", syncMetadata);
        webview.removeEventListener("did-fail-load", handleFailLoad);
      };
    }, [canUseWebview, currentTitle, currentUrl, onNavigationStateChange, onPageMetadataChange, zoomFactor]);

    useEffect(() => {
      const webview = webviewRef.current;
      if (!canUseWebview || !webview) {
        return;
      }

      setWebviewZoomFactor(webview, zoomFactor);
    }, [canUseWebview, zoomFactor]);

    useEffect(() => {
      const webview = webviewRef.current;
      if (!canUseWebview || !webview) {
        return;
      }

      const loadedUrl = safeWebviewCall("", () => webview.getURL());
      if (currentUrl && loadedUrl !== currentUrl) {
        safeWebviewCall(undefined, () => webview.loadURL(currentUrl));
      }
    }, [canUseWebview, currentUrl]);

    if (!canUseWebview) {
      return <MockBrowserViewport sourceType={sourceType} />;
    }

    return (
      <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-white">
        {loadError ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</div>
        ) : null}

        {createElement("webview", {
          ref: webviewRef,
          className: "browser-webview",
          src: currentUrl,
          partition: "persist:ai-launchpad-browser",
          allowpopups: "false"
        } as HTMLAttributes<HTMLElement>)}
      </article>
    );
  }
);

BrowserSurface.displayName = "BrowserSurface";

function MockBrowserViewport({ sourceType }: { sourceType: PageSourceType }): ReactElement {
  const isConsole = sourceType === "oci_console";

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-white">
      <div className="border-b border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Electron 実行時はこの領域が実ページを読み込む Browser Surface になります。現在の renderer preview では mock 表示です。
      </div>

      {isConsole ? <ConsoleMockPage /> : <DocsMockPage />}
    </article>
  );
}

function DocsMockPage(): ReactElement {
  return (
    <div className="grid min-h-[610px] flex-1 grid-cols-[220px_1fr] overflow-auto">
      <div className="border-r border-border bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Oracle Docs</p>
        {["Overview", "Vector indexes", "Embedding models", "SQL examples", "Troubleshooting"].map((item, index) => (
          <div
            key={item}
            className={cn(
              "mb-1 rounded-md px-3 py-2 text-sm",
              index === 0 ? "bg-white font-medium text-slate-950 shadow-sm ring-1 ring-border" : "text-slate-600"
            )}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="p-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Oracle AI Database 26ai</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">AI Vector Search</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            このページは Browser Client の fallback viewport です。Electron では実際の Web ページを表示します。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            ["Prerequisites", "Database version、権限、embedding model、vector index の確認"],
            ["Demo Flow", "文書投入、embedding、検索、引用付き回答までの流れ"],
            ["PoC Assets", "SQL、Python、README、検証 checklist への変換"]
          ].map(([title, body]) => (
            <section key={title} className="rounded-md border border-border bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-md border border-border">
          <div className="border-b border-border bg-slate-50 px-4 py-3 text-sm font-semibold">Example checklist</div>
          <div className="divide-y divide-border">
            {["Create table with VECTOR column", "Load embeddings", "Create vector index", "Run similarity query"].map((item) => (
              <div key={item} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700">
                <CheckSquare aria-hidden="true" className="h-4 w-4 text-sky-700" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ConsoleMockPage(): ReactElement {
  return (
    <div className="min-h-[610px] flex-1 overflow-auto bg-slate-950 p-6 text-white">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">OCI Console</p>
          <h1 className="mt-2 text-2xl font-semibold">Generative AI / Agent readiness</h1>
        </div>
        <span className="rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/30">
          Mock console
        </span>
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-5">
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          {["Overview", "Models", "Agents", "Object Storage", "Policies"].map((item, index) => (
            <div key={item} className={cn("rounded-md px-3 py-2 text-sm", index === 2 ? "bg-white/10 text-white" : "text-slate-300")}>
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-md border border-white/10 bg-white p-5 text-slate-950">
          <h2 className="text-lg font-semibold">Agent setup checklist</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {["Compartment access", "Object Storage bucket", "IAM policy", "Endpoint validation"].map((item) => (
              <div key={item} className="rounded-md border border-border p-4">
                <p className="text-sm font-medium">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">AI Sidebar で不足条件と説明文を生成します。</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
