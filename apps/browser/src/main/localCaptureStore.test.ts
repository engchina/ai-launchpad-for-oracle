import * as assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
    assert.equal(capture.screenshotDataUrl, dataUrl);
    assert.match(await readFile(capture.screenshotPath!, "utf8"), /<svg/);

    await clearStoredCaptures(dir);
    assert.deepEqual(await listStoredCaptures(dir), []);
    await assert.rejects(access(capture.screenshotPath!));
  });
});

test("local capture store hydrates legacy screenshot file urls for renderer thumbnails", async () => {
  await withTempStore(async (dir) => {
    const storeDir = join(dir, "capture-store");
    const screenshotDir = join(storeDir, "screenshots");
    const screenshotPath = join(screenshotDir, "legacy.svg");
    await mkdir(screenshotDir, { recursive: true });
    await writeFile(screenshotPath, '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"></svg>', "utf8");
    await writeFile(
      join(storeDir, "captures.json"),
      JSON.stringify(
        {
          version: 1,
          captures: [
            {
              id: "legacy",
              workspaceId: "ws-1",
              kind: "screenshot",
              title: "Legacy screenshot",
              url: "https://example.com/",
              sourceType: "other",
              screenshotDataUrl: `file://${screenshotPath.replace(/\\/g, "/")}`,
              screenshotPath,
              savedAt: "2026-05-29T00:00:00.000Z"
            }
          ]
        },
        null,
        2
      ),
      "utf8"
    );

    const captures = await listStoredCaptures(dir);
    assert.equal(captures.length, 1);
    assert.match(captures[0].screenshotDataUrl ?? "", /^data:image\/svg\+xml;base64,/);
  });
});
