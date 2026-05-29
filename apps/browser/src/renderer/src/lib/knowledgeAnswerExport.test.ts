import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createKnowledgeAnswerFileName, formatKnowledgeAnswerMarkdown } from "./knowledgeAnswerExport";

test("createKnowledgeAnswerFileName sanitizes unsafe filename characters", () => {
  assert.equal(
    createKnowledgeAnswerFileName('金融 PoC: GenAI / "Demo"', "2026-05-26T10:20:30.000Z"),
    "金融-PoC-GenAI-Demo-grounded-answer-2026-05-26.md"
  );
});

test("formatKnowledgeAnswerMarkdown includes answer sources", () => {
  const markdown = formatKnowledgeAnswerMarkdown({
    workspaceName: "金融向け GenAI 提案",
    playbookTitle: "OCI GenAI Enterprise AI Assistant",
    question: "PoC の前提は?",
    answer: "OCI GenAI endpoint、model、API key owner の確認が必要です。",
    adapterStatus: "OCI GenAI Enterprise AI / generated / 120ms",
    sources: [
      {
        chunk: {
          id: "chunk-1",
          captureId: "capture-1",
          title: "OCI Generative AI",
          sourceUrl: "https://docs.oracle.com/en-us/iaas/Content/generative-ai/home.htm",
          sourceKind: "page",
          text: "OCI GenAI setup"
        },
        score: 4,
        matchedTerms: ["genai", "setup"],
        excerpt: "OCI GenAI setup"
      }
    ]
  });

  assert.match(markdown, /# 金融向け GenAI 提案 Grounded Answer/);
  assert.match(markdown, /PoC の前提は\?/);
  assert.match(markdown, /OCI GenAI Enterprise AI \/ generated \/ 120ms/);
  assert.match(markdown, /OCI Generative AI/);
  assert.match(markdown, /https:\/\/docs\.oracle\.com\/en-us\/iaas\/Content\/generative-ai\/home\.htm/);
  assert.match(markdown, /Matched terms: genai, setup/);
  assert.doesNotMatch(markdown, /```sql/);
});
