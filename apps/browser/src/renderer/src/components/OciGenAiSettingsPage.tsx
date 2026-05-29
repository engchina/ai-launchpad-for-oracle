import { Activity, CheckCircle2, KeyRound, Save, Settings as SettingsIcon, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { type FormEvent, type ReactElement, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import type { OciGenAiSettingsState, SaveOciGenAiSettingsPayload } from "../../../shared/api";

type OciGenAiSettingsPageProps = {
  onStatusChange?: (message: string) => void;
};

const previewSettingsState: OciGenAiSettingsState = {
  config: {
    enabled: true,
    baseUrl: "",
    model: "",
    project: ""
  },
  hasApiKey: false,
  storageKind: "local-file",
  readiness: {
    ready: false,
    missing: ["Desktop runtime"]
  }
};

function formatStorageKind(kind: OciGenAiSettingsState["storageKind"]): string {
  return kind === "electron-safe-storage" ? "Electron safeStorage" : "Local settings file";
}

export function OciGenAiSettingsPage({ onStatusChange }: OciGenAiSettingsPageProps): ReactElement {
  const [settingsState, setSettingsState] = useState<OciGenAiSettingsState | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [project, setProject] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const desktopAvailable = Boolean(window.aiLaunchpad?.ociGenAiSettings);
  const busy = loading || testing;
  const resolvedState = settingsState ?? previewSettingsState;
  const readiness = resolvedState.readiness;
  const missingLabel = readiness.missing.join(", ");

  const applyState = useCallback(
    (state: OciGenAiSettingsState): void => {
      setSettingsState(state);
      setBaseUrl(state.config.baseUrl);
      setModel(state.config.model);
      setProject(state.config.project);
      setApiKey("");
      onStatusChange?.(state.readiness.ready ? "OCI GenAI settings は ready です。" : "OCI GenAI settings を確認してください。");
    },
    [onStatusChange]
  );

  useEffect(() => {
    let canceled = false;

    async function loadSettings(): Promise<void> {
      if (!window.aiLaunchpad?.ociGenAiSettings) {
        setSettingsState(previewSettingsState);
        setMessage("Electron runtime で起動すると settings を保存できます。");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const state = await window.aiLaunchpad.ociGenAiSettings.load();
        if (canceled) {
          return;
        }
        applyState(state);
        setMessage(state.readiness.ready ? "OCI GenAI settings は利用可能です。" : "OCI GenAI settings は未完了です。");
      } catch (loadError) {
        if (!canceled) {
          setError(loadError instanceof Error ? loadError.message : "OCI GenAI settings を読み込めませんでした。");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();
    return () => {
      canceled = true;
    };
  }, [applyState]);

  const buildSavePayload = useCallback((): SaveOciGenAiSettingsPayload => {
    const formData = formRef.current ? new FormData(formRef.current) : null;
    const readField = (name: string, fallback: string): string => {
      const value = formData?.get(name);
      return typeof value === "string" ? value : fallback;
    };

    return {
      baseUrl: readField("baseUrl", baseUrl),
      model: readField("model", model),
      project: readField("project", project),
      apiKey: readField("apiKey", apiKey)
    };
  }, [apiKey, baseUrl, model, project]);

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!window.aiLaunchpad?.ociGenAiSettings) {
      setMessage("Electron runtime で起動すると settings を保存できます。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await window.aiLaunchpad.ociGenAiSettings.save(buildSavePayload());
      applyState(result.settings);
      setMessage(result.settings.readiness.ready ? "OCI GenAI settings を保存しました。" : "設定を保存しました。不足項目を確認してください。");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "OCI GenAI settings を保存できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAndTest(): Promise<void> {
    if (!window.aiLaunchpad?.ociGenAiSettings) {
      setMessage("Electron runtime で起動すると settings を保存して接続テストできます。");
      return;
    }

    setTesting(true);
    setError("");
    setMessage("");
    try {
      const saved = await window.aiLaunchpad.ociGenAiSettings.save(buildSavePayload());
      applyState(saved.settings);

      const result = await window.aiLaunchpad.ociGenAiSettings.test();
      applyState(result.settings);
      if (result.ok) {
        setMessage(`${result.message} (${new Date(result.testedAt).toLocaleString("ja-JP")})`);
      } else {
        setError(result.message);
      }
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "OCI GenAI 接続テストに失敗しました。");
    } finally {
      setTesting(false);
    }
  }

  async function handleClearApiKey(): Promise<void> {
    if (!window.aiLaunchpad?.ociGenAiSettings) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await window.aiLaunchpad.ociGenAiSettings.clearApiKey();
      applyState(result.settings);
      setMessage("API key を削除しました。");
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "API key を削除できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f4f4f5] px-8 py-8">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_280px] gap-4">
        <section className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm" aria-labelledby="oci-genai-settings-title">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[#f05a24]">
                <SettingsIcon aria-hidden="true" className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-normal">Settings</p>
              </div>
              <h1 id="oci-genai-settings-title" className="mt-2 text-xl font-semibold text-[#171717]">
                OCI GenAI Enterprise AI 設定
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#52525b]">
                Capture Chat が保存済み provider 設定を使えるように、Base URL、model、Project、API key を desktop 側に保存します。
              </p>
            </div>
            <ConnectionBadge ready={readiness.ready} />
          </div>

          <form ref={formRef} onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid gap-3">
              <SettingsField id="oci-genai-base-url" label="Base URL" meta="OpenAI-compatible endpoint">
                <Input
                  id="oci-genai-base-url"
                  name="baseUrl"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="https://inference.generativeai.example/v1"
                  disabled={!desktopAvailable || busy}
                />
              </SettingsField>

              <SettingsField id="oci-genai-model" label="Model" meta="例: cohere.command-r-plus">
                <Input
                  id="oci-genai-model"
                  name="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="cohere.command-r-plus"
                  disabled={!desktopAvailable || busy}
                />
              </SettingsField>

              <SettingsField id="oci-genai-project" label="Project" meta="Optional">
                <Input
                  id="oci-genai-project"
                  name="project"
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  placeholder="ocid1.generativeaiproject.oc1..."
                  disabled={!desktopAvailable || busy}
                />
              </SettingsField>

              <SettingsField id="oci-genai-api-key" label="API key" meta={resolvedState.hasApiKey ? "保存済み key あり" : "未保存"}>
                <div className="flex gap-2">
                  <Input
                    id="oci-genai-api-key"
                    name="apiKey"
                    type="password"
                    autoComplete="new-password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder={resolvedState.hasApiKey ? "空のまま保存すると既存 key を維持" : "API key を入力"}
                    className="min-w-0 flex-1"
                    disabled={!desktopAvailable || busy}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleClearApiKey()}
                    disabled={!desktopAvailable || busy || !resolvedState.hasApiKey}
                    aria-label="API key を削除"
                    title="API key を削除"
                    className="shrink-0 px-3"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    クリア
                  </Button>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-[#71717a]">
                  API key は renderer の localStorage に保存せず、main process の settings store に保持します。
                </p>
              </SettingsField>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#e5e5e5] pt-4">
              <div className="flex-1 min-w-0">
                {error ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-fade-in">
                    <XCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate" title={error}>{error}</span>
                  </div>
                ) : message ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-fade-in">
                    <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate" title={message}>{message}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => void handleSaveAndTest()} disabled={!desktopAvailable || busy}>
                  <Activity aria-hidden="true" className="h-4 w-4" />
                  {testing ? "テスト中" : "保存してテスト"}
                </Button>
                <Button type="submit" disabled={!desktopAvailable || busy}>
                  <Save aria-hidden="true" className="h-4 w-4" />
                  {loading ? "保存中" : "保存"}
                </Button>
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-3">
          <section className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <StatusIcon ready={readiness.ready} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171717]">接続準備</p>
                <p className="mt-1 text-xs leading-5 text-[#71717a]">
                  {readiness.ready ? "Capture Chat は保存済み provider を使用できます。" : `不足: ${missingLabel}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#f05a24]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171717]">Secret handling</p>
                <dl className="mt-3 space-y-2 text-xs leading-5 text-[#52525b]">
                  <SettingsFact label="API key" value={resolvedState.hasApiKey ? "保存済み" : "未保存"} />
                  <SettingsFact label="Storage" value={formatStorageKind(resolvedState.storageKind)} />
                  <SettingsFact label="Updated" value={resolvedState.updatedAt ? new Date(resolvedState.updatedAt).toLocaleString("ja-JP") : "-"} />
                </dl>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <KeyRound aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#f05a24]" />
              <p className="text-xs leading-5 text-[#71717a]">
                参考実装と同様に、接続情報は AI 専用 settings として扱い、general workspace state には API key を混ぜません。
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ConnectionBadge({ ready }: { ready: boolean }): ReactElement {
  const label = ready ? "Ready" : "Incomplete";
  return (
    <span className="shrink-0 rounded-full border border-[#e6e6e6] bg-white px-3 py-1 text-[11px] font-semibold text-[#52525b]">
      {label}
    </span>
  );
}

function StatusIcon({ ready }: { ready: boolean }): ReactElement {
  if (ready) {
    return <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />;
  }

  return <XCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />;
}

function SettingsField({
  id,
  label,
  meta,
  children
}: {
  id: string;
  label: string;
  meta?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-normal text-[#71717a]">
          {label}
        </label>
        {meta ? <span className="text-[11px] text-[#71717a]">{meta}</span> : null}
      </div>
      {children}
    </div>
  );
}

function SettingsFact({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-2">
      <dt className="text-[#71717a]">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-[#27272a]">{value}</dd>
    </div>
  );
}
