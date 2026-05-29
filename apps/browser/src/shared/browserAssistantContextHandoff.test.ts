import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAssistantContextItem } from "./browserAssistantContext";
import {
  createBrowserAssistantContextHandoffPreview,
  createBrowserAssistantContextScheduleSuggestionCard,
  createBrowserAssistantContextScheduleTaskDraft,
  createBrowserAssistantContextWorkflowGraphDraft,
  getBrowserAssistantContextHandoffAction
} from "./browserAssistantContextHandoff";

test("createBrowserAssistantContextHandoffPreview returns null without active context", () => {
  assert.equal(createBrowserAssistantContextHandoffPreview(null, "Oracle Launchpad"), null);
});

test("createBrowserAssistantContextHandoffPreview creates workflow and schedule drafts from page search context", () => {
  const item = createBrowserAssistantContextItem({
    source: "page_search",
    title: "Oracle AI Vector Search",
    url: "https://docs.oracle.com/ai-vector-search",
    query: "hybrid search",
    matches: [
      {
        label: "Page title",
        detail: "Oracle AI Vector Search"
      },
      {
        label: "Capture",
        detail: "Hybrid retrieval benchmark note"
      },
      {
        label: "Workspace",
        detail: "Enterprise AI Project PoC"
      },
      {
        label: "Extra",
        detail: "Ignored in prompt preview"
      }
    ]
  });

  const preview = createBrowserAssistantContextHandoffPreview(item, "Oracle Launchpad");
  assert.equal(preview?.sourceContextId, item.id);
  assert.equal(preview?.workspaceName, "Oracle Launchpad");
  assert.equal(preview?.actions.length, 2);

  const workflow = getBrowserAssistantContextHandoffAction(preview, "workflow");
  assert.equal(workflow?.label, "Council");
  assert.equal(workflow?.status, "draft_only");
  assert.match(workflow?.promptPreview ?? "", /Council \/ Workflow Graph/);
  assert.match(workflow?.promptPreview ?? "", /- Query: hybrid search/);
  assert.match(workflow?.promptPreview ?? "", /Page title: Oracle AI Vector Search/);
  assert.match(workflow?.promptPreview ?? "", /Approval gates|approval gate/);

  const schedule = getBrowserAssistantContextHandoffAction(preview, "schedule");
  assert.equal(schedule?.label, "Schedule");
  assert.equal(schedule?.status, "draft_only");
  assert.match(schedule?.promptPreview ?? "", /Scheduled Task/);
  assert.match(schedule?.promptPreview ?? "", /cadence/);
  assert.match(schedule?.promptPreview ?? "", /保存も自動実行も行わない/);
});

test("createBrowserAssistantContextHandoffPreview handles bookmark context without a query", () => {
  const item = createBrowserAssistantContextItem({
    source: "bookmark",
    title: "Oracle Docs",
    url: "https://docs.oracle.com"
  });

  const preview = createBrowserAssistantContextHandoffPreview(item, "  ");
  const workflow = getBrowserAssistantContextHandoffAction(preview, "workflow");
  const schedule = getBrowserAssistantContextHandoffAction(preview, "schedule");

  assert.equal(preview?.workspaceName, "Workspace");
  assert.match(workflow?.promptPreview ?? "", /- Source: Bookmark/);
  assert.doesNotMatch(workflow?.promptPreview ?? "", /- Query:/);
  assert.deepEqual(schedule?.details, ["Scheduled Tasks draft", "Cadence candidate", "Local run guardrails"]);
});

test("createBrowserAssistantContextScheduleTaskDraft maps attached context into a scheduler ready draft", () => {
  const item = createBrowserAssistantContextItem({
    source: "current_page",
    title: "Oracle AI Vector Search Documentation",
    url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    matches: [
      {
        label: "Page URL",
        detail: "Oracle Docs page"
      }
    ]
  });
  const preview = createBrowserAssistantContextHandoffPreview(item, "金融向け RAG 提案");
  const task = createBrowserAssistantContextScheduleTaskDraft(preview, "2026-05-28T09:00:00.000Z");

  assert.ok(task);
  assert.equal(task.source, "assistant_context");
  assert.equal(task.sourceRunHistoryId, item.id);
  assert.equal(task.status, "ready");
  assert.equal(task.enabled, true);
  assert.equal(task.approvalPolicy, "manual_review_required");
  assert.equal(task.workspaceName, "金融向け RAG 提案");
  assert.equal(task.cadenceLabel, "毎日 08:00 / Asia/Tokyo");
  assert.equal(task.nextRunAt, "2026-05-29T08:00:00.000Z");
  assert.match(task.prompt, /この段階では保存も自動実行も行わない/);
  assert.equal(task.runHistory.length, 0);
});

test("createBrowserAssistantContextScheduleSuggestionCard exposes attached context source details", () => {
  const item = createBrowserAssistantContextItem({
    source: "bookmark",
    title: "Oracle Docs",
    url: "https://docs.oracle.com"
  });
  const preview = createBrowserAssistantContextHandoffPreview(item, "Oracle Launchpad");
  const card = createBrowserAssistantContextScheduleSuggestionCard(preview, "2026-05-28T09:00:00.000Z");

  assert.ok(card);
  assert.equal(card.canConfirm, true);
  assert.equal(card.status, "ready");
  assert.match(card.description, /attached browser context/);
  assert.equal(card.details.includes("source: assistant_context"), true);
  assert.equal(card.details.includes("runs: 0/15"), true);
});

test("createBrowserAssistantContextWorkflowGraphDraft maps attached context into graph nodes", () => {
  const item = createBrowserAssistantContextItem({
    source: "page_search",
    title: "Oracle AI Vector Search Documentation",
    url: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    query: "hybrid search",
    matches: [
      {
        label: "Page title",
        detail: "Oracle AI Vector Search"
      },
      {
        label: "Capture",
        detail: "Hybrid retrieval benchmark note"
      }
    ]
  });
  const preview = createBrowserAssistantContextHandoffPreview(item, "金融向け RAG 提案");
  const draft = createBrowserAssistantContextWorkflowGraphDraft(preview);
  const compareNode = draft?.nodes.find((node) => node.kind === "compare");

  assert.ok(draft);
  assert.equal(draft.source, "assistant_context");
  assert.equal(draft.sourceContextId, item.id);
  assert.equal(draft.workspaceName, "金融向け RAG 提案");
  assert.equal(draft.nodeCount, 6);
  assert.equal(draft.approvalGateCount, 3);
  assert.match(draft.description, /attached browser context/);
  assert.match(compareNode?.detail ?? "", /Page title: Oracle AI Vector Search/);
  assert.equal(draft.details.includes("source: assistant_context"), true);
  assert.match(draft.guardrails.join("\n"), /BrowserOS source/);
});
