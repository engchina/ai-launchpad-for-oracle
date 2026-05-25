import * as assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { clearStoredCaptures, listStoredCaptures, savePageCapture, saveScreenshotCapture } from "./localCaptureStore";

async function withTempStore(action: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "ai-launchpad-captures-"));
  try {
    await action(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("local capture store persists captures newest first", async () => {
  await withTempStore(async (dir) => {
    const first = await savePageCapture(dir, {
      workspaceId: "ws-1",
      title: "Oracle Docs",
      url: "https://docs.oracle.com/",
      sourceType: "oracle_docs"
    });
    const second = await savePageCapture(dir, {
      workspaceId: "ws-1",
      title: "OCI Console",
      url: "https://cloud.oracle.com/",
      sourceType: "oci_console"
    });

    const captures = await listStoredCaptures(dir);
    assert.equal(captures.length, 2);
    assert.equal(captures[0].id, second.id);
    assert.equal(captures[1].id, first.id);
  });
});

test("local capture store writes screenshot files and clears them", async () => {
  await withTempStore(async (dir) => {
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"></svg>'
    )}`;
    const capture = await saveScreenshotCapture(dir, {
      workspaceId: "ws-1",
      title: "Screen",
      url: "https://example.com/",
      sourceType: "other",
      screenshotDataUrl: dataUrl
    });

    assert.ok(capture.screenshotPath);
    assert.match(capture.screenshotDataUrl ?? "", /^file:\/\//);
    assert.match(await readFile(capture.screenshotPath!, "utf8"), /<svg/);

    await clearStoredCaptures(dir);
    assert.deepEqual(await listStoredCaptures(dir), []);
    await assert.rejects(access(capture.screenshotPath!));
  });
});
