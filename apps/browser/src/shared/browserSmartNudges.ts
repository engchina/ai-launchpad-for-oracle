export type BrowserSmartNudgeMode = "chat" | "agent" | "workflow" | "schedule" | "memory" | "mcp";

export type BrowserSmartNudgeType = "app_connection" | "schedule_suggestion";

export type BrowserSmartNudgeStatus = "suggested" | "suppressed";

export type BrowserSmartNudgeActionId = "connect_app" | "use_manual_browser" | "schedule_task" | "maybe_later";

export type BrowserSmartNudgeAction = {
  id: BrowserSmartNudgeActionId;
  label: string;
  enabled: boolean;
  reason: string;
};

export type BrowserSmartNudgeCard = {
  id: string;
  type: BrowserSmartNudgeType;
  title: string;
  description: string;
  triggerLabel: string;
  status: BrowserSmartNudgeStatus;
  localStateKey: string;
  primaryAction: BrowserSmartNudgeAction;
  secondaryAction: BrowserSmartNudgeAction;
  details: string[];
  guardrails: string[];
};

export type BrowserSmartNudgePreview = {
  id: string;
  title: string;
  mode: BrowserSmartNudgeMode;
  modeLabel: string;
  workspaceName: string;
  cards: BrowserSmartNudgeCard[];
  suppressedReasons: string[];
  suggestedCount: number;
  suppressedCount: number;
  enabledActionCount: number;
  stats: Array<{
    label: string;
    value: string;
  }>;
  guardrails: string[];
  localOnlyNotice: string;
};

export type BrowserSmartNudgePreviewPayload = {
  mode: BrowserSmartNudgeMode;
  workspaceName: string;
  task: string;
  completedTaskSummary?: string;
  connectedAppIds?: string[];
  declinedAppIds?: string[];
  scheduleNudgeDismissed?: boolean;
};

type AppCandidate = {
  id: string;
  label: string;
  keywords: string[];
  manualFallback: string;
};

const appCandidates: AppCandidate[] = [
  {
    id: "business_email",
    label: "Business Email",
    keywords: ["email", "mail", "メール", "送信", "reply", "follow-up", "フォローアップ"],
    manualFallback: "mail provider を browser automation で開き、送信前に本文を確認します。"
  },
  {
    id: "business_calendar",
    label: "Business Calendar",
    keywords: ["calendar", "meeting", "schedule", "予定", "会議", "調整"],
    manualFallback: "calendar web app を開き、予定作成前に日時と参加者を確認します。"
  },
  {
    id: "issue_tracker",
    label: "Issue Tracker",
    keywords: ["ticket", "issue", "jira", "linear", "課題", "チケット"],
    manualFallback: "tracker page を browser automation で開き、作成前に fields を確認します。"
  }
];

const schedulableKeywords = [
  "daily",
  "hourly",
  "monitor",
  "watch",
  "digest",
  "report",
  "readiness",
  "update",
  "毎日",
  "毎朝",
  "定期",
  "監視",
  "確認",
  "更新"
];

export function createBrowserSmartNudgesPreview(payload: BrowserSmartNudgePreviewPayload): BrowserSmartNudgePreview {
  const connectedAppIds = new Set(payload.connectedAppIds ?? []);
  const declinedAppIds = new Set(payload.declinedAppIds ?? []);
  const task = normalize(payload.task);
  const cards: BrowserSmartNudgeCard[] = [];
  const suppressedReasons: string[] = [];

  if (payload.mode === "chat") {
    suppressedReasons.push("Chat mode は read-only のため、app connection と schedule suggestion は表示しません。");
  }

  if (payload.mode === "schedule") {
    suppressedReasons.push("Scheduled task の background run 中は追加 nudge を表示しません。");
  }

  if (payload.mode !== "chat" && payload.mode !== "schedule") {
    const appCandidate = findAppCandidate(task);

    if (appCandidate) {
      if (connectedAppIds.has(appCandidate.id)) {
        suppressedReasons.push(`${appCandidate.label} は接続済みのため、connection nudge は不要です。`);
      } else if (declinedAppIds.has(appCandidate.id)) {
        suppressedReasons.push(`${appCandidate.label} はこの device で declined として記録済みです。manual fallback を使います。`);
      } else {
        cards.push(createAppConnectionCard(payload.workspaceName, appCandidate));
      }
    }

    if (isSchedulableTask(task, payload.completedTaskSummary) && !payload.scheduleNudgeDismissed) {
      cards.push(createScheduleSuggestionCard(payload));
    } else if (payload.scheduleNudgeDismissed) {
      suppressedReasons.push("Schedule suggestion はこの会話で dismissed として local state に記録済みです。");
    }
  }

  const suggestedCount = cards.filter((card) => card.status === "suggested").length;
  const suppressedCount = suppressedReasons.length;
  const enabledActionCount = cards.reduce((count, card) => {
    return count + Number(card.primaryAction.enabled) + Number(card.secondaryAction.enabled);
  }, 0);

  return {
    id: `smart-nudges-${hashSeed(`${payload.workspaceName}:${payload.mode}:${payload.task}`)}`,
    title: "Smart Nudges Preview",
    mode: payload.mode,
    modeLabel: getModeLabel(payload.mode),
    workspaceName: payload.workspaceName,
    cards,
    suppressedReasons,
    suggestedCount,
    suppressedCount,
    enabledActionCount,
    stats: [
      { label: "Suggested", value: String(suggestedCount) },
      { label: "Suppressed", value: String(suppressedCount) },
      { label: "Review actions", value: String(enabledActionCount) }
    ],
    guardrails: [
      "Smart Nudges は提案だけを表示し、接続、送信、schedule 保存は実行しません。",
      "app 連携はユーザーが認可画面で scope を確認した後にだけ有効化します。",
      "decline / dismiss は local state として扱い、cloud sync には含めません。"
    ],
    localOnlyNotice: "Smart Nudges preview は local state だけを参照します。接続、送信、schedule 作成はユーザー確認後にだけ進みます。"
  };
}

