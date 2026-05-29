import type { PageSourceType } from "./api";

export type BrowserAgentActionKind =
  | "observe_page"
  | "extract_page"
  | "ask_oci_genai"
  | "save_capture"
  | "generate_poc_assets"
  | "prepare_mcp_scope"
  | "schedule_task"
  | "destructive_browser_action";

export type BrowserAgentActionRisk = "safe" | "review" | "blocked";
export type BrowserAgentApprovalState = "not_required" | "required" | "blocked";
export type BrowserAgentStepStatus = "planned" | "waiting_approval" | "approved" | "blocked" | "skipped";

export type BrowserAgentPlanContext = {
  workspaceName: string;
  playbookTitle: string;
  currentUrl: string;
  currentTitle: string;
  sourceType: PageSourceType;
};

export type CreateBrowserAgentPlanPayload = BrowserAgentPlanContext & {
  task: string;
};

export type BrowserAgentAction = {
  kind: BrowserAgentActionKind;
  label: string;
  target: string;
  description: string;
};

export type BrowserAgentPlanStep = {
  id: string;
  order: number;
  title: string;
  action: BrowserAgentAction;
  risk: BrowserAgentActionRisk;
  approval: BrowserAgentApprovalState;
  status: BrowserAgentStepStatus;
  rationale: string;
};

export type BrowserAgentPlan = {
  task: string;
  summary: string;
  context: BrowserAgentPlanContext;
  steps: BrowserAgentPlanStep[];
  approvalSummary: {
    safe: number;
    review: number;
    blocked: number;
  };
};

const defaultAgentTask = "現在ページから PoC 準備に必要な要点を整理し、capture と follow-up の材料を作成する。";
const destructivePattern =
  /(delete|remove|terminate|drop|truncate|purchase|buy|submit|send|grant|revoke|update\s+policy|change\s+policy|削除|送信|購入|権限変更|終了|停止)/i;
const schedulePattern = /(schedule|daily|weekly|hourly|watch|monitor|定期|毎日|毎週|監視)/i;
const mcpPattern = /(mcp|connector|app|tool|gmail|slack|calendar|jira|service now|外部|連携)/i;

function normalizeTask(task: string): string {
  return task.replace(/\s+/g, " ").trim() || defaultAgentTask;
}

function getHostLabel(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "current page";
  }
}

function sourceLabel(sourceType: PageSourceType): string {
  const labels: Record<PageSourceType, string> = {
    oracle_docs: "Oracle Docs",
    oci_console: "OCI Console",
    livelabs: "Oracle LiveLabs",
    github: "GitHub",
    other: "Web"
  };

  return labels[sourceType];
}

export function classifyBrowserAgentAction(
  action: BrowserAgentAction,
  context: BrowserAgentPlanContext
): Pick<BrowserAgentPlanStep, "risk" | "approval" | "status" | "rationale"> {
  if (action.kind === "destructive_browser_action") {
    return {
      risk: "blocked",
      approval: "blocked",
      status: "blocked",
      rationale: "削除、送信、購入、権限変更などの破壊的 browser action は preview で停止します。"
    };
  }

  if (context.sourceType === "oci_console" && destructivePattern.test(`${action.label} ${action.description}`)) {
    return {
      risk: "blocked",
      approval: "blocked",
      status: "blocked",
      rationale: "OCI Console 上の変更操作は read-only plan に落とし、自動実行しません。"
    };
  }

  if (action.kind === "ask_oci_genai") {
    return {
      risk: "review",
      approval: "required",
      status: "waiting_approval",
      rationale: "ページ文脈を OCI Generative AI に送る前に、送信範囲をユーザーが確認します。"
    };
  }

  if (action.kind === "generate_poc_assets" || action.kind === "prepare_mcp_scope" || action.kind === "schedule_task") {
    return {
      risk: "review",
      approval: "required",
      status: "waiting_approval",
      rationale: "artifact 生成、外部 connector、定期実行は workspace への影響があるため承認が必要です。"
    };
  }

  return {
    risk: "safe",
    approval: "not_required",
    status: "planned",
    rationale: "現在ページの観測またはローカル保存 preview だけを行うため、自動計画に含められます。"
  };
}

function createStep(
  order: number,
  title: string,
  action: BrowserAgentAction,
  context: BrowserAgentPlanContext
): BrowserAgentPlanStep {
  const classification = classifyBrowserAgentAction(action, context);

  return {
    id: `agent-step-${String(order).padStart(2, "0")}-${action.kind}`,
    order,
    title,
    action,
    ...classification
  };
}

