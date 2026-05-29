import {
  applyBrowserAgentApprovals,
  type BrowserAgentActionRisk,
  type BrowserAgentPlan,
  type BrowserAgentPlanStep
} from "./agentActions";

export type BrowserAgentRunStatus = "completed" | "needs_approval" | "blocked";
export type BrowserAgentRunStepStatus = "completed" | "approved" | "skipped" | "blocked";
export type BrowserAgentRunEventLevel = "info" | "approval" | "blocked";

export type BrowserAgentRunStep = {
  stepId: string;
  order: number;
  title: string;
  actionLabel: string;
  actionKind: BrowserAgentPlanStep["action"]["kind"];
  risk: BrowserAgentActionRisk;
  status: BrowserAgentRunStepStatus;
  message: string;
};

export type BrowserAgentRunEvent = {
  id: string;
  stepId: string;
  level: BrowserAgentRunEventLevel;
  message: string;
  createdAt: string;
};

export type BrowserAgentRun = {
  id: string;
  task: string;
  status: BrowserAgentRunStatus;
  startedAt: string;
  completedAt: string;
  planSummary: string;
  workspaceName: string;
  steps: BrowserAgentRunStep[];
  events: BrowserAgentRunEvent[];
};

function hashSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).padStart(6, "0").slice(0, 6);
}

function createRunId(task: string, startedAt: string): string {
  const timestamp = startedAt.replace(/[^0-9]/g, "").slice(0, 14) || "00000000000000";

  return `agent-run-${timestamp}-${hashSeed(task)}`;
}

function createRunStep(step: BrowserAgentPlanStep): BrowserAgentRunStep {
  if (step.status === "blocked") {
    return {
      stepId: step.id,
      order: step.order,
      title: step.title,
      actionLabel: step.action.label,
      actionKind: step.action.kind,
      risk: step.risk,
      status: "blocked",
      message: "blocked policy により dry-run で停止しました。"
    };
  }

  if (step.approval === "required" && step.status === "approved") {
    return {
      stepId: step.id,
      order: step.order,
      title: step.title,
      actionLabel: step.action.label,
      actionKind: step.action.kind,
      risk: step.risk,
      status: "approved",
      message: "ユーザー承認済みとして dry-run に含めました。"
    };
  }

  if (step.approval === "required") {
    return {
      stepId: step.id,
      order: step.order,
      title: step.title,
      actionLabel: step.action.label,
      actionKind: step.action.kind,
      risk: step.risk,
      status: "skipped",
      message: "承認がないため実行対象から除外しました。"
    };
  }

  return {
    stepId: step.id,
    order: step.order,
    title: step.title,
    actionLabel: step.action.label,
    actionKind: step.action.kind,
    risk: step.risk,
    status: "completed",
    message: "read-only または local preview として完了扱いにしました。"
  };
}

function createRunEvent(runStep: BrowserAgentRunStep, createdAt: string): BrowserAgentRunEvent {
  const eventLevel: Record<BrowserAgentRunStepStatus, BrowserAgentRunEventLevel> = {
    completed: "info",
    approved: "approval",
    skipped: "approval",
    blocked: "blocked"
  };

  return {
    id: `${runStep.stepId}-${runStep.status}`,
    stepId: runStep.stepId,
    level: eventLevel[runStep.status],
    message: `${runStep.actionLabel}: ${runStep.message}`,
    createdAt
  };
}

function summarizeRunStatus(steps: BrowserAgentRunStep[]): BrowserAgentRunStatus {
  if (steps.some((step) => step.status === "blocked")) {
    return "blocked";
  }

  if (steps.some((step) => step.status === "skipped")) {
    return "needs_approval";
  }

  return "completed";
}

export function createBrowserAgentRunPreview(
  plan: BrowserAgentPlan,
  approvedStepIds: string[] = [],
  startedAt = new Date().toISOString()
): BrowserAgentRun {
  const approvedPlan = applyBrowserAgentApprovals(plan, approvedStepIds);
  const steps = approvedPlan.steps.map(createRunStep);
  const status = summarizeRunStatus(steps);

  return {
    id: createRunId(approvedPlan.task, startedAt),
    task: approvedPlan.task,
    status,
    startedAt,
    completedAt: startedAt,
    planSummary: approvedPlan.summary,
    workspaceName: approvedPlan.context.workspaceName,
    steps,
    events: steps.map((step) => createRunEvent(step, startedAt))
  };
}
