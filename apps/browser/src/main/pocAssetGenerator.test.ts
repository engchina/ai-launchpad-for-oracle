import * as assert from "node:assert/strict";
import { test } from "node:test";
import { generatePocAssets } from "./pocAssetGenerator";

test("generatePocAssets returns starter assets", () => {
  const result = generatePocAssets({
    dbSchema: "sales_ai",
    vectorTable: "customer_chunks",
    objectStorageBucket: "demo-bucket"
  });

  assert.equal(result.status, "generated");
  assert.equal(result.assets.length, 4);
  assert.match(result.assets[1].content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(result.assets[2].content, /demo-bucket/);
});