function summarizeApproval(steps: BrowserAgentPlanStep[]): BrowserAgentPlan["approvalSummary"] {
  return steps.reduce(
    (summary, step) => ({
      safe: summary.safe + (step.risk === "safe" ? 1 : 0),
      review: summary.review + (step.risk === "review" ? 1 : 0),
      blocked: summary.blocked + (step.risk === "blocked" ? 1 : 0)
    }),
    { safe: 0, review: 0, blocked: 0 }
  );
}

export function createBrowserAgentPlan(payload: CreateBrowserAgentPlanPayload): BrowserAgentPlan {
  const task = normalizeTask(payload.task);
  const context: BrowserAgentPlanContext = {
    workspaceName: payload.workspaceName,
    playbookTitle: payload.playbookTitle,
    currentUrl: payload.currentUrl,
    currentTitle: payload.currentTitle,
    sourceType: payload.sourceType
  };
  const hostLabel = getHostLabel(payload.currentUrl);
  const steps = [
    createStep(
      1,
      "ページ状態を観測",
      {
        kind: "observe_page",
        label: "Observe",
        target: hostLabel,
        description: `${sourceLabel(payload.sourceType)} の title、URL、表示状態を読み取る。`
      },
      context
    ),
    createStep(
      2,
      "提案文脈を抽出",
      {
        kind: "extract_page",
        label: "Extract",
        target: payload.currentTitle,
        description: `${payload.playbookTitle} に必要な前提、手順、注意点を抽出する。`
      },
      context
    ),
    createStep(
      3,
      "OCI GenAI で計画を補強",
      {
        kind: "ask_oci_genai",
        label: "Ask OCI GenAI",
        target: payload.workspaceName,
        description: "Enterprise AI Project の model に、観測済み文脈だけを送って action plan を整える。"
      },
      context
    ),
    createStep(
      4,
      "Capture に記録",
      {
        kind: "save_capture",
        label: "Save capture",
        target: payload.workspaceName,
        description: "ページ URL、title、agent plan summary を local capture に保存する。"
      },
      context
    ),
    createStep(
      5,
      "PoC artifact を準備",
      {
        kind: "generate_poc_assets",
        label: "Generate artifacts",
        target: payload.playbookTitle,
        description: "README、follow-up、checklist、SQL preview の生成候補を作る。"
      },
      context
    )
  ];

  if (schedulePattern.test(task)) {
    steps.push(
      createStep(
        steps.length + 1,
        "定期実行候補を作成",
        {
          kind: "schedule_task",
          label: "Prepare schedule",
          target: payload.workspaceName,
          description: "prompt、cadence、approval policy を scheduler draft として作る。"
        },
        context
      )
    );
  }

  if (mcpPattern.test(task)) {
    steps.push(
      createStep(
        steps.length + 1,
        "MCP tool scope を確認",
        {
          kind: "prepare_mcp_scope",
          label: "Prepare MCP scope",
          target: payload.workspaceName,
          description: "browser tool と Oracle connector tool の許可範囲を draft 化する。"
        },
        context
      )
    );
  }

  if (destructivePattern.test(task)) {
    steps.push(
      createStep(
        steps.length + 1,
        "危険操作を停止",
        {
          kind: "destructive_browser_action",
          label: "Blocked action",
          target: sourceLabel(payload.sourceType),
          description: "ユーザー依頼に破壊的操作が含まれるため、実行せず read-only plan に変換する。"
        },
        context
      )
    );
  }

  return {
    task,
    summary: `${sourceLabel(payload.sourceType)} の現在ページを ${payload.playbookTitle} の PoC 準備に変換する clean-room agent plan です。`,
    context,
    steps,
    approvalSummary: summarizeApproval(steps)
  };
}

export function applyBrowserAgentApprovals(plan: BrowserAgentPlan, approvedStepIds: string[]): BrowserAgentPlan {
  const approved = new Set(approvedStepIds);
  const steps: BrowserAgentPlanStep[] = plan.steps.map((step) => {
    if (step.status === "blocked") {
      return step;
    }

    if (step.approval === "required") {
      const status: BrowserAgentStepStatus = approved.has(step.id) ? "approved" : "skipped";
      return {
        ...step,
        status
      };
    }

    return step;
  });

  return {
    ...plan,
    steps,
    approvalSummary: summarizeApproval(steps)
  };
}
