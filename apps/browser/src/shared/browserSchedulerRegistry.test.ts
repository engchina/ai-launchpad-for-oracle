import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { BrowserAgentRun } from "./agentRuns";
import type { BrowserMcpRunHistoryEntry } from "./browserMcpRunHistory";
import {
  appendBrowserSchedulerRunHistory,
  applyBrowserScheduleCardEdit,
  applyBrowserScheduledTaskDryRunHistoryCandidatePreview,
  calculateNextBrowserScheduleRunAt,
  createBrowserScheduleApprovedReviewDraft,
  createBrowserScheduleHandoffReview,
  createBrowserScheduleHandoffReviewDraft,
  createBrowserScheduleReviewApprovalPreview,
  createBrowserScheduleCardEditDraft,
  createBrowserSavedScheduleTaskDetail,
  createBrowserScheduledTaskBackgroundRunPreview,
  createBrowserScheduledTaskDryRunHistoryCandidate,
  createBrowserScheduledTaskHistoryStoreCommitPreview,
  createBrowserScheduledTaskManualRunConfirmation,
  createBrowserScheduledTaskNewTabInboxActionHandoffPreview,
  createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview,
  createBrowserScheduledTaskNewTabInboxActionQueuePreview,
  createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview,
  createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview,
  createBrowserScheduledTaskNewTabInboxFilterPreview,
  createBrowserScheduledTaskNewTabInboxPreview,
  createBrowserScheduledTaskNewTabInboxTriagePreview,
  createBrowserScheduledTaskNewTabResultFilterPreview,
  createBrowserScheduledTaskNewTabResultPreview,
  createBrowserScheduledTaskNewTabResultStackPreview,
  createBrowserScheduledTaskNewTabTracePreview,
  createBrowserScheduledTaskRunCapturePreview,
  createBrowserScheduledTaskRunCaptureKnowledgeDraft,
  createBrowserScheduledTaskRunCaptureSaveConfirmation,
  createBrowserScheduledTaskRunCaptureStoreDraft,
  createBrowserScheduledTaskRunOutputPreview,
  createBrowserScheduledTasksPagePreview,
  createBrowserSchedulerRegistryPreview,
  createBrowserScheduleSuggestionCard,
  createBrowserSchedulerTaskDraftFromAssistantRunHistory,
  createBrowserSchedulerTaskDraftFromRunHistory,
  formatBrowserScheduleCadence,
  mergeBrowserSchedulerTaskDrafts,
  selectBrowserScheduleEditorSource,
  toggleBrowserSchedulerTaskEnabled,
  type BrowserSchedulerTaskDraft
} from "./browserSchedulerRegistry";

const completedRun: BrowserAgentRun = {
  id: "agent-run-mcp-history-audit-1",
  task: "Record MCP tool call navigate",
  status: "completed",
  startedAt: "2026-05-28T12:00:00.000Z",
  completedAt: "2026-05-28T12:00:00.000Z",
  planSummary: "tools/call / navigate を workflow / scheduler 共通の run history contract に変換しました。",
  workspaceName: "Oracle PoC Workspace",
  steps: [
    {
      stepId: "mcp-history-audit-1",
      order: 1,
      title: "MCP run history: navigate",
      actionLabel: "navigate",
      actionKind: "prepare_mcp_scope",
      risk: "review",
      status: "approved",
      message: "保存済み approval decision と一致し、guarded dry-run executor の結果として記録しました。"
    }
  ],
  events: [
    {
      id: "mcp-history-audit-1-approved",
      stepId: "mcp-history-audit-1",
      level: "approval",
      message: "navigate: guarded dry-run executor の結果として記録しました。",
      createdAt: "2026-05-28T12:00:00.000Z"
    }
  ]
};

const recordedEntry: BrowserMcpRunHistoryEntry = {
  id: "mcp-run-history-audit-1",
  auditEventId: "audit-1",
  occurredAt: "2026-05-28T12:00:00.000Z",
  sessionId: "session-1",
  requestId: "request-1",
  workspaceName: "Oracle PoC Workspace",
  mcpMethod: "tools/call",
  toolId: "navigate",
  stage: "recorded",
  status: "completed",
  executionStatus: "completed",
  approvalDecisionStatus: "approved_preview",
  schedulerPolicy: "manual_preview_only",
  title: "navigate / recorded",
  summary: "tools/call / navigate を workflow / scheduler 共通の run history contract に変換しました。",
  run: completedRun
};

test("formatBrowserScheduleCadence formats supported schedule types", () => {
  assert.equal(formatBrowserScheduleCadence({ type: "daily", timeOfDay: "08:00", timezone: "Asia/Tokyo" }), "毎日 08:00 / Asia/Tokyo");
  assert.equal(formatBrowserScheduleCadence({ type: "hourly", intervalHours: 25 }), "24時間ごと");
  assert.equal(formatBrowserScheduleCadence({ type: "minutes", intervalMinutes: 0 }), "1分ごと");
});

test("calculateNextBrowserScheduleRunAt supports daily hourly and minute cadences", () => {
  assert.equal(
    calculateNextBrowserScheduleRunAt({ type: "daily", timeOfDay: "08:00", timezone: "Asia/Tokyo" }, "2026-05-28T07:30:00.000Z"),
    "2026-05-28T08:00:00.000Z"
  );
  assert.equal(
    calculateNextBrowserScheduleRunAt({ type: "daily", timeOfDay: "08:00", timezone: "Asia/Tokyo" }, "2026-05-28T08:30:00.000Z"),
    "2026-05-29T08:00:00.000Z"
  );
  assert.equal(calculateNextBrowserScheduleRunAt({ type: "hourly", intervalHours: 6 }, "2026-05-28T08:30:00.000Z"), "2026-05-28T14:30:00.000Z");
  assert.equal(calculateNextBrowserScheduleRunAt({ type: "minutes", intervalMinutes: 30 }, "2026-05-28T08:30:00.000Z"), "2026-05-28T09:00:00.000Z");
});

test("createBrowserSchedulerTaskDraftFromRunHistory creates ready drafts for recorded run history", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");

  assert.equal(draft.source, "mcp_run_history");
  assert.equal(draft.status, "ready");
  assert.equal(draft.enabled, true);
  assert.equal(draft.approvalPolicy, "manual_review_required");
  assert.equal(draft.cadenceLabel, "6時間ごと");
  assert.equal(draft.nextRunAt, "2026-05-28T15:00:00.000Z");
  assert.equal(draft.runHistory.length, 1);
});

test("createBrowserSchedulerTaskDraftFromRunHistory keeps approval-gated history disabled", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-waiting",
      stage: "approval_gate",
      status: "needs_approval",
      executionStatus: "waiting_approval",
      approvalDecisionStatus: undefined,
      run: {
        ...completedRun,
        id: "agent-run-waiting",
        status: "needs_approval"
      }
    },
    { cadence: { type: "minutes", intervalMinutes: 15 } },
    "2026-05-28T09:00:00.000Z"
  );

  assert.equal(draft.status, "needs_approval");
  assert.equal(draft.enabled, false);
  assert.equal(draft.nextRunAt, undefined);
  assert.equal(draft.approvalPolicy, "read_only_auto_preview");
});

