import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserFormAutofillPreview } from "./browserFormAutofill";

test("createBrowserFormAutofillPreview creates a review-only form fill plan", () => {
  const preview = createBrowserFormAutofillPreview({
    currentUrl: "https://docs.oracle.com/en/cloud/paas/autonomous-database/",
    currentTitle: "Oracle AI Database PoC intake",
    workspaceName: "金融向け RAG 提案",
    sourceType: "oracle_docs",
    summary: "Customer wants a RAG demo for internal policy search.",
    knowledgeChunkCount: 4,
    captureCount: 2,
    providerLabel: "OCI GenAI Enterprise AI Project"
  });

  assert.equal(preview.title, "Form Autofill Guard Preview");
  assert.equal(preview.hostname, "docs.oracle.com");
  assert.equal(preview.readyCount, 1);
  assert.equal(preview.reviewCount, 2);
  assert.equal(preview.blockedCount, 0);
  assert.equal(preview.actions.find((action) => action.id === "fill_now")?.enabled, false);
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("DOM input")));
});

test("createBrowserFormAutofillPreview blocks credential-like fields", () => {
  const preview = createBrowserFormAutofillPreview({
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    workspaceName: "OCI tenancy setup",
    sourceType: "oci_console",
    summary: "Use wallet path and api key for the demo form."
  });

  assert.ok(preview.blockedCount >= 1);
  assert.ok(preview.fields.some((field) => field.kind === "credential" && field.decision === "blocked"));
  assert.equal(preview.actions.find((action) => action.id === "request_review")?.enabled, true);
});

test("createBrowserFormAutofillPreview redacts secret-like values", () => {
  const preview = createBrowserFormAutofillPreview({
    currentUrl: "https://example.com/form",
    currentTitle: "Partner intake",
    workspaceName: "Partner PoC",
    sourceType: "other",
    summary: "api key = super-secret-value should never be copied into the use case field."
  });
  const useCase = preview.fields.find((field) => field.id === "autofill-field-use-case");

  assert.ok(useCase);
  assert.match(useCase.suggestedValue, /\[redacted\]/);
  assert.doesNotMatch(useCase.suggestedValue, /super-secret-value/);
});

test("createBrowserFormAutofillPreview blocks payment fields", () => {
  const preview = createBrowserFormAutofillPreview({
    currentUrl: "https://example.com/checkout",
    currentTitle: "Checkout",
    workspaceName: "Procurement demo",
    sourceType: "other",
    summary: "The page asks for credit card and billing details."
  });

  assert.ok(preview.fields.some((field) => field.kind === "payment" && field.decision === "blocked"));
  assert.match(preview.guardrails.join("\n"), /payment/);
});
