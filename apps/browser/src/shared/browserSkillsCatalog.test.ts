import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserSkillsCatalogPreview } from "./browserSkillsCatalog";

test("createBrowserSkillsCatalogPreview exposes local clean-room skill metadata", () => {
  const preview = createBrowserSkillsCatalogPreview({
    workspaceName: "金融向け RAG 提案",
    playbookTitle: "Oracle Vector PoC",
    currentMode: "memory"
  });

  assert.equal(preview.title, "Skills Catalog Preview");
  assert.equal(preview.totalCount, 5);
  assert.equal(preview.activeCount, 2);
  assert.equal(preview.reviewCount, 1);
  assert.equal(preview.availableCount, 2);
  assert.equal(preview.recommendedSkillId, "rag-evidence-reviewer");
  assert.ok(preview.skills.every((skill) => skill.localFilePath.startsWith("~/.ai-launchpad-for-oracle/skills/")));
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
  assert.match(preview.guardrails.join("\n"), /skill file reuse なし/);
});

test("createBrowserSkillsCatalogPreview recommends RAG reviewer for vector evidence queries", () => {
  const preview = createBrowserSkillsCatalogPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "Customer follow-up",
    currentMode: "chat",
    instructionQuery: "Need RAG vector evidence and chunk quality review"
  });
  const recommended = preview.skills.find((skill) => skill.id === preview.recommendedSkillId);

  assert.equal(preview.recommendedSkillId, "rag-evidence-reviewer");
  assert.equal(recommended?.status, "available");
  assert.match(recommended?.outputContract ?? "", /evidence checklist/);
});

test("createBrowserSkillsCatalogPreview keeps browser automation guard under review", () => {
  const preview = createBrowserSkillsCatalogPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "Browser automation",
    currentMode: "agent",
    instructionQuery: "click through browser forms"
  });
  const guard = preview.skills.find((skill) => skill.id === "browser-action-guard");

  assert.equal(preview.recommendedSkillId, "browser-action-guard");
  assert.equal(guard?.status, "needs_review");
  assert.equal(guard?.risk, "review");
  assert.match(guard?.instructionPreview.join("\n") ?? "", /explicit approval/);
});

test("createBrowserSkillsCatalogPreview accepts explicit active skills and ignores unknown ids", () => {
  const preview = createBrowserSkillsCatalogPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "PoC",
    currentMode: "council",
    activeSkillIds: ["poc-package-builder", "missing-skill"]
  });
  const activeIds = preview.skills.filter((skill) => skill.status === "active").map((skill) => skill.id);

  assert.deepEqual(activeIds, ["poc-package-builder"]);
  assert.equal(preview.activeCount, 1);
  assert.equal(preview.skills.find((skill) => skill.id === "credential-safety-reviewer")?.status, "available");
});

test("createBrowserSkillsCatalogPreview does not enable preview actions that mutate local files", () => {
  const preview = createBrowserSkillsCatalogPreview({
    workspaceName: "Oracle Launchpad",
    playbookTitle: "Sales brief",
    currentMode: "memory"
  });

  assert.equal(preview.actions.find((action) => action.id === "activate_review")?.enabled, true);
  assert.equal(preview.actions.find((action) => action.id === "open_instruction")?.enabled, false);
  assert.equal(preview.actions.find((action) => action.id === "export_markdown")?.enabled, false);
});
