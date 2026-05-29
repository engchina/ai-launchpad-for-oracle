import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyBrowserAssistantActionRunHistoryCandidatePreview,
  createBrowserAssistantActionPlanPreview,
  createBrowserAssistantActionRunHistoryCandidate,
  createBrowserAssistantActionRunHistoryPreview
} from "./browserAssistantActionPlan";

test("createBrowserAssistantActionPlanPreview creates a guarded browser action loop", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    providerLabel: "OCI GenAI Enterprise AI Project",
    pageContextReady: true,
    approvalGranted: false
  });

  assert.equal(preview.title, "Assistant Action Plan");
  assert.equal(preview.promptTitle, "Fill form with approval");
  assert.deepEqual(
    preview.stages.map((stage) => stage.id),
    ["observe", "plan", "approve", "act", "record"]
  );
  assert.equal(preview.stages.find((stage) => stage.id === "act")?.status, "blocked");
  assert.equal(preview.approval.status, "needs_review");
  assert.equal(preview.approval.granted, false);
  assert.equal(preview.run.status, "blocked");
  assert.equal(preview.run.outputLabel, "dry-run stopped");
  assert.ok(preview.tools.some((tool) => tool.label === "Submit form" && tool.decision === "blocked"));
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
});

test("createBrowserAssistantActionPlanPreview promotes approved browser writes to dry-run candidates", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    approvalGranted: true
  });

  assert.equal(preview.approval.status, "ready");
  assert.equal(preview.approval.granted, true);
  assert.equal(preview.stages.find((stage) => stage.id === "approve")?.status, "ready");
  assert.equal(preview.stages.find((stage) => stage.id === "act")?.status, "ready");
  assert.equal(preview.stages.find((stage) => stage.id === "record")?.status, "ready");
  assert.equal(preview.run.status, "needs_review");
  assert.match(preview.run.policyReason, /別 confirmation/);
  assert.ok(preview.tools.some((tool) => tool.label === "Type fields" && tool.decision === "ready"));
  assert.ok(preview.tools.some((tool) => tool.label === "Submit form" && tool.decision === "needs_review"));
  assert.equal(preview.tools.some((tool) => tool.decision === "blocked"), false);
});

test("createBrowserAssistantActionPlanPreview opens safe read-only prompts", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "summarize_page",
    approvalGranted: false
  });

  assert.deepEqual(
    preview.metrics.map((metric) => metric.value),
    ["5", "5", "0", "0"]
  );
  assert.equal(preview.approval.actionEnabled, false);
  assert.equal(preview.stages.find((stage) => stage.id === "approve")?.status, "ready");
  assert.equal(preview.run.status, "ready");
  assert.deepEqual(
    preview.run.metrics.map((metric) => metric.value),
    ["7", "7", "0", "0"]
  );
  assert.ok(preview.tools.every((tool) => tool.decision === "ready"));
});

test("createBrowserAssistantActionPlanPreview keeps file and context work behind review", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "save_report",
    pageContextReady: false,
    approvalGranted: false
  });

  assert.equal(preview.stages.find((stage) => stage.id === "observe")?.status, "needs_review");
  assert.equal(preview.stages.find((stage) => stage.id === "act")?.status, "needs_review");
  assert.equal(preview.run.status, "blocked");
  assert.ok(preview.tools.some((tool) => tool.category === "file" && tool.decision === "needs_review"));
  assert.ok(preview.tools.some((tool) => tool.decision === "blocked"));
});

test("createBrowserAssistantActionPlanPreview keeps scheduler behind confirmation after approval", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "save_report",
    approvalGranted: true
  });

  assert.equal(preview.approval.status, "ready");
  assert.equal(preview.stages.find((stage) => stage.id === "act")?.status, "ready");
  assert.ok(preview.tools.some((tool) => tool.label === "Prepare report file" && tool.decision === "ready"));
  assert.ok(preview.tools.some((tool) => tool.label === "Register schedule" && tool.decision === "needs_review"));
});

test("createBrowserAssistantActionPlanPreview redacts provider secrets", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    providerLabel: "OCI api_key=abc token=def cookie=session"
  });

  assert.doesNotMatch(preview.providerLabel, /abc|def|session/);
  assert.match(preview.providerLabel, /REDACTED/);
});

test("createBrowserAssistantActionRunHistoryCandidate blocks unapproved browser writes", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    approvalGranted: false
  });
  const candidate = createBrowserAssistantActionRunHistoryCandidate(
    preview,
    { workspaceName: "Onboarding Preview" },
    "2026-05-29T10:11:12.000Z"
  );

  assert.equal(candidate.title, "Run History Candidate");
  assert.equal(candidate.status, "blocked");
  assert.equal(candidate.canRecord, false);
  assert.equal(candidate.run.id, "assistant-run-20260529101112-1y5fyx");
  assert.equal(candidate.run.workspaceName, "Onboarding Preview");
  assert.ok(candidate.run.steps.some((step) => step.title === "Type fields" && step.status === "blocked"));
  assert.ok(candidate.run.events.some((event) => event.level === "blocked"));
  assert.match(candidate.localOnlyNotice, /DOM mutation/);
});