test("createBrowserSchedulerTaskDraftFromAssistantRunHistory creates ready drafts for completed assistant runs", () => {
  const draft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(completedRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(draft);
  assert.equal(draft.source, "assistant_run_history");
  assert.equal(draft.status, "ready");
  assert.equal(draft.enabled, true);
  assert.equal(draft.approvalPolicy, "read_only_auto_preview");
  assert.equal(draft.cadenceLabel, "12時間ごと");
  assert.equal(draft.nextRunAt, "2026-05-28T21:00:00.000Z");
  assert.equal(draft.sourceRunHistoryId, completedRun.id);
  assert.equal(draft.runHistory[0]?.id, completedRun.id);
});

test("createBrowserSchedulerTaskDraftFromAssistantRunHistory keeps approval-gated assistant runs disabled", () => {
  const approvalRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-assistant-approval",
    task: "Fill form with approval / OCI GenAI Enterprise AI Project",
    status: "needs_approval"
  };
  const draft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(approvalRun, {}, "2026-05-28T09:00:00.000Z");
  const card = createBrowserScheduleSuggestionCard(draft ?? undefined);

  assert.ok(draft);
  assert.equal(draft.status, "needs_approval");
  assert.equal(draft.enabled, false);
  assert.equal(draft.approvalPolicy, "manual_review_required");
  assert.equal(draft.nextRunAt, undefined);
  assert.ok(card);
  assert.equal(card.canConfirm, false);
  assert.match(card.description, /assistant run history/);
});

test("appendBrowserSchedulerRunHistory caps stored runs at 15", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  let appended: BrowserSchedulerTaskDraft = draft;

  for (let index = 0; index < 20; index += 1) {
    appended = appendBrowserSchedulerRunHistory(appended, {
      ...completedRun,
      id: `run-${index}`,
      startedAt: `2026-05-28T12:${String(index).padStart(2, "0")}:00.000Z`
    });
  }

  assert.equal(appended.runHistory.length, 15);
  assert.equal(appended.runHistory[0]?.id, "run-19");
  assert.equal(appended.lastRunStatus, "completed");
});

test("mergeBrowserSchedulerTaskDrafts keeps handoff drafts first without duplicates", () => {
  const mcpDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const assistantDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(completedRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(assistantDraft);
  const merged = mergeBrowserSchedulerTaskDrafts(assistantDraft, [mcpDraft, assistantDraft]);

  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.id, assistantDraft.id);
  assert.deepEqual(merged.map((task) => task.id), [...new Set(merged.map((task) => task.id))]);
  assert.deepEqual(mergeBrowserSchedulerTaskDrafts(null, [mcpDraft]), [mcpDraft]);
});

test("createBrowserScheduleHandoffReview saves approval-gated assistant drafts as review-only", () => {
  const approvalRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-review",
    task: "Fill form with approval / OCI GenAI Enterprise AI Project",
    status: "needs_approval"
  };
  const draft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(approvalRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(draft);
  const review = createBrowserScheduleHandoffReview(draft);
  const reviewDraft = createBrowserScheduleHandoffReviewDraft(draft);

  assert.ok(review);
  assert.equal(review.status, "ready_to_review");
  assert.equal(review.canSaveReviewDraft, true);
  assert.equal(review.metadata.find((item) => item.label === "next")?.value, "review required");
  assert.ok(reviewDraft);
  assert.equal(reviewDraft.status, "needs_approval");
  assert.notEqual(reviewDraft.id, draft.id);
  assert.equal(reviewDraft.sourceRunHistoryId, draft.sourceRunHistoryId);
  assert.equal(reviewDraft.enabled, false);
  assert.equal(reviewDraft.nextRunAt, undefined);
  assert.equal(reviewDraft.approvalPolicy, "manual_review_required");
});

test("createBrowserScheduleHandoffReview does not create review drafts for ready or blocked tasks", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(completedRun, {}, "2026-05-28T09:00:00.000Z");
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-review",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-review",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );

  assert.ok(readyDraft);
  assert.equal(createBrowserScheduleHandoffReview(readyDraft)?.status, "ready_task");
  assert.equal(createBrowserScheduleHandoffReviewDraft(readyDraft), null);
  assert.equal(createBrowserScheduleHandoffReview(blockedDraft)?.status, "blocked");
  assert.equal(createBrowserScheduleHandoffReviewDraft(blockedDraft), null);
});

test("createBrowserScheduleReviewApprovalPreview approves review drafts without enabling runs", () => {
  const approvalRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-approval",
    task: "Fill form with approval / OCI GenAI Enterprise AI Project",
    status: "needs_approval"
  };
  const draft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(approvalRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(draft);
  if (!draft) {
    throw new Error("approval draft should be created");
  }
  const reviewDraft = createBrowserScheduleHandoffReviewDraft(draft);

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("review draft should be created");
  }
  const approvalPreview = createBrowserScheduleReviewApprovalPreview(reviewDraft);
  const approvedDraft = createBrowserScheduleApprovedReviewDraft(reviewDraft);

  assert.ok(approvalPreview);
  assert.equal(approvalPreview.status, "ready_to_approve");
  assert.equal(approvalPreview.canApprove, true);
  assert.equal(approvalPreview.approvedStatus, "disabled");
  assert.ok(approvedDraft);
  assert.equal(approvedDraft.id, reviewDraft.id);
  assert.equal(approvedDraft.sourceRunHistoryId, reviewDraft.sourceRunHistoryId);
  assert.equal(approvedDraft.status, "disabled");
  assert.equal(approvedDraft.enabled, false);
  assert.equal(approvedDraft.nextRunAt, undefined);
  assert.equal(approvedDraft.approvalPolicy, "manual_review_required");
  assert.equal(createBrowserScheduleCardEditDraft(approvedDraft)?.canEnable, true);
});

test("createBrowserScheduleReviewApprovalPreview rejects ready and blocked tasks", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(completedRun, {}, "2026-05-28T09:00:00.000Z");
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-approval",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-approval",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );

  assert.ok(readyDraft);
  assert.equal(createBrowserScheduleReviewApprovalPreview(readyDraft)?.status, "already_ready");
  assert.equal(createBrowserScheduleApprovedReviewDraft(readyDraft), null);
  assert.equal(createBrowserScheduleReviewApprovalPreview(blockedDraft)?.status, "blocked");
  assert.equal(createBrowserScheduleApprovedReviewDraft(blockedDraft), null);
});

test("selectBrowserScheduleEditorSource prioritizes selected approved disabled tasks", () => {
  const approvalRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-editor-source",
    task: "Fill form with approval / OCI GenAI Enterprise AI Project",
    status: "needs_approval"
  };
  const handoffDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(approvalRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(handoffDraft);
  if (!handoffDraft) {
    throw new Error("handoff draft should be created");
  }
  const approvedDraft = createBrowserScheduleApprovedReviewDraft(createBrowserScheduleHandoffReviewDraft(handoffDraft));

  assert.ok(approvedDraft);
  if (!approvedDraft) {
    throw new Error("approved draft should be created");
  }
  const selectedSource = selectBrowserScheduleEditorSource({
    selectedTaskId: approvedDraft.id,
    assistantTask: handoffDraft,
    tasks: [handoffDraft, approvedDraft]
  });

  assert.equal(selectedSource?.id, approvedDraft.id);
  assert.equal(createBrowserScheduleCardEditDraft(selectedSource)?.canEnable, true);
});

test("selectBrowserScheduleEditorSource keeps non-editable selections behind review", () => {
  const approvalRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-editor-review",
    task: "Fill form with approval / OCI GenAI Enterprise AI Project",
    status: "needs_approval"
  };
  const handoffDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(approvalRun, {}, "2026-05-28T09:00:00.000Z");
  const readyDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(completedRun, {}, "2026-05-28T09:00:00.000Z");

  assert.ok(handoffDraft);
  assert.ok(readyDraft);
  if (!handoffDraft || !readyDraft) {
    throw new Error("scheduler drafts should be created");
  }
  const selectedSource = selectBrowserScheduleEditorSource({
    selectedTaskId: handoffDraft.id,
    assistantTask: handoffDraft,
    tasks: [handoffDraft, readyDraft]
  });
  const fallbackSource = selectBrowserScheduleEditorSource({
    selectedTaskId: undefined,
    assistantTask: null,
    tasks: [handoffDraft, readyDraft]
  });

  assert.equal(selectedSource?.id, handoffDraft.id);
  assert.equal(createBrowserScheduleCardEditDraft(selectedSource)?.canEnable, false);
  assert.equal(fallbackSource?.id, readyDraft.id);
});

