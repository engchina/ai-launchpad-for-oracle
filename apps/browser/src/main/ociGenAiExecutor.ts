// OCI Generative AI (Enterprise AI project) を OpenAI 互換 API として呼び出す optional executor。
// API key / endpoint は main process 側の settings store にのみ保持し、renderer / UI / prompt には credential を返さない。
// credential 未設定や通信失敗時は graceful に enabled=false を返し、呼び出し側は
// 既存の deterministic answer に fallback する。

export const OCI_GENAI_LIVE_ENV_FLAG = "AI_LAUNCHPAD_OCI_GENAI_LIVE";

export type GenAiEnv = Record<string, string | undefined>;

export type OciGenAiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  project?: string;
};

export type OciGenAiRuntimeSettings = {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
  project: string;
};

export type OciGenAiReadiness =
  | { enabled: false; reason: "disabled" | "incomplete"; missing: string[] }
  | { enabled: true; config: OciGenAiConfig };

export type GenAiContext = {
  text: string;
  title?: string;
  sourceUrl?: string;
};

export type OciGenAiGeneration = { ok: true; answer: string } | { ok: false; reason: string };

const requiredConfigEnv: Array<{ key: string; label: string }> = [
  { key: "OCI_GENAI_BASE_URL", label: "OCI_GENAI_BASE_URL" },
  { key: "OCI_GENAI_API_KEY", label: "OCI_GENAI_API_KEY" },
  { key: "OCI_GENAI_MODEL", label: "OCI_GENAI_MODEL" }
];

type OciGenAiRuntimeSettingTextKey = "baseUrl" | "apiKey" | "model";

const requiredSettingsConfig: Array<{ key: OciGenAiRuntimeSettingTextKey; label: string }> = [
  { key: "baseUrl", label: "OCI GenAI Base URL" },
  { key: "apiKey", label: "OCI GenAI API key" },
  { key: "model", label: "OCI GenAI model" }
];

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function readEnv(env: GenAiEnv, key: string): string {
  return (env[key] ?? "").trim();
}

export function resolveOciGenAiReadiness(env: GenAiEnv): OciGenAiReadiness {
  return resolveOciGenAiReadinessFromSettings(env);
}

export function resolveOciGenAiReadinessFromSettings(
  env: GenAiEnv,
  settings?: OciGenAiRuntimeSettings
): OciGenAiReadiness {
  if (settings?.enabled) {
    const missing = requiredSettingsConfig.filter(({ key }) => !settings[key].trim()).map(({ label }) => label);
    if (missing.length > 0) {
      return { enabled: false, reason: "incomplete", missing };
    }

    return {
      enabled: true,
      config: {
        baseUrl: settings.baseUrl.trim(),
        apiKey: settings.apiKey.trim(),
        model: settings.model.trim(),
        project: settings.project.trim()
      }
    };
  }

  if (!isTruthyFlag(env[OCI_GENAI_LIVE_ENV_FLAG])) {
    return { enabled: false, reason: "disabled", missing: [OCI_GENAI_LIVE_ENV_FLAG] };
  }

  const missing = requiredConfigEnv.filter(({ key }) => !readEnv(env, key)).map(({ label }) => label);
  if (missing.length > 0) {
    return { enabled: false, reason: "incomplete", missing };
  }

  return {
    enabled: true,
    config: {
      baseUrl: readEnv(env, "OCI_GENAI_BASE_URL"),
      apiKey: readEnv(env, "OCI_GENAI_API_KEY"),
      model: readEnv(env, "OCI_GENAI_MODEL"),
      project: readEnv(env, "OCI_GENAI_PROJECT")
    }
  };
}

const systemPrompt = [
  "あなたは Oracle / OCI の技術営業を支援するアシスタントです。",
  "与えられた根拠 (context) のみに基づき、日本語で簡潔かつ正確に回答してください。",
  "根拠に無い情報は推測せず、不足している場合はその旨を明示してください。",
  "secret、認証情報、private key の内容は出力しないでください。"
].join("\n");

export function buildGenAiMessages(
  question: string,
  contexts: GenAiContext[]
): Array<{ role: "system" | "user"; content: string }> {
  const contextBlock =
    contexts.length > 0
      ? contexts
          .map((context, index) => {
            const heading = context.title ? `${context.title}` : `source ${index + 1}`;
            const sourceLine = context.sourceUrl ? `\n(${context.sourceUrl})` : "";
            return `### ${index + 1}. ${heading}${sourceLine}\n${context.text.replace(/\s+/g, " ").trim()}`;
          })
          .join("\n\n")
      : "(根拠なし)";

  const userContent = [`# 質問\n${question.trim()}`, "", `# 根拠\n${contextBlock}`].join("\n");

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent }
  ];
}

type ChatCompletionLike = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

type ChatCompletionOptions = {
  maxTokens?: number;
  temperature?: number;
};

function createChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/u, "")}/chat/completions`;
}

async function createChatCompletion(
  config: OciGenAiConfig,
  messages: Array<{ role: "system" | "user"; content: string }>,
  options: ChatCompletionOptions = {},
  fetchImpl: typeof fetch = fetch
): Promise<ChatCompletionLike> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${config.apiKey}`
  };
  if (config.project?.trim()) {
    headers["OpenAI-Project"] = config.project.trim();
  }

  const response = await fetchImpl(createChatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.2,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {})
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const reason = detail.trim() ? `${response.status} ${response.statusText}: ${detail.trim().slice(0, 240)}` : `${response.status} ${response.statusText}`;
    throw new Error(`OCI GenAI 呼び出しに失敗しました: ${reason}`);
  }

  return (await response.json()) as ChatCompletionLike;
}

export async function testOciGenAiConnection(
  config: OciGenAiConfig,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const completion = await createChatCompletion(
      config,
      [
        { role: "system", content: "あなたは接続確認用のアシスタントです。" },
        { role: "user", content: "接続テストです。日本語で OK とだけ返してください。" }
      ],
      { maxTokens: 16, temperature: 0 },
      fetchImpl
    );
    const answer = completion.choices?.[0]?.message?.content?.trim() ?? "";
    if (!answer) {
      return { ok: false, reason: "OCI GenAI から接続テストの応答が返されませんでした。" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "OCI GenAI 接続テストに失敗しました。"
    };
  }
}

export async function generateOciGenAiAnswer(
  question: string,
  contexts: GenAiContext[],
  env: GenAiEnv,
  settings?: OciGenAiRuntimeSettings
): Promise<OciGenAiGeneration> {
  const readiness = resolveOciGenAiReadinessFromSettings(env, settings);
  if (!readiness.enabled) {
    return {
      ok: false,
      reason:
        readiness.reason === "disabled"
          ? `${OCI_GENAI_LIVE_ENV_FLAG} が未設定のため OCI GenAI 生成は無効です。`
          : `OCI GenAI 生成に必要な設定が不足しています: ${readiness.missing.join(", ")}`
    };
  }

  try {
    const completion = await createChatCompletion(readiness.config, buildGenAiMessages(question, contexts));

    const answer = completion.choices?.[0]?.message?.content?.trim() ?? "";
    if (!answer) {
      return { ok: false, reason: "OCI GenAI から空の応答が返されました。" };
    }
    return { ok: true, answer };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "OCI GenAI 呼び出しに失敗しました。"
    };
  }
}
