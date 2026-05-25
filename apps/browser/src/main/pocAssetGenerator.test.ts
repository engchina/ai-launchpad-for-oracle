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
  assert.equal(result.assets.length, 12);

  const proposal = result.assets.find((asset) => asset.kind === "proposal");
  const email = result.assets.find((asset) => asset.kind === "email");
  const diagram = result.assets.find((asset) => asset.kind === "diagram");
  const env = result.assets.find((asset) => asset.kind === "env");
  const demo = result.assets.find((asset) => asset.kind === "demo");
  const sql = result.assets.find((asset) => asset.kind === "sql");
  const python = result.assets.find((asset) => asset.kind === "python");
  const checklist = result.assets.find((asset) => asset.kind === "checklist");
  const troubleshooting = result.assets.find((asset) => asset.kind === "troubleshooting");
  const handover = result.assets.find((asset) => asset.kind === "handover");

  assert.ok(proposal);
  assert.ok(email);
  assert.ok(diagram);
  assert.ok(env);
  assert.ok(demo);
  assert.ok(sql);
  assert.ok(python);
  assert.ok(checklist);
  assert.ok(troubleshooting);
  assert.ok(handover);
  assert.match(proposal.content, /Proposal Section/);
  assert.match(email.content, /次アクション確認/);
  assert.match(diagram.content, /flowchart LR/);
  assert.match(diagram.content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(env.content, /OCI_OBJECT_STORAGE_BUCKET=demo-bucket/);
  assert.match(demo.content, /Demo Script/);
  assert.match(demo.content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(sql.content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(python.content, /demo-bucket/);
  assert.match(checklist.content, /PoC Checklist/);
  assert.match(checklist.content, /SALES_AI\.CUSTOMER_CHUNKS/);
  assert.match(troubleshooting.content, /Troubleshooting Guide/);
  assert.match(troubleshooting.content, /demo-bucket/);
  assert.match(handover.content, /Handover Document/);
  assert.match(handover.content, /demo-bucket/);
});