test("createBrowserSchedulerRegistryPreview summarizes scheduler draft states", () => {
  const preview = createBrowserSchedulerRegistryPreview(
    [
      recordedEntry,
      {
        ...recordedEntry,
        id: "mcp-run-history-blocked",
        status: "blocked",
        executionStatus: "blocked",
        run: {
          ...completedRun,
          id: "agent-run-blocked",
          status: "blocked"
        }
      }
    ],
    "2026-05-28T09:00:00.000Z"
  );

  assert.equal(preview.taskCount, 2);
  assert.equal(preview.readyCount, 1);
  assert.equal(preview.blockedCount, 1);
  assert.equal(preview.maxRunsPerTask, 15);
});

test("createBrowserScheduleSuggestionCard creates confirmable cards for ready drafts", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const card = createBrowserScheduleSuggestionCard(draft);

  assert.ok(card);
  assert.equal(card.sourceTaskId, draft.id);
  assert.equal(card.canConfirm, true);
  assert.equal(card.actionLabel, "Review and save");
  assert.equal(card.status, "ready");
  assert.equal(card.details.includes("runs: 1/15"), true);
  assert.equal(card.blockedReason, undefined);
});

test("createBrowserScheduleSuggestionCard keeps non-ready cards review-only", () => {
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );
  const card = createBrowserScheduleSuggestionCard(blockedDraft);

  assert.ok(card);
  assert.equal(card.canConfirm, false);
  assert.equal(card.actionLabel, "Review required");
  assert.match(card.blockedReason ?? "", /blocked policy/);
});

test("createBrowserSavedScheduleTaskDetail summarizes saved draft metadata", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const detail = createBrowserSavedScheduleTaskDetail(draft);

  assert.ok(detail);
  assert.equal(detail.title, draft.name);
  assert.equal(detail.prompt, draft.prompt);
  assert.equal(detail.latestRunSummary, completedRun.planSummary);
  assert.deepEqual(
    detail.metadata.map((item) => item.label),
    ["workspace", "cadence", "status", "enabled", "policy", "runs"]
  );
});

test("schedule card and saved detail support empty state", () => {
  assert.equal(createBrowserScheduleCardEditDraft(undefined), null);
  assert.equal(createBrowserScheduleSuggestionCard(undefined), null);
  assert.equal(createBrowserSavedScheduleTaskDetail(undefined), null);
});

test("createBrowserScheduleCardEditDraft exposes editable schedule fields", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const editDraft = createBrowserScheduleCardEditDraft(draft);

  assert.ok(editDraft);
  assert.equal(editDraft.sourceTaskId, draft.id);
  assert.equal(editDraft.name, draft.name);
  assert.equal(editDraft.prompt, draft.prompt);
  assert.equal(editDraft.enabled, true);
  assert.equal(editDraft.canEnable, true);
});

test("applyBrowserScheduleCardEdit updates text cadence and next run preview", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const editDraft = createBrowserScheduleCardEditDraft(draft);

  assert.ok(editDraft);
  const updated = applyBrowserScheduleCardEdit(
    draft,
    {
      ...editDraft,
      name: "  Morning Oracle digest  ",
      prompt: "  Check Oracle docs updates and summarize.  ",
      cadence: {
        type: "daily",
        timeOfDay: "09:30",
        timezone: "Asia/Tokyo"
      }
    },
    "2026-05-28T09:00:00.000Z"
  );

  assert.equal(updated.name, "Morning Oracle digest");
  assert.equal(updated.prompt, "Check Oracle docs updates and summarize.");
  assert.equal(updated.cadenceLabel, "毎日 09:30 / Asia/Tokyo");
  assert.equal(updated.nextRunAt, "2026-05-28T09:30:00.000Z");
  assert.equal(updated.status, "ready");
});

test("toggleBrowserSchedulerTaskEnabled disables and re-enables eligible tasks", () => {
  const draft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const disabled = toggleBrowserSchedulerTaskEnabled(draft, false, "2026-05-28T10:00:00.000Z");
  const enabled = toggleBrowserSchedulerTaskEnabled(disabled, true, "2026-05-28T10:00:00.000Z");

  assert.equal(disabled.enabled, false);
  assert.equal(disabled.status, "disabled");
  assert.equal(disabled.nextRunAt, undefined);
  assert.equal(enabled.enabled, true);
  assert.equal(enabled.status, "ready");
  assert.equal(enabled.nextRunAt, "2026-05-28T16:00:00.000Z");
});

test("applyBrowserScheduleCardEdit does not enable approval-gated or blocked tasks", () => {
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-edit",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-edit",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );
  const editDraft = createBrowserScheduleCardEditDraft(blockedDraft);

  assert.ok(editDraft);
  assert.equal(editDraft.canEnable, false);
  const updated = applyBrowserScheduleCardEdit(blockedDraft, { ...editDraft, enabled: true }, "2026-05-28T10:00:00.000Z");

  assert.equal(updated.enabled, false);
  assert.equal(updated.status, "blocked");
  assert.equal(updated.nextRunAt, undefined);
});

test("createBrowserScheduledTasksPagePreview summarizes list detail and preview actions", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const disabledDraft = toggleBrowserSchedulerTaskEnabled(readyDraft, false, "2026-05-28T10:00:00.000Z");
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-page",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-page",
        status: "blocked",
        planSummary: "blocked run を retry preview の対象として表示します。"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );

  const preview = createBrowserScheduledTasksPagePreview([disabledDraft, blockedDraft], blockedDraft.id);
  const retryAction = preview.selectedDetail?.actions.find((action) => action.id === "retry_preview");

  assert.equal(preview.taskCount, 2);
  assert.equal(preview.enabledCount, 0);
  assert.equal(preview.disabledCount, 1);
  assert.equal(preview.blockedCount, 1);
  assert.equal(preview.selectedTaskId, blockedDraft.id);
  assert.equal(preview.items[0]?.name, disabledDraft.name);
  assert.equal(preview.selectedDetail?.title, blockedDraft.name);
  assert.equal(preview.selectedDetail?.history[0]?.status, "blocked");
  assert.equal(retryAction?.enabled, true);
});

test("createBrowserScheduledTasksPagePreview supports empty state and selection fallback", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const emptyPreview = createBrowserScheduledTasksPagePreview([]);
  const fallbackPreview = createBrowserScheduledTasksPagePreview([readyDraft], "missing-task-id");

  assert.equal(emptyPreview.taskCount, 0);
  assert.deepEqual(emptyPreview.items, []);
  assert.equal(emptyPreview.selectedTaskId, undefined);
  assert.equal(emptyPreview.selectedDetail, null);
  assert.equal(fallbackPreview.selectedTaskId, readyDraft.id);
  assert.equal(fallbackPreview.selectedDetail?.actions[0]?.label, "Test preview");
});

