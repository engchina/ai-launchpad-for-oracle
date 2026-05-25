import * as assert from "node:assert/strict";
import { test } from "node:test";
import { checkObjectStorage } from "./objectStorageProbe";

test("checkObjectStorage reports missing config", () => {
  const result = checkObjectStorage({
    namespace: "",
    bucketName: "",
    region: ""
  });

  assert.equal(result.status, "not-configured");
  assert.match(result.message, /設定が不足/);
});

test("checkObjectStorage accepts namespace bucket and region", () => {
  const result = checkObjectStorage({
    namespace: "demo_namespace",
    bucketName: "ai-launchpad-demo",
    region: "ap-tokyo-1"
  });

  assert.equal(result.status, "ready");
  assert.equal(result.bucketName, "ai-launchpad-demo");
});

test("checkObjectStorage rejects invalid bucket names", () => {
  const result = checkObjectStorage({
    namespace: "demo_namespace",
    bucketName: "invalid bucket",
    region: "ap-tokyo-1"
  });

  assert.equal(result.status, "invalid");
  assert.match(result.message, /bucket name/);
});
