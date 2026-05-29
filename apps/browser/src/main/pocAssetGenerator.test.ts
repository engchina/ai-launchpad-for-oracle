import * as assert from "node:assert/strict";
import { test } from "node:test";
import { generatePocAssets } from "./pocAssetGenerator";

test("generatePocAssets returns OCI GenAI Enterprise AI starter assets", () => {
  const result = generatePocAssets({
    playbookTitle: "OCI GenAI Assistant",
    useCase: "Enterprise AI question answering",
    genAiModel: "cohere.command-r-plus"
  });

  assert.equal(result.status, "generated");
  assert.equal(result.assets.length, 9);

  const proposal = result.assets.find((asset) => asset.kind === "proposal");
  const email = result.assets.find((asset) => asset.kind === "email");
  const diagram = result.assets.find((asset) => asset.kind === "diagram");
  const env = result.assets.find((asset) => asset.kind === "env");
  const demo = result.assets.find((asset) => asset.kind === "demo");
  const checklist = result.assets.find((asset) => asset.kind === "checklist");
  const troubleshooting = result.assets.find((asset) => asset.kind === "troubleshooting");
  const handover = result.assets.find((asset) => asset.kind === "handover");

  assert.ok(proposal);
  assert.ok(email);
  assert.ok(diagram);
  assert.ok(env);
  assert.ok(demo);
  assert.ok(checklist);
  assert.ok(troubleshooting);
  assert.ok(handover);
  assert.match(proposal.content, /OCI GenAI Enterprise AI/);
  assert.match(email.content, /次アクション確認/);
  assert.match(diagram.content, /flowchart LR/);
  assert.match(diagram.content, /cohere\.command-r-plus/);
  assert.match(env.content, /OCI_GENAI_MODEL=cohere\.command-r-plus/);
  assert.match(demo.content, /Demo Script/);
  assert.match(checklist.content, /PoC Checklist/);
  assert.match(troubleshooting.content, /Troubleshooting Guide/);
  assert.match(handover.content, /Handover Document/);
  assert.equal(result.assets.some((asset) => asset.fileName.endsWith(".sql")), false);
  assert.equal(result.assets.some((asset) => asset.fileName.endsWith(".py")), false);
  assert.equal(result.assets.some((asset) => asset.fileName.includes("terraform")), false);
});
