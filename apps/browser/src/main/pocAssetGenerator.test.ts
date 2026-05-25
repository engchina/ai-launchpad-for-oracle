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
  assert.equal(result.assets.length, 7);

  const proposal = result.assets.find((asset) => asset.kind === "proposal");
  const email = result.assets.find((asset) => asset.kind === "email");
  const sql = result.assets.find((asset) => asset.kind === "sql");
  const python = result.assets.find((asset) => asset.kind === "python");
  const checklist = result.assets.find((asset) => asset.kind === "checklist");

  assert.ok(proposal);
  assert.ok(email);
  assert.ok(sql);
  assert.ok(python);
  assert.ok(checklist);
  assert.match(proposal.content, /Proposal Section/);
  assert.match(email.content, /次アクション確認/);
  assert.match(sql.content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(python.content, /demo-bucket/);
  assert.match(checklist.content, /PoC Checklist/);
  assert.match(checklist.content, /SALES_AI\.CUSTOMER_CHUNKS/);
});