test("createBrowserAssistantActionRunHistoryCandidate keeps final submit as approval event after preview approval", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    approvalGranted: true
  });
  const candidate = createBrowserAssistantActionRunHistoryCandidate(preview, {}, "2026-05-29T10:11:12.000Z");
  const typeStep = candidate.run.steps.find((step) => step.title === "Type fields");
  const submitStep = candidate.run.steps.find((step) => step.title === "Submit form");

  assert.equal(candidate.status, "needs_approval");
  assert.equal(candidate.canRecord, true);
  assert.equal(typeStep?.status, "completed");
  assert.equal(submitStep?.status, "skipped");
  assert.equal(submitStep?.actionKind, "destructive_browser_action");
  assert.ok(candidate.run.events.some((event) => event.stepId === submitStep?.stepId && event.level === "approval"));
});

test("createBrowserAssistantActionRunHistoryCandidate records read-only prompt as completed candidate", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "summarize_page"
  });
  const candidate = createBrowserAssistantActionRunHistoryCandidate(preview, {}, "2026-05-29T10:11:12.000Z");

  assert.equal(candidate.status, "completed");
  assert.equal(candidate.canRecord, true);
  assert.ok(candidate.run.steps.every((step) => step.status === "completed"));
  assert.ok(candidate.run.events.every((event) => event.level === "info"));
  assert.deepEqual(
    candidate.metrics.map((metric) => metric.value),
    ["7", "7", "0", "enabled"]
  );
});

test("applyBrowserAssistantActionRunHistoryCandidatePreview appends recordable candidates locally", () => {
  const preview = createBrowserAssistantActionPlanPreview({
    templateId: "summarize_page"
  });
  const candidate = createBrowserAssistantActionRunHistoryCandidate(preview, {}, "2026-05-29T10:11:12.000Z");
  const result = applyBrowserAssistantActionRunHistoryCandidatePreview([], candidate);

  assert.equal(result.applied, true);
  assert.equal(result.appendedRunId, candidate.run.id);
  assert.equal(result.history.length, 1);
  assert.equal(result.history[0]?.id, candidate.run.id);
  assert.match(result.reason, /local preview/);
});

test("applyBrowserAssistantActionRunHistoryCandidatePreview rejects blocked and duplicate candidates", () => {
  const blockedPreview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    approvalGranted: false
  });
  const blockedCandidate = createBrowserAssistantActionRunHistoryCandidate(blockedPreview, {}, "2026-05-29T10:11:12.000Z");
  const blockedResult = applyBrowserAssistantActionRunHistoryCandidatePreview([], blockedCandidate);
  const safePreview = createBrowserAssistantActionPlanPreview({
    templateId: "summarize_page"
  });
  const safeCandidate = createBrowserAssistantActionRunHistoryCandidate(safePreview, {}, "2026-05-29T10:11:12.000Z");
  const firstResult = applyBrowserAssistantActionRunHistoryCandidatePreview([], safeCandidate);
  const duplicateResult = applyBrowserAssistantActionRunHistoryCandidatePreview(firstResult.history, safeCandidate);

  assert.equal(blockedResult.applied, false);
  assert.match(blockedResult.reason, /blocked candidate/);
  assert.equal(blockedResult.history.length, 0);
  assert.equal(duplicateResult.applied, false);
  assert.match(duplicateResult.reason, /すでに/);
  assert.equal(duplicateResult.history.length, 1);
});

test("createBrowserAssistantActionRunHistoryPreview summarizes local renderer history", () => {
  const safePreview = createBrowserAssistantActionPlanPreview({
    templateId: "summarize_page"
  });
  const approvalPreview = createBrowserAssistantActionPlanPreview({
    templateId: "fill_form_guarded",
    approvalGranted: true
  });
  const safeCandidate = createBrowserAssistantActionRunHistoryCandidate(safePreview, {}, "2026-05-29T10:11:12.000Z");
  const approvalCandidate = createBrowserAssistantActionRunHistoryCandidate(approvalPreview, {}, "2026-05-29T10:12:12.000Z");
  const preview = createBrowserAssistantActionRunHistoryPreview([approvalCandidate.run, safeCandidate.run], "added");

  assert.equal(preview.active, true);
  assert.equal(preview.statusLabel, "needs_approval");
  assert.deepEqual(
    preview.metrics.map((metric) => metric.value),
    ["2", "1", "1", "0"]
  );
  assert.match(preview.localOnlyNotice, /renderer state/);
});