test("createBrowserScheduledTaskManualRunConfirmation creates manual test confirmation for ready task", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "test_preview");

  assert.ok(confirmation);
  assert.equal(confirmation.sourceTaskId, readyDraft.id);
  assert.equal(confirmation.actionId, "test_preview");
  assert.equal(confirmation.canConfirm, true);
  assert.equal(confirmation.status, "ready_to_preview");
  assert.equal(confirmation.expectedRunStatus, "needs_approval");
  assert.equal(confirmation.timeoutSeconds, 600);
  assert.equal(confirmation.steps.map((step) => step.id).includes("manual-run-confirm-policy"), true);
});

test("createBrowserScheduledTaskBackgroundRunPreview maps ready tasks to hidden-window preview stages", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const preview = createBrowserScheduledTaskBackgroundRunPreview(readyDraft);

  assert.ok(preview);
  assert.equal(preview.title, "Background Run Preview");
  assert.equal(preview.timeoutSeconds, 600);
  assert.equal(preview.canOpenHiddenWindow, false);
  assert.equal(preview.canExecuteAgent, false);
  assert.equal(preview.canPersistResult, false);
  assert.deepEqual(
    preview.stages.map((stage) => stage.id),
    ["alarm_trigger", "hidden_window", "agent_execution", "result_saved", "timeout_guard"]
  );
  assert.equal(preview.stages.find((stage) => stage.id === "hidden_window")?.status, "needs_review");
  assert.equal(preview.actions.find((action) => action.id === "open_hidden_window")?.enabled, false);
  assert.match(preview.localOnlyNotice, /hidden window/);
});

test("createBrowserScheduledTaskBackgroundRunPreview blocks gated tasks before background execution", () => {
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-background",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-background",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );
  const preview = createBrowserScheduledTaskBackgroundRunPreview(blockedDraft);

  assert.ok(preview);
  assert.equal(preview.stages.find((stage) => stage.id === "agent_execution")?.status, "blocked");
  assert.equal(preview.stats.find((stat) => stat.label === "Blocked")?.value, "4");
  assert.match(preview.guardrails.join("\n"), /local device only/);
});

test("createBrowserScheduledTaskBackgroundRunPreview supports empty task", () => {
  assert.equal(createBrowserScheduledTaskBackgroundRunPreview(undefined), null);
});

test("createBrowserScheduledTaskManualRunConfirmation gates retry and cancel preview by policy", () => {
  const blockedDraft = createBrowserSchedulerTaskDraftFromRunHistory(
    {
      ...recordedEntry,
      id: "mcp-run-history-blocked-manual-run",
      status: "blocked",
      executionStatus: "blocked",
      run: {
        ...completedRun,
        id: "agent-run-blocked-manual-run",
        status: "blocked"
      }
    },
    {},
    "2026-05-28T09:00:00.000Z"
  );
  const retryConfirmation = createBrowserScheduledTaskManualRunConfirmation(blockedDraft, "retry_preview");
  const cancelConfirmation = createBrowserScheduledTaskManualRunConfirmation(blockedDraft, "cancel_preview");

  assert.ok(retryConfirmation);
  assert.equal(retryConfirmation.canConfirm, true);
  assert.equal(retryConfirmation.status, "ready_to_preview");
  assert.match(retryConfirmation.policyReason, /Retry preview/);
  assert.ok(cancelConfirmation);
  assert.equal(cancelConfirmation.canConfirm, false);
  assert.equal(cancelConfirmation.status, "not_applicable");
  assert.equal(cancelConfirmation.expectedRunStatus, "blocked");
});

test("createBrowserScheduledTaskManualRunConfirmation supports empty task", () => {
  assert.equal(createBrowserScheduledTaskManualRunConfirmation(undefined), null);
});

test("createBrowserScheduledTaskDryRunHistoryCandidate creates BrowserAgentRun compatible preview", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "test_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");

  assert.ok(candidate);
  assert.equal(candidate.sourceTaskId, readyDraft.id);
  assert.equal(candidate.canAppendToHistory, true);
  assert.equal(candidate.status, "needs_approval");
  assert.equal(candidate.run.workspaceName, readyDraft.workspaceName);
  assert.equal(candidate.run.status, "needs_approval");
  assert.equal(candidate.run.steps[0]?.status, "completed");
  assert.equal(candidate.run.steps.some((step) => step.status === "skipped"), true);
  assert.equal(candidate.run.events.length, candidate.run.steps.length);
});

test("createBrowserScheduledTaskDryRunHistoryCandidate keeps unavailable action blocked", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "cancel_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");

  assert.ok(candidate);
  assert.equal(candidate.canAppendToHistory, false);
  assert.equal(candidate.status, "blocked");
  assert.equal(candidate.historyLabel, "candidate blocked");
  assert.equal(candidate.run.steps.some((step) => step.status === "blocked"), true);
});

test("createBrowserScheduledTaskDryRunHistoryCandidate supports empty confirmation", () => {
  assert.equal(createBrowserScheduledTaskDryRunHistoryCandidate(null), null);
});

test("applyBrowserScheduledTaskDryRunHistoryCandidatePreview appends candidate to local preview only", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "test_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");
  const result = applyBrowserScheduledTaskDryRunHistoryCandidatePreview([readyDraft], candidate);

  assert.equal(result.applied, true);
  assert.equal(result.appendedRunId, candidate?.run.id);
  assert.equal(result.tasks[0]?.runHistory.length, 2);
  assert.equal(result.tasks[0]?.runHistory[0]?.id, candidate?.run.id);
  assert.equal(readyDraft.runHistory.length, 1);
});

test("applyBrowserScheduledTaskDryRunHistoryCandidatePreview rejects blocked candidate", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "cancel_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");
  const result = applyBrowserScheduledTaskDryRunHistoryCandidatePreview([readyDraft], candidate);

  assert.equal(result.applied, false);
  assert.match(result.reason, /blocked candidate/);
  assert.equal(result.tasks[0]?.runHistory.length, 1);
});

test("applyBrowserScheduledTaskDryRunHistoryCandidatePreview prevents duplicate local preview runs", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "test_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");
  const firstResult = applyBrowserScheduledTaskDryRunHistoryCandidatePreview([readyDraft], candidate);
  const secondResult = applyBrowserScheduledTaskDryRunHistoryCandidatePreview(firstResult.tasks, candidate);

  assert.equal(firstResult.applied, true);
  assert.equal(secondResult.applied, false);
  assert.match(secondResult.reason, /すでに/);
  assert.equal(secondResult.tasks[0]?.runHistory.length, 2);
});

test("applyBrowserScheduledTaskDryRunHistoryCandidatePreview supports empty candidate", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const result = applyBrowserScheduledTaskDryRunHistoryCandidatePreview([readyDraft], null);

  assert.equal(result.applied, false);
  assert.deepEqual(result.tasks, [readyDraft]);
});

test("createBrowserScheduledTaskHistoryStoreCommitPreview saves applied preview deltas only", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const confirmation = createBrowserScheduledTaskManualRunConfirmation(readyDraft, "test_preview");
  const candidate = createBrowserScheduledTaskDryRunHistoryCandidate(confirmation, "2026-05-28T11:00:00.000Z");
  const result = applyBrowserScheduledTaskDryRunHistoryCandidatePreview([readyDraft], candidate);
  const previewTask = result.tasks[0];
  const commitPreview = createBrowserScheduledTaskHistoryStoreCommitPreview({
    baseTasks: [readyDraft],
    historyPreviewActive: true,
    previewTask
  });

  assert.ok(commitPreview);
  assert.equal(commitPreview.status, "ready_to_save");
  assert.equal(commitPreview.canPersist, true);
  assert.equal(commitPreview.task?.id, readyDraft.id);
  assert.deepEqual(commitPreview.appendedRunIds, [candidate?.run.id]);
  assert.equal(commitPreview.metadata.find((item) => item.label === "appended runs")?.value, "1");
  assert.match(commitPreview.checklist.join("\n"), /hidden window/);
});

