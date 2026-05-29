export type BrowserAssistantPromptTemplateId = "summarize_page" | "extract_table" | "translate_selection" | "fill_form_guarded" | "save_report";
export type BrowserAssistantPromptMode = "chat" | "agent" | "graph";
export type BrowserAssistantPromptRisk = "safe" | "review" | "blocked";

export type BrowserAssistantPromptTemplate = {
  id: BrowserAssistantPromptTemplateId;
  mode: BrowserAssistantPromptMode;
  title: string;
  prompt: string;
  detail: string;
  risk: BrowserAssistantPromptRisk;
  actionLabel: string;
  evidenceLabel: string;
};

export type BrowserAssistantPromptMetric = {
  label: string;
  value: string;
};

export type BrowserAssistantPromptLauncherPreview = {
  title: string;
  subtitle: string;
  providerLabel: string;
  templates: BrowserAssistantPromptTemplate[];
  metrics: BrowserAssistantPromptMetric[];
  guardrails: string[];
};

type BrowserAssistantPromptLauncherInput = {
  providerLabel?: string;
  pageContextReady?: boolean;
  selectionReady?: boolean;
  formApprovalReady?: boolean;
};

export function createBrowserAssistantPromptLauncherPreview(
  input: BrowserAssistantPromptLauncherInput = {}
): BrowserAssistantPromptLauncherPreview {
  const providerLabel = normalizeProviderLabel(input.providerLabel ?? "OCI GenAI Enterprise AI Project");
  const pageContextReady = input.pageContextReady ?? true;
  const selectionReady = input.selectionReady ?? true;
  const formApprovalReady = input.formApprovalReady ?? false;

  const templates: BrowserAssistantPromptTemplate[] = [
    {
      id: "summarize_page",
      mode: "chat",
      title: "Summarize page",
      prompt: "このページを 5 行で要約し、Oracle PoC に関係する論点を抽出してください。",
      detail: "現在 tab の title、URL、selection、capture 候補だけを添付し、ページ全体の送信は review 後に限定します。",
      risk: pageContextReady ? "safe" : "review",
      actionLabel: "Open Chat",
      evidenceLabel: pageContextReady ? "page context ready" : "attach context"
    },
    {
      id: "extract_table",
      mode: "chat",
      title: "Extract data",
      prompt: "表示中の表から key metric、owner、date を抽出して CSV preview にしてください。",
      detail: "DOM scraping ではなく、capture preview と user-selected region を根拠として draft を作ります。",
      risk: pageContextReady ? "safe" : "review",
      actionLabel: "Preview Extract",
      evidenceLabel: pageContextReady ? "capture ready" : "capture required"
    },
    {
      id: "translate_selection",
      mode: "chat",
      title: "Translate selection",
      prompt: "選択テキストを日本語に翻訳し、固有名詞と API 名は原文表記のまま残してください。",
      detail: "selection が空の場合は送信せず、機密語句の除外候補を先に表示します。",
      risk: selectionReady ? "safe" : "review",
      actionLabel: "Translate",
      evidenceLabel: selectionReady ? "selection ready" : "select text"
    },
    {
      id: "fill_form_guarded",
      mode: "agent",
      title: "Fill form with approval",
      prompt: "このフォームの必須項目を確認し、送信前に入力案と risk diff を表示してください。",
      detail: "click、type、submit は approval gate で停止し、password、token、cookie は prompt へ入れません。",
      risk: formApprovalReady ? "review" : "blocked",
      actionLabel: "Review Plan",
      evidenceLabel: formApprovalReady ? "approval gate ready" : "automation blocked"
    },
    {
      id: "save_report",
      mode: "graph",
      title: "Save repeatable report",
      prompt: "この調査手順を reusable workflow draft に変換し、保存前 diff と rollback note を作成してください。",
      detail: "Graph 保存、scheduler 登録、file write は review-only とし、workspace 内の draft として扱います。",
      risk: "review",
      actionLabel: "Draft Graph",
      evidenceLabel: "workflow preview"
    }
  ];

  return {
    title: "Try Assistant Prompts",
    subtitle: "plain English / 日本語の依頼を Chat、Agent、Graph の入口へ振り分ける clean-room prompt launcher。",
    providerLabel,
    templates,
    metrics: [
      { label: "prompts", value: String(templates.length) },
      { label: "chat", value: String(templates.filter((template) => template.mode === "chat").length) },
      { label: "guarded", value: String(templates.filter((template) => template.risk === "review").length) },
      { label: "blocked", value: String(templates.filter((template) => template.risk === "blocked").length) }
    ],
    guardrails: [
      "BrowserOS source、asset、prompt implementation は使用しない。",
      "既定 provider は OCI GenAI Enterprise AI Project に固定する。",
      "DOM click、type、submit、file write、scheduler 登録は preview から開始しない。",
      "password、token、cookie、wallet、private key は prompt に含めない。"
    ]
  };
}

function normalizeProviderLabel(value: string): string {
  const trimmed = value.trim() || "OCI GenAI Enterprise AI Project";

  return trimmed.replace(/(api[_-]?key|token|password|secret|cookie)=\S+/gi, "$1=REDACTED");
}
