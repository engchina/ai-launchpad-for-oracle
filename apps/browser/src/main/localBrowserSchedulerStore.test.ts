import * as assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { BrowserSchedulerTaskPayload } from "../shared/browserSchedulerRegistry";
import { clearBrowserSchedulerTasks, listBrowserSchedulerTasks, upsertBrowserSchedulerTask } from "./localBrowserSchedulerStore";

const taskPayload: BrowserSchedulerTaskPayload = {
  source: "mcp_run_history",
  sourceRunHistoryId: "mcp-run-history-audit-1",
  name: "navigate 定期確認",
  prompt: "Oracle PoC Workspace で tools/call / navigate を schedule preview として再実行する。",
  workspaceName: "Oracle PoC Workspace",
  cadence: {
    type: "hourly",
    intervalHours: 6
  },
  cadenceLabel: "6時間ごと",
  enabled: true,
  status: "ready",
  approvalPolicy: "manual_review_required",
  nextRunAt: "2026-05-28T15:00:00.000Z",
  lastRunStatus: "completed",
  runHistory: []
};

async function withTempStore(action: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "ai-launchpad-browser-scheduler-"));
  try {
    await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("Browser scheduler store persists and replaces tasks by source run history", async () => {
  await withTempStore(async (dir) => {
    const first = await upsertBrowserSchedulerTask(dir, taskPayload);
    const second = await upsertBrowserSchedulerTask(dir, {
      ...taskPayload,
      id: "replacement-task",
      name: "更新済み schedule draft"
    });

    const tasks = await listBrowserSchedulerTasks(dir);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, second.id);
    assert.equal(tasks[0].id, "replacement-task");
    assert.notEqual(first.id, second.id);
    assert.equal(tasks[0].name, "更新済み schedule draft");
  });
});

test("Browser scheduler store enforces max tasks and clears store", async () => {
  await withTempStore(async (dir) => {
    await upsertBrowserSchedulerTask(
      dir,
      {
        ...taskPayload,
        sourceRunHistoryId: "run-1",
        name: "task 1"
      },
      1
    );
    await upsertBrowserSchedulerTask(
      dir,
      {
        ...taskPayload,
        sourceRunHistoryId: "run-2",
        name: "task 2"
      },
      1
    );

    assert.equal((await listBrowserSchedulerTasks(dir)).length, 1);
    await clearBrowserSchedulerTasks(dir);
    assert.deepEqual(await listBrowserSchedulerTasks(dir), []);
  });
});