test("createBrowserScheduledTaskHistoryStoreCommitPreview rejects inactive or unchanged previews", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inactive = createBrowserScheduledTaskHistoryStoreCommitPreview({
    baseTasks: [readyDraft],
    historyPreviewActive: false,
    previewTask: readyDraft
  });
  const unchanged = createBrowserScheduledTaskHistoryStoreCommitPreview({
    baseTasks: [readyDraft],
    historyPreviewActive: true,
    previewTask: readyDraft
  });
  const missingBase = createBrowserScheduledTaskHistoryStoreCommitPreview({
    baseTasks: [],
    historyPreviewActive: true,
    previewTask: readyDraft
  });

  assert.equal(createBrowserScheduledTaskHistoryStoreCommitPreview({ baseTasks: [], historyPreviewActive: true, previewTask: undefined }), null);
  assert.equal(inactive?.canPersist, false);
  assert.equal(inactive?.status, "no_preview");
  assert.equal(unchanged?.canPersist, false);
  assert.equal(unchanged?.status, "no_preview");
  assert.equal(missingBase?.canPersist, false);
  assert.equal(missingBase?.status, "not_applicable");
});

test("createBrowserScheduledTaskRunOutputPreview expands latest run tools and findings", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const preview = createBrowserScheduledTaskRunOutputPreview(readyDraft);

  assert.ok(preview);
  assert.equal(preview.taskId, readyDraft.id);
  assert.equal(preview.runId, completedRun.id);
  assert.equal(preview.toolUsage[0]?.label, "navigate");
  assert.equal(preview.findings[0]?.level, "approval");
  assert.match(preview.outputText, /tools:/);
  assert.match(preview.outputText, /findings:/);
});

test("createBrowserScheduledTaskRunOutputPreview selects a specific run when available", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const nextRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-preview",
    status: "needs_approval",
    startedAt: "2026-05-28T13:00:00.000Z",
    completedAt: "2026-05-28T13:00:00.000Z",
    planSummary: "manual test preview の結果を local output detail に表示します。"
  };
  const updatedDraft = appendBrowserSchedulerRunHistory(readyDraft, nextRun);
  const latestPreview = createBrowserScheduledTaskRunOutputPreview(updatedDraft);
  const selectedPreview = createBrowserScheduledTaskRunOutputPreview(updatedDraft, completedRun.id);

  assert.equal(latestPreview?.runId, nextRun.id);
  assert.equal(selectedPreview?.runId, completedRun.id);
  assert.equal(selectedPreview?.metadata.find((item) => item.label === "history position")?.value, "2/2");
});

test("createBrowserScheduledTaskRunOutputPreview supports empty task and history", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");

  assert.equal(createBrowserScheduledTaskRunOutputPreview(undefined), null);
  assert.equal(createBrowserScheduledTaskRunOutputPreview({ ...readyDraft, runHistory: [] }), null);
});

test("createBrowserScheduledTaskNewTabResultPreview summarizes local scheduled task result", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const newTab = createBrowserScheduledTaskNewTabResultPreview(output);

  assert.ok(newTab);
  assert.equal(newTab.sourceOutputId, output?.id);
  assert.equal(newTab.resultLocation, "new_tab_preview");
  assert.equal(newTab.runHistoryScope, "local_device_only");
  assert.equal(newTab.cloudSyncScope, "schedule_only");
  assert.equal(newTab.metadata.find((item) => item.label === "sync")?.value, "run output stays local");
  assert.equal(newTab.actions.find((action) => action.id === "open_full_output")?.enabled, true);
  assert.equal(newTab.actions.find((action) => action.id === "capture_result")?.label, "Capture result");
});

test("createBrowserScheduledTaskNewTabResultPreview reflects capture and knowledge state", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const newTab = createBrowserScheduledTaskNewTabResultPreview(output, {
    captureSaved: true,
    knowledgeAdded: true
  });

  assert.ok(newTab);
  assert.equal(newTab.actions.find((action) => action.id === "capture_result")?.label, "Capture saved");
  assert.equal(newTab.actions.find((action) => action.id === "capture_result")?.enabled, false);
  assert.equal(newTab.actions.find((action) => action.id === "add_to_knowledge")?.label, "Knowledge added");
  assert.equal(newTab.actions.find((action) => action.id === "add_to_knowledge")?.enabled, false);
});

test("createBrowserScheduledTaskNewTabResultFilterPreview filters searchable card fields", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const newTab = createBrowserScheduledTaskNewTabResultPreview(output);
  const summaryMatch = createBrowserScheduledTaskNewTabResultFilterPreview(newTab, "run output");
  const noMatch = createBrowserScheduledTaskNewTabResultFilterPreview(newTab, "unmatched phrase");
  const blank = createBrowserScheduledTaskNewTabResultFilterPreview(newTab, "   ");

  assert.ok(summaryMatch);
  assert.equal(summaryMatch.visible, true);
  assert.ok(summaryMatch.matchCount > 0);
  assert.ok(summaryMatch.matchedFields.some((field) => field.label === "summary" || field.label.startsWith("highlight")));
  assert.equal(noMatch?.visible, false);
  assert.equal(noMatch?.emptyStateMessage, "検索条件に一致する New Tab result はありません。");
  assert.equal(blank?.visible, true);
  assert.ok((blank?.matchCount ?? 0) > (blank?.matchedFields.length ?? 0));
});

test("createBrowserScheduledTaskNewTabTracePreview exposes local trace nodes", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const newTab = createBrowserScheduledTaskNewTabResultPreview(output);
  const initialTrace = createBrowserScheduledTaskNewTabTracePreview(newTab);
  const completedTrace = createBrowserScheduledTaskNewTabTracePreview(newTab, {
    captureSaved: true,
    knowledgeAdded: true
  });

  assert.ok(initialTrace);
  assert.equal(initialTrace.nodes.find((node) => node.id === "new_tab_result")?.status, "current");
  assert.equal(initialTrace.nodes.find((node) => node.id === "full_output")?.actionId, "open_full_output");
  assert.equal(initialTrace.nodes.find((node) => node.id === "capture")?.status, "available");
  assert.equal(initialTrace.nodes.find((node) => node.id === "knowledge")?.status, "locked");
  assert.equal(completedTrace?.nodes.find((node) => node.id === "capture")?.status, "completed");
  assert.equal(completedTrace?.nodes.find((node) => node.id === "knowledge")?.status, "completed");
  assert.match(completedTrace?.localOnlyNotice ?? "", /local preview/);
});

test("createBrowserScheduledTaskNewTabResultStackPreview summarizes recent local results", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const nextRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-preview-stack",
    status: "needs_approval",
    startedAt: "2026-05-28T13:00:00.000Z",
    completedAt: "2026-05-28T13:00:00.000Z",
    planSummary: "manual test preview の結果を New Tab recent results に表示します。"
  };
  const updatedDraft = appendBrowserSchedulerRunHistory(readyDraft, nextRun);
  const stack = createBrowserScheduledTaskNewTabResultStackPreview(updatedDraft, completedRun.id);

  assert.ok(stack);
  assert.equal(stack.resultCount, 2);
  assert.equal(stack.selectedRunId, completedRun.id);
  assert.equal(stack.items[0]?.title, "Latest result");
  assert.equal(stack.items[0]?.runId, nextRun.id);
  assert.equal(stack.items[1]?.selected, true);
  assert.equal(stack.items[1]?.metadata.find((item) => item.label === "position")?.value, "2/2");
  assert.match(stack.localOnlyNotice, /cloud sync/);
});

