// OCI Generative AI (Enterprise AI project) を OpenAI 互換 API として呼び出す optional executor。
// openai SDK と API key / endpoint は connector 側 (env) にのみ保持し、renderer / UI / prompt には credential を返さない。
// SDK 未インストールや credential 未設定の場合は graceful に enabled=false を返し、呼び出し側は
// 既存の deterministic answer に fallback する。

export const OCI_GENAI_LIVE_ENV_FLAG = "AI_LAUNCHPAD_OCI_GENAI_LIVE";

export type GenAiEnv = Record<string, string | undefined>;

export type OciGenAiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
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
      model: readEnv(env, "OCI_GENAI_MODEL")
    }
  };
}

const systemPrompt = [
  "あなたは Oracle Database / OCI の技術営業を支援するアシスタントです。",
  "与えられた根拠 (context) のみに基づき、日本語で簡潔かつ正確に回答してください。",
  "根拠に無い情報は推測せず、不足している場合はその旨を明示してください。",
  "secret、認証情報、private key、wallet の内容は出力しないでください。"
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

type OpenAiClientLike = {
  chat: {
    completions: {
      create: (params: Record<string, unknown>) => Promise<ChatCompletionLike>;
    };
  };
};

type OpenAiConstructorLike = new (options: { apiKey: string; baseURL: string }) => OpenAiClientLike;

async function loadOpenAiConstructor(): Promise<OpenAiConstructorLike | null> {
  // 変数経由の dynamic import にして、未インストール環境でも型解決・bundle 解決を強制しない。
  const moduleName: string = "openai";
  try {
    const imported = (await import(moduleName)) as {
      default?: OpenAiConstructorLike;
      OpenAI?: OpenAiConstructorLike;
    };
    return imported.default ?? imported.OpenAI ?? null;
  } catch {
    return null;
  }
}

export async function generateOciGenAiAnswer(
  question: string,
  contexts: GenAiContext[],
  env: GenAiEnv
): Promise<OciGenAiGeneration> {
  const readiness = resolveOciGenAiReadiness(env);
  if (!readiness.enabled) {
    return {
      ok: false,
      reason:
        readiness.reason === "disabled"
          ? `${OCI_GENAI_LIVE_ENV_FLAG} が未設定のため OCI GenAI 生成は無効です。`
          : `OCI GenAI 生成に必要な設定が不足しています: ${readiness.missing.join(", ")}`
    };
  }

  const OpenAi = await loadOpenAiConstructor();
  if (!OpenAi) {
    return { ok: false, reason: "openai SDK が未インストールです。`pnpm add openai` で OCI GenAI 生成を有効化できます。" };
  }

  try {
    const client = new OpenAi({ apiKey: readiness.config.apiKey, baseURL: readiness.config.baseUrl });
    const completion = await client.chat.completions.create({
      model: readiness.config.model,
      messages: buildGenAiMessages(question, contexts),
      temperature: 0.2
    });

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
