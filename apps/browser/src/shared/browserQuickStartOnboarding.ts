export type BrowserQuickStartStepId = "sign_in" | "import_chrome" | "configure_ai" | "try_assistant";
export type BrowserQuickStartStepStatus = "ready" | "review_only" | "blocked";

export type BrowserQuickStartStep = {
  id: BrowserQuickStartStepId;
  label: string;
  detail: string;
  status: BrowserQuickStartStepStatus;
  actionLabel: string;
  evidenceLabel: string;
};

export type BrowserQuickStartMetric = {
  label: string;
  value: string;
};

export type BrowserQuickStartOnboardingPreview = {
  title: string;
  subtitle: string;
  providerLabel: string;
  metrics: BrowserQuickStartMetric[];
  steps: BrowserQuickStartStep[];
  guardrails: string[];
};

type BrowserQuickStartOnboardingInput = {
  providerLabel?: string;
  signedIn?: boolean;
  chromeImportReviewed?: boolean;
  assistantReady?: boolean;
};

export function createBrowserQuickStartOnboardingPreview(
  input: BrowserQuickStartOnboardingInput = {}
): BrowserQuickStartOnboardingPreview {
  const providerLabel = input.providerLabel?.trim() || "OCI GenAI Enterprise AI Project";
  const signedIn = input.signedIn ?? false;
  const chromeImportReviewed = input.chromeImportReviewed ?? false;
  const assistantReady = input.assistantReady ?? true;
  const steps: BrowserQuickStartStep[] = [
    {
      id: "sign_in",
      label: "Sign in",
      detail: "Cloud Sign In preview で sync candidate、local-only scope、excluded credential を確認します。",
      status: signedIn ? "ready" : "review_only",
      actionLabel: signedIn ? "Signed in" : "Review sign-in",
      evidenceLabel: signedIn ? "account connected" : "local-only preview"
    },
    {
      id: "import_chrome",
      label: "Import from Chrome",
      detail: "bookmarks と extension permission を review し、history、password、cookie は blocked として扱います。",
      status: chromeImportReviewed ? "ready" : "review_only",
      actionLabel: chromeImportReviewed ? "Import reviewed" : "Preview import",
      evidenceLabel: chromeImportReviewed ? "review complete" : "profile read disabled"
    },
    {
      id: "configure_ai",
      label: "Configure AI",
      detail: `${providerLabel} を既定 provider として使い、外部 BYOK provider と secret store 更新は行いません。`,
      status: "ready",
      actionLabel: "Provider ready",
      evidenceLabel: "OCI default"
    },
    {
      id: "try_assistant",
      label: "Try Assistant",
      detail: "任意の Oracle page で Chat、Agent、Graph を切り替え、page context と approval gate を確認します。",
      status: assistantReady ? "ready" : "blocked",
      actionLabel: assistantReady ? "Open workspace" : "Needs context",
      evidenceLabel: assistantReady ? "toolbar ready" : "page context missing"
    }
  ];

  return {
    title: "Quick Start Preview",
    subtitle: "BrowserOS-like setup flow を、OCI GenAI Enterprise AI Project と local-first guardrails に合わせた clean-room checklist。",
    providerLabel,
    metrics: [
      { label: "steps", value: String(steps.length) },
      { label: "ready", value: String(steps.filter((step) => step.status === "ready").length) },
      { label: "review", value: String(steps.filter((step) => step.status === "review_only").length) },
      { label: "blocked", value: String(steps.filter((step) => step.status === "blocked").length) }
    ],
    steps,
    guardrails: [
      "BrowserOS source、asset、onboarding implementation は使用しない。",
      "Chrome profile、password DB、cookie DB は preview で読み取らない。",
      "既定 provider は OCI GenAI Enterprise AI Project に固定する。",
      "Assistant の automation は approval gate までで、実 click / type / submit は開始しない。"
    ]
  };
}