test("createBrowserScheduledTaskNewTabInboxPreview aggregates recent results across tasks", () => {
  const firstDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const secondDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-inbox-task",
      task: "Daily readiness digest / OCI GenAI Enterprise AI Project",
      startedAt: "2026-05-28T10:00:00.000Z",
      completedAt: "2026-05-28T10:00:00.000Z",
      planSummary: "older readiness digest result"
    },
    {},
    "2026-05-28T10:00:00.000Z"
  );
  const latestRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-inbox-latest",
    status: "needs_approval",
    startedAt: "2026-05-28T14:00:00.000Z",
    completedAt: "2026-05-28T14:00:00.000Z",
    planSummary: "latest cross-task New Tab result"
  };

  assert.ok(secondDraft);
  if (!secondDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const updatedFirstDraft = appendBrowserSchedulerRunHistory(firstDraft, latestRun);
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [secondDraft, updatedFirstDraft],
    selectedTaskId: updatedFirstDraft.id,
    selectedRunId: latestRun.id,
    maxVisibleResults: 5
  });

  assert.equal(inbox.taskCount, 2);
  assert.equal(inbox.resultCount, 3);
  assert.equal(inbox.statusCounts.completed, 2);
  assert.equal(inbox.statusCounts.needsApproval, 1);
  assert.equal(inbox.items[0]?.runId, latestRun.id);
  assert.equal(inbox.items[0]?.selected, true);
  assert.equal(inbox.items[0]?.title, "Latest scheduled result");
  assert.match(inbox.localOnlyNotice, /cloud sync/);
});

test("createBrowserScheduledTaskNewTabInboxPreview supports empty tasks and clamps result count", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const empty = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [] });
  const clamped = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [readyDraft],
    maxVisibleResults: 0
  });

  assert.equal(empty.taskCount, 0);
  assert.equal(empty.resultCount, 0);
  assert.deepEqual(empty.items, []);
  assert.equal(clamped.maxVisibleResults, 1);
  assert.equal(clamped.items.length, 1);
});

test("createBrowserScheduledTaskNewTabInboxFilterPreview filters inbox results by task, status, and metadata", () => {
  const firstDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const secondDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-inbox-filter",
      task: "Daily extract_text inbox review",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "extract_text workflow を New Tab inbox で review します。"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );

  assert.ok(secondDraft);
  if (!secondDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [firstDraft, secondDraft],
    selectedTaskId: secondDraft.id,
    selectedRunId: "agent-run-schedule-inbox-filter"
  });
  const filtered = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "extract_text");
  const statusFiltered = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "needs_approval");
  const workspaceFiltered = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, secondDraft.workspaceName);

  assert.equal(filtered.visibleCount, 1);
  assert.equal(filtered.totalCount, 2);
  assert.equal(filtered.items[0]?.runId, "agent-run-schedule-inbox-filter");
  assert.ok(filtered.matchedFields.some((field) => field.itemId === filtered.items[0]?.id && field.label === "task"));
  assert.equal(statusFiltered.items[0]?.status, "needs_approval");
  assert.ok(statusFiltered.matchedFields.some((field) => field.label === "status"));
  assert.equal(workspaceFiltered.visibleCount, 2);
  assert.ok(workspaceFiltered.matchedFields.some((field) => field.label.startsWith("metadata: workspace")));
});

test("createBrowserScheduledTaskNewTabInboxFilterPreview keeps blank query and empty state local", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const blank = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "   ");
  const noMatch = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing phrase");
  const empty = createBrowserScheduledTaskNewTabInboxFilterPreview(createBrowserScheduledTaskNewTabInboxPreview({ tasks: [] }), "extract_text");

  assert.equal(blank.visibleCount, 1);
  assert.equal(blank.totalCount, 1);
  assert.equal(blank.items[0]?.runId, completedRun.id);
  assert.equal(noMatch.visibleCount, 0);
  assert.equal(noMatch.emptyStateMessage, "検索条件に一致する New Tab inbox result はありません。");
  assert.deepEqual(empty.items, []);
  assert.equal(empty.emptyStateMessage, "検索条件に一致する New Tab inbox result はありません。");
});

test("createBrowserScheduledTaskNewTabInboxFilterPreview combines query and status segment", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-inbox-review",
      task: "extract_text 定期確認",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "extract_text review result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );
  const blockedRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-inbox-blocked",
    task: "extract_text blocked audit",
    status: "blocked",
    startedAt: "2026-05-28T16:00:00.000Z",
    completedAt: "2026-05-28T16:00:00.000Z",
    planSummary: "extract_text blocked result"
  };

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [appendBrowserSchedulerRunHistory(readyDraft, blockedRun), reviewDraft],
    maxVisibleResults: 5
  });
  const blocked = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "extract_text", "blocked");
  const review = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "extract_text", "needs_approval");
  const emptyStatus = createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "navigate", "needs_approval");

  assert.equal(blocked.visibleCount, 1);
  assert.equal(blocked.items[0]?.runId, blockedRun.id);
  assert.deepEqual(
    blocked.statusOptions.map((option) => [option.id, option.count, option.selected]),
    [
      ["all", 2, false],
      ["completed", 0, false],
      ["needs_approval", 1, false],
      ["blocked", 1, true]
    ]
  );
  assert.equal(review.items[0]?.status, "needs_approval");
  assert.equal(emptyStatus.visibleCount, 0);
  assert.equal(emptyStatus.emptyStateMessage, "選択した status に一致する New Tab inbox result はありません。");
});

test("createBrowserScheduledTaskNewTabInboxTriagePreview prioritizes review and status-specific results", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-inbox-triage-review",
      task: "triage review result",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "review result for inbox triage"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );
  const blockedRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-inbox-triage-blocked",
    task: "triage blocked result",
    status: "blocked",
    startedAt: "2026-05-28T16:00:00.000Z",
    completedAt: "2026-05-28T16:00:00.000Z",
    planSummary: "blocked result for inbox triage"
  };

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [appendBrowserSchedulerRunHistory(readyDraft, blockedRun), reviewDraft],
    maxVisibleResults: 5
  });
  const allTriage = createBrowserScheduledTaskNewTabInboxTriagePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""));
  const blockedTriage = createBrowserScheduledTaskNewTabInboxTriagePreview(
    createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "", "blocked")
  );

  assert.equal(allTriage.primaryItem?.status, "needs_approval");
  assert.equal(allTriage.primaryAction.label, "Open review result");
  assert.equal(allTriage.primaryAction.enabled, true);
  assert.equal(allTriage.metrics.find((metric) => metric.label === "review")?.value, "1");
  assert.equal(blockedTriage.primaryItem?.runId, blockedRun.id);
  assert.equal(blockedTriage.primaryAction.label, "Inspect blocked result");
  assert.match(blockedTriage.guardrail, /cloud sync/);
});

test("createBrowserScheduledTaskNewTabInboxTriagePreview disables action for empty filtered results", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const triage = createBrowserScheduledTaskNewTabInboxTriagePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));

  assert.equal(triage.visibleCount, 0);
  assert.equal(triage.primaryItem, undefined);
  assert.equal(triage.primaryAction.enabled, false);
  assert.equal(triage.primaryAction.label, "No result to open");
  assert.match(triage.summary, /一致する New Tab inbox result はありません/);
});

