export type BrowserAiModeOnboardingModeId = "chat" | "agent" | "graph";

export type BrowserAiModeOnboardingStatus = "ready" | "needs_review" | "planned";

export type BrowserAiModeOnboardingMode = {
  id: BrowserAiModeOnboardingModeId;
  label: string;
  eyebrow: string;
  summary: string;
  status: BrowserAiModeOnboardingStatus;
  primaryAction: string;
  evidenceLabel: string;
  guardrail: string;
};

export type BrowserAiModeOnboardingStep = {
  id: string;
  label: string;
  detail: string;
};

export type BrowserAiModeOnboardingStat = {
  label: string;
  value: string;
};

export type BrowserAiModeOnboardingPreview = {
  title: string;
  subtitle: string;
  providerLabel: string;
  workspaceName: string;
  localOnlyNotice: string;
  stats: BrowserAiModeOnboardingStat[];
  modes: BrowserAiModeOnboardingMode[];
  quickStart: BrowserAiModeOnboardingStep[];
  guardrails: string[];
};

type CreateBrowserAiModeOnboardingPreviewInput = {
  workspaceName?: string;
  providerLabel?: string;
  pageContextReady?: boolean;
  agentApprovalReady?: boolean;
  graphDraftReady?: boolean;
};

export function createBrowserAiModeOnboardingPreview(
  input: CreateBrowserAiModeOnboardingPreviewInput = {}
): BrowserAiModeOnboardingPreview {
  const workspaceName = input.workspaceName?.trim() || "Oracle PoC Workspace";
  const providerLabel = input.providerLabel?.trim() || "OCI GenAI Enterprise AI Project";
  const pageContextReady = input.pageContextReady ?? true;
  const agentApprovalReady = input.agentApprovalReady ?? true;
  const graphDraftReady = input.graphDraftReady ?? false;

  const modes: BrowserAiModeOnboardingMode[] = [
    {
      id: "chat",
      label: "Chat Mode",
      eyebrow: "Ask the page",
      summary: "現在ページ、capture、Knowledge を使って、要約、抽出、翻訳、Q&A の回答草案を作成します。",
      status: pageContextReady ? "ready" : "needs_review",
      primaryAction: "Open Chat",
      evidenceLabel: pageContextReady ? "page context ready" : "attach page context",
      guardrail: "送信前に source と添付範囲を表示し、secret は prompt から除外します。"
    },
    {
      id: "agent",
      label: "Agent Mode",
      eyebrow: "Words to actions",
      summary: "自然言語の依頼を observe、plan、approve、act、record の browser action loop に変換します。",
      status: agentApprovalReady ? "needs_review" : "planned",
      primaryAction: "Review Plan",
      evidenceLabel: agentApprovalReady ? "approval gate ready" : "approval gate required",
      guardrail: "click、type、navigate、submit は risk に応じて停止し、destructive action は実行しません。"
    },
    {
      id: "graph",
      label: "Graph Mode",
      eyebrow: "Repeatable workflow",
      summary: "繰り返す作業を visual graph として編集し、test run と保存前 diff を確認できる形にします。",
      status: graphDraftReady ? "needs_review" : "planned",
      primaryAction: "Draft Graph",
      evidenceLabel: graphDraftReady ? "workflow draft ready" : "graph preview only",
      guardrail: "保存、再実行、外部 app node は review-only とし、credential は graph に保存しません。"
    }
  ];

  return {
    title: "Three Ways to Use AI",
    subtitle: "Chat、Agent、Graph を同じ browser workspace から切り替える clean-room onboarding preview。",
    providerLabel,
    workspaceName,
    localOnlyNotice: "この preview は local UI contract のみです。OCI call、browser automation、workflow 保存は開始しません。",
    stats: [
      { label: "AI modes", value: String(modes.length) },
      { label: "Default provider", value: "OCI" },
      { label: "Context", value: pageContextReady ? "ready" : "review" },
      { label: "Automation", value: agentApprovalReady ? "guarded" : "planned" }
    ],
    modes,
    quickStart: [
      {
        id: "attach-context",
        label: "Attach context",
        detail: "現在 tab、selection、capture、Knowledge のうち送信する範囲を確認します。"
      },
      {
        id: "choose-mode",
        label: "Choose mode",
        detail: "Q&A は Chat、browser 操作は Agent、繰り返し作業は Graph に分けます。"
      },
      {
        id: "review-risk",
        label: "Review risk",
        detail: "外部送信、credential、destructive action は approval gate で停止します。"
      },
      {
        id: "run-local-first",
        label: "Run local-first",
        detail: `${providerLabel} を既定にし、capture と run history は workspace に残します。`
      }
    ],
    guardrails: [
      "BrowserOS の source、asset、UI implementation は使用しない。",
      "既定 provider は OCI GenAI Enterprise AI Project に固定する。",
      "API key、token、cookie、wallet、private key は onboarding prompt に含めない。",
      "Agent / Graph の実行や保存は preview では開始しない。"
    ]
  };
}
