import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserPrivacyShieldPreview } from "./browserPrivacyShield";

test("createBrowserPrivacyShieldPreview creates a clean-room local blocking preview", () => {
  const preview = createBrowserPrivacyShieldPreview({
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    currentTitle: "Oracle AI Vector Search Documentation",
    workspaceName: "金融向け RAG 提案",
    sourceType: "oracle_docs",
    captureCount: 2
  });

  assert.equal(preview.title, "Privacy Shield Preview");
  assert.equal(preview.hostname, "docs.oracle.com");
  assert.equal(preview.mode, "balanced");
  assert.equal(preview.rules.length, 5);
  assert.ok(preview.blockedCount > 0);
  assert.ok(preview.reviewCount > 0);
  assert.ok(preview.allowedCount > 0);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source/);
  assert.match(preview.guardrails.join("\n"), /uBlock rule reuse なし/);
  assert.match(preview.details.join("\n"), /captures: 2/);
});

test("createBrowserPrivacyShieldPreview keeps first-party Oracle pages allowed", () => {
  const preview = createBrowserPrivacyShieldPreview({
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    workspaceName: "Oracle Launchpad",
    sourceType: "oci_console"
  });
  const firstPartyRule = preview.rules.find((rule) => rule.id === "privacy-rule-first-party");

  assert.equal(firstPartyRule?.decision, "allowed");
  assert.match(firstPartyRule?.detail ?? "", /trusted first-party/);
});

test("createBrowserPrivacyShieldPreview sends unknown first-party pages to review", () => {
  const preview = createBrowserPrivacyShieldPreview({
    currentUrl: "https://example.invalid/sales-demo",
    currentTitle: "Customer demo",
    workspaceName: "Oracle Launchpad",
    sourceType: "web"
  });
  const firstPartyRule = preview.rules.find((rule) => rule.id === "privacy-rule-first-party");

  assert.equal(firstPartyRule?.decision, "review");
  assert.equal(preview.events.find((event) => event.id === "privacy-event-document-allowed")?.decision, "review");
});

test("createBrowserPrivacyShieldPreview strict mode blocks fingerprinting and reviews downloads", () => {
  const preview = createBrowserPrivacyShieldPreview({
    currentUrl: "https://docs.oracle.com/",
    currentTitle: "Oracle Docs",
    workspaceName: "Oracle Launchpad",
    mode: "strict"
  });
  const fingerprintingRule = preview.rules.find((rule) => rule.id === "privacy-rule-fingerprinting");

  assert.equal(fingerprintingRule?.decision, "blocked");
  assert.equal(preview.events.some((event) => event.id === "privacy-event-download-review"), true);
  assert.equal(preview.actions.find((action) => action.id === "strict_preview")?.enabled, false);
});

test("createBrowserPrivacyShieldPreview compatibility mode avoids automatic blocks", () => {
  const preview = createBrowserPrivacyShieldPreview({
    currentUrl: "https://docs.oracle.com/",
    currentTitle: "Oracle Docs",
    workspaceName: "Oracle Launchpad",
    mode: "compatibility"
  });

  assert.equal(preview.rules.find((rule) => rule.id === "privacy-rule-third-party-tracking")?.decision, "review");
  assert.equal(preview.events.find((event) => event.id === "privacy-event-cross-site-trackers")?.decision, "review");
  assert.equal(preview.actions.find((action) => action.id === "allow_site")?.enabled, false);
});