test("createBrowserScheduledTaskNewTabInboxActionQueuePreview orders visible actions by review priority", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-action-queue-review",
      task: "action queue review",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "review action queue result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );
  const blockedRun: BrowserAgentRun = {
    ...completedRun,
    id: "agent-run-schedule-action-queue-blocked",
    task: "action queue blocked",
    status: "blocked",
    startedAt: "2026-05-28T16:00:00.000Z",
    completedAt: "2026-05-28T16:00:00.000Z",
    planSummary: "blocked action queue result"
  };

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [appendBrowserSchedulerRunHistory(readyDraft, blockedRun), reviewDraft],
    selectedTaskId: reviewDraft.id,
    selectedRunId: "agent-run-schedule-action-queue-review",
    maxVisibleResults: 5
  });
  const queue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""), 3);

  assert.equal(queue.actionCount, 3);
  assert.deepEqual(
    queue.actions.map((action) => [action.priority, action.label, action.selected]),
    [
      ["review", "Open review", true],
      ["blocked", "Inspect blocked", false],
      ["done", "Open completed", false]
    ]
  );
  assert.match(queue.localOnlyNotice, /renderer state/);
});

test("createBrowserScheduledTaskNewTabInboxActionQueuePreview clamps actions and supports empty state", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const clamped = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""), 0);
  const empty = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));

  assert.equal(clamped.maxActions, 1);
  assert.equal(clamped.actions.length, 1);
  assert.equal(empty.actionCount, 0);
  assert.deepEqual(empty.actions, []);
  assert.equal(empty.emptyStateMessage, "表示中の inbox result から実行できる local action はありません。");
});

test("createBrowserScheduledTaskNewTabInboxActionHandoffPreview creates a local prompt for selected action", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-action-handoff-review",
      task: "action handoff review",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "review action handoff result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [readyDraft, reviewDraft],
    selectedTaskId: reviewDraft.id,
    selectedRunId: "agent-run-schedule-action-handoff-review"
  });
  const queue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(queue);

  assert.equal(handoff.enabled, true);
  assert.equal(handoff.sourceActionQueueId, queue.id);
  assert.equal(handoff.primaryAction.label, "Copy handoff packet");
  assert.equal(handoff.primaryAction.enabled, true);
  assert.match(handoff.prompt, /- task: action handoff review/);
  assert.match(handoff.prompt, /- run id: agent-run-schedule-action-handoff-review/);
  assert.match(handoff.prompt, /- status: needs_approval/);
  assert.match(handoff.prompt, /browser automation、scheduler store、cloud sync、external MCP、OCI GenAI call は実行しない/);
  assert.match(handoff.handoffPacket, /# Scheduled Task Result Handoff Packet/);
  assert.match(handoff.handoffPacket, /BrowserOS source、asset、UI implementation は再利用しない/);
  assert.equal(handoff.sourceAction?.taskId, reviewDraft.id);
  assert.equal(handoff.sourceAction?.runId, "agent-run-schedule-action-handoff-review");
  assert.equal(handoff.metadata.find((item) => item.label === "source")?.value, "review");
  assert.deepEqual(
    handoff.reviewChecklist.map((item) => [item.id, item.status]),
    [
      ["source_action", "passed"],
      ["local_scope", "passed"],
      ["execution_guard", "passed"],
      ["clean_room", "passed"]
    ]
  );
  assert.ok(handoff.blockedOperations.includes("BrowserOS source / asset / UI implementation reuse"));
  assert.match(handoff.localOnlyNotice, /clipboard/);
});

test("createBrowserScheduledTaskNewTabInboxActionHandoffPreview disables prompt when action queue is empty", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const emptyQueue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(emptyQueue);

  assert.equal(handoff.enabled, false);
  assert.equal(handoff.prompt, "");
  assert.equal(handoff.handoffPacket, "");
  assert.equal(handoff.primaryAction.label, "No packet");
  assert.equal(handoff.primaryAction.enabled, false);
  assert.equal(handoff.metadata.find((item) => item.label === "source")?.value, "none");
  assert.match(handoff.promptPreview, /handoff prompt は作成されません/);
  assert.match(handoff.handoffPacketPreview, /handoff packet は作成されません/);
  assert.equal(handoff.reviewChecklist.find((item) => item.id === "source_action")?.status, "blocked");
});

test("createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview creates copy-only assistant review draft", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-action-review-draft",
      task: "action review draft",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "review draft handoff result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [readyDraft, reviewDraft],
    selectedTaskId: reviewDraft.id,
    selectedRunId: "agent-run-schedule-action-review-draft"
  });
  const queue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(queue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);

  assert.equal(review.enabled, true);
  assert.equal(review.sourceHandoffId, handoff.id);
  assert.equal(review.primaryAction.label, "Copy review draft");
  assert.match(review.draft, /# Scheduled Task Result Handoff Packet/);
  assert.match(review.draft, /Clean-room confirmation/);
  assert.match(review.draft, /assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call を開始しない/);
  assert.deepEqual(
    review.outputSections.map((section) => section.id),
    ["finding", "risk", "next_action", "clean_room"]
  );
  assert.equal(review.metadata.find((item) => item.label === "packet")?.value, "ready");
  assert.equal(review.metadata.find((item) => item.label === "source")?.value, "review");
  assert.equal(review.metadata.find((item) => item.label === "checks")?.value, "4/4");
});

test("createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview disables empty handoff draft", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const emptyQueue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(emptyQueue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);

  assert.equal(review.enabled, false);
  assert.equal(review.draft, "");
  assert.equal(review.primaryAction.label, "No draft");
  assert.equal(review.primaryAction.enabled, false);
  assert.equal(review.metadata.find((item) => item.label === "packet")?.value, "empty");
  assert.equal(review.metadata.find((item) => item.label === "source")?.value, "none");
  assert.equal(review.metadata.find((item) => item.label === "checks")?.value, "0/4");
  assert.match(review.draftPreview, /review draft は作成されません/);
});

test("createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview recommends human review for approval results", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-action-review-decision",
      task: "action review decision",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "review decision handoff result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [readyDraft, reviewDraft],
    selectedTaskId: reviewDraft.id,
    selectedRunId: "agent-run-schedule-action-review-decision"
  });
  const queue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(queue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);
  const decision = createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(review);

  assert.equal(decision.enabled, true);
  assert.equal(decision.sourceReviewDraftId, review.id);
  assert.equal(decision.recommendedDecision.id, "review_required");
  assert.equal(decision.recommendedDecision.tone, "warning");
  assert.equal(decision.primaryAction.label, "Copy decision note");
  assert.match(decision.decisionNote, /# Scheduled Task Inbox Review Decision/);
  assert.match(decision.decisionNote, /assistant auto-run、browser automation、scheduler store write、cloud sync、external MCP、OCI GenAI call は開始しません/);
  assert.equal(decision.metadata.find((item) => item.label === "source")?.value, "review");
  assert.deepEqual(
    decision.nextActions.map((action) => action.id),
    ["read_review", "inspect_source", "copy_note"]
  );
});

test("createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview disables empty decision note", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const emptyQueue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(emptyQueue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);
  const decision = createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(review);

  assert.equal(decision.enabled, false);
  assert.equal(decision.decisionNote, "");
  assert.equal(decision.recommendedDecision.id, "unavailable");
  assert.equal(decision.primaryAction.label, "No note");
  assert.equal(decision.primaryAction.enabled, false);
  assert.equal(decision.metadata.find((item) => item.label === "source")?.value, "none");
  assert.match(decision.decisionNotePreview, /decision note は作成されません/);
});