function createAppConnectionCard(workspaceName: string, app: AppCandidate): BrowserSmartNudgeCard {
  return {
    id: `app-connection-${app.id}`,
    type: "app_connection",
    title: `${app.label} を接続しますか?`,
    description: `${workspaceName} の依頼は ${app.label} があると integration 経由で進められます。未接続の場合は browser automation fallback を使います。`,
    triggerLabel: "external app required before action",
    status: "suggested",
    localStateKey: `smartNudges.declinedApps.${app.id}`,
    primaryAction: {
      id: "connect_app",
      label: "Connect",
      enabled: true,
      reason: "認可画面を開く preview です。接続が完了するまで data は共有しません。"
    },
    secondaryAction: {
      id: "use_manual_browser",
      label: "Do manually",
      enabled: true,
      reason: app.manualFallback
    },
    details: [
      "接続前に app scope と workspace を表示する。",
      "decline は local state に保存し、同じ app は会話中に再表示しない。",
      app.manualFallback
    ],
    guardrails: [
      "app に data を送るのはユーザー認可後だけ。",
      "送信、予定作成、ticket 作成は最終確認で停止する。"
    ]
  };
}

function createScheduleSuggestionCard(payload: BrowserSmartNudgePreviewPayload): BrowserSmartNudgeCard {
  const name = deriveScheduleName(payload.task);

  return {
    id: "schedule-suggestion-recurring-task",
    type: "schedule_suggestion",
    title: "この task を自動実行しますか?",
    description: `${name} を schedule card として開き、prompt、cadence、workspace を確認してから保存できます。`,
    triggerLabel: "task completed and looks repeatable",
    status: "suggested",
    localStateKey: `smartNudges.dismissedSchedule.${hashSeed(payload.task)}`,
    primaryAction: {
      id: "schedule_task",
      label: "Schedule task",
      enabled: true,
      reason: "Scheduled Tasks page に prefill する preview です。保存前に cadence と prompt を編集できます。"
    },
    secondaryAction: {
      id: "maybe_later",
      label: "Maybe later",
      enabled: true,
      reason: "この会話では schedule suggestion を閉じます。後から Scheduled Tasks で作成できます。"
    },
    details: [
      `Task name: ${name}`,
      `Prompt: ${trimForPreview(payload.task, 96)}`,
      "Suggested cadence: daily 08:00 / Asia/Tokyo"
    ],
    guardrails: [
      "background run でも destructive action は approval gate で停止する。",
      "credential が必要な run は skipped として記録する。"
    ]
  };
}

function findAppCandidate(normalizedTask: string): AppCandidate | undefined {
  return appCandidates.find((candidate) => candidate.keywords.some((keyword) => normalizedTask.includes(keyword.toLowerCase())));
}

function isSchedulableTask(normalizedTask: string, completedTaskSummary?: string): boolean {
  const summary = normalize(completedTaskSummary ?? "");
  return schedulableKeywords.some((keyword) => normalizedTask.includes(keyword.toLowerCase()) || summary.includes(keyword.toLowerCase()));
}

function deriveScheduleName(task: string): string {
  if (normalize(task).includes("readiness")) {
    return "PoC readiness digest";
  }

  if (normalize(task).includes("update") || task.includes("更新")) {
    return "Oracle Docs update watch";
  }

  return "Recurring browser task";
}

function getModeLabel(mode: BrowserSmartNudgeMode): string {
  const labels: Record<BrowserSmartNudgeMode, string> = {
    chat: "Chat / read-only",
    agent: "Agent",
    workflow: "Workflow",
    schedule: "Scheduled run",
    memory: "Memory",
    mcp: "MCP"
  };

  return labels[mode];
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function trimForPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}