test("createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview opens source result locally", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const reviewDraft = createBrowserSchedulerTaskDraftFromAssistantRunHistory(
    {
      ...completedRun,
      id: "agent-run-schedule-action-decision-route",
      task: "action decision route",
      status: "needs_approval",
      startedAt: "2026-05-28T15:00:00.000Z",
      completedAt: "2026-05-28T15:00:00.000Z",
      planSummary: "decision route handoff result"
    },
    {},
    "2026-05-28T15:00:00.000Z"
  );

  assert.ok(reviewDraft);
  if (!reviewDraft) {
    throw new Error("assistant schedule draft should be created");
  }
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({
    tasks: [readyDraft, reviewDraft],
    selectedTaskId: reviewDraft.id,
    selectedRunId: "agent-run-schedule-action-decision-route"
  });
  const queue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, ""));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(queue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);
  const decision = createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(review);
  const route = createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview(handoff, decision);

  assert.equal(route.enabled, true);
  assert.equal(route.sourceHandoffId, handoff.id);
  assert.equal(route.sourceDecisionId, decision.id);
  assert.equal(route.primaryAction.label, "Open source result");
  assert.equal(route.primaryAction.enabled, true);
  assert.equal(route.primaryAction.taskId, reviewDraft.id);
  assert.equal(route.primaryAction.runId, "agent-run-schedule-action-decision-route");
  assert.equal(route.metadata.find((item) => item.label === "decision")?.value, "review_required");
  assert.equal(route.metadata.find((item) => item.label === "source")?.value, "review");
  assert.equal(route.metadata.find((item) => item.label === "routes")?.value, "3");
  assert.deepEqual(
    route.routeCards.map((card) => card.id),
    ["open_source_result", "read_review_draft", "copy_decision_note"]
  );
  assert.match(route.localOnlyNotice, /renderer state/);
});

test("createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview disables empty route", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const inbox = createBrowserScheduledTaskNewTabInboxPreview({ tasks: [readyDraft] });
  const emptyQueue = createBrowserScheduledTaskNewTabInboxActionQueuePreview(createBrowserScheduledTaskNewTabInboxFilterPreview(inbox, "missing"));
  const handoff = createBrowserScheduledTaskNewTabInboxActionHandoffPreview(emptyQueue);
  const review = createBrowserScheduledTaskNewTabInboxActionReviewDraftPreview(handoff);
  const decision = createBrowserScheduledTaskNewTabInboxActionReviewDecisionPreview(review);
  const route = createBrowserScheduledTaskNewTabInboxActionDecisionRoutePreview(handoff, decision);

  assert.equal(route.enabled, false);
  assert.equal(route.primaryAction.label, "No source result");
  assert.equal(route.primaryAction.enabled, false);
  assert.equal(route.metadata.find((item) => item.label === "source")?.value, "none");
  assert.equal(route.metadata.find((item) => item.label === "routes")?.value, "0");
});

test("createBrowserScheduledTaskRunCapturePreview creates markdown capture candidate", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const capture = createBrowserScheduledTaskRunCapturePreview(output);

  assert.ok(capture);
  assert.equal(capture.sourceOutputId, output?.id);
  assert.equal(capture.canSaveToCaptureStore, false);
  assert.match(capture.markdown, /## Tools Used/);
  assert.match(capture.markdown, /## Findings/);
  assert.match(capture.markdown, /```text/);
  assert.equal(capture.metadata.find((item) => item.label === "storage")?.value, "preview only");
});

test("createBrowserScheduledTaskRunCapturePreview supports empty output", () => {
  assert.equal(createBrowserScheduledTaskRunCapturePreview(null), null);
});

test("createBrowserScheduledTaskRunCaptureSaveConfirmation creates preview-only save review", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const capture = createBrowserScheduledTaskRunCapturePreview(output);
  const confirmation = createBrowserScheduledTaskRunCaptureSaveConfirmation(capture, "2026-05-28T14:00:00.000Z");

  assert.ok(confirmation);
  assert.equal(confirmation.sourceCapturePreviewId, capture?.id);
  assert.equal(confirmation.canPersistToCaptureStore, false);
  assert.equal(confirmation.proposedCapture.savedAt, "2026-05-28T14:00:00.000Z");
  assert.equal(confirmation.proposedCapture.markdownCharacters, capture?.markdown.length);
  assert.match(confirmation.policyReason, /local capture store/);
  assert.equal(confirmation.metadata.find((item) => item.label === "storage")?.value, "confirmation only");
});

test("createBrowserScheduledTaskRunCaptureSaveConfirmation supports empty capture preview", () => {
  assert.equal(createBrowserScheduledTaskRunCaptureSaveConfirmation(null), null);
});

test("createBrowserScheduledTaskRunCaptureStoreDraft maps confirmed markdown to local selection payload", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const capture = createBrowserScheduledTaskRunCapturePreview(output);
  const confirmation = createBrowserScheduledTaskRunCaptureSaveConfirmation(capture, "2026-05-28T14:00:00.000Z");
  const storeDraft = createBrowserScheduledTaskRunCaptureStoreDraft(confirmation, capture, {
    workspaceId: "ws-oracle",
    url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    sourceType: "oracle_docs"
  });

  assert.ok(storeDraft);
  assert.equal(storeDraft.canPersistToCaptureStore, true);
  assert.equal(storeDraft.localCaptureKind, "selection");
  assert.equal(storeDraft.payload.workspaceId, "ws-oracle");
  assert.equal(storeDraft.payload.sourceType, "oracle_docs");
  assert.equal(storeDraft.payload.selectedText, capture?.markdown);
  assert.match(storeDraft.payload.title, /^Scheduled task capture:/);
  assert.equal(storeDraft.metadata.find((item) => item.label === "kind")?.value, "selection");
});

test("createBrowserScheduledTaskRunCaptureStoreDraft rejects mismatched confirmation", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const capture = createBrowserScheduledTaskRunCapturePreview(output);
  const confirmation = createBrowserScheduledTaskRunCaptureSaveConfirmation(capture, "2026-05-28T14:00:00.000Z");
  const mismatchedCapture = capture ? { ...capture, id: "other-capture-preview" } : null;

  assert.equal(
    createBrowserScheduledTaskRunCaptureStoreDraft(confirmation, mismatchedCapture, {
      workspaceId: "ws-oracle",
      url: "https://docs.oracle.com/",
      sourceType: "oracle_docs"
    }),
    null
  );
});

test("createBrowserScheduledTaskRunCaptureKnowledgeDraft creates knowledge handoff for persisted capture", () => {
  const readyDraft = createBrowserSchedulerTaskDraftFromRunHistory(recordedEntry, {}, "2026-05-28T09:00:00.000Z");
  const output = createBrowserScheduledTaskRunOutputPreview(readyDraft);
  const capture = createBrowserScheduledTaskRunCapturePreview(output);
  const confirmation = createBrowserScheduledTaskRunCaptureSaveConfirmation(capture, "2026-05-28T14:00:00.000Z");
  const storeDraft = createBrowserScheduledTaskRunCaptureStoreDraft(confirmation, capture, {
    workspaceId: "ws-oracle",
    url: "https://docs.oracle.com/",
    sourceType: "oracle_docs"
  });
  const knowledgeDraft = createBrowserScheduledTaskRunCaptureKnowledgeDraft(storeDraft, "capture-1");

  assert.ok(knowledgeDraft);
  assert.equal(knowledgeDraft.sourceStoreDraftId, storeDraft?.id);
  assert.equal(knowledgeDraft.captureId, "capture-1");
  assert.equal(knowledgeDraft.canAddToKnowledge, true);
  assert.equal(knowledgeDraft.metadata.find((item) => item.label === "status")?.value, "ready");
});

test("createBrowserScheduledTaskRunCaptureKnowledgeDraft requires persisted capture", () => {
  assert.equal(createBrowserScheduledTaskRunCaptureKnowledgeDraft(null, "capture-1"), null);
  assert.equal(createBrowserScheduledTaskRunCaptureKnowledgeDraft({} as never, null), null);
});
