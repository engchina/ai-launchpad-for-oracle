import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserAppConnectorsPreview } from "./browserAppConnectors";

const basePayload = {
  workspaceName: "金融向け RAG 提案",
  playbookTitle: "Oracle AI Database 提案 playbook",
  nowLabel: "2026-05-28 10:00"
};

test("createBrowserAppConnectorsPreview keeps OCI GenAI as the default connected provider", () => {
  const preview = createBrowserAppConnectorsPreview(basePayload);
  const connector = preview.connectors.find((item) => item.id === "oci_genai_project");

  assert.ok(connector, "OCI GenAI connector should exist");
  assert.equal(connector.status, "connected");
  assert.equal(connector.recommended, true);
  assert.ok(connector.description.includes("enterprise AI provider"));
});

test("createBrowserAppConnectorsPreview marks business apps as auth-required without exposing credentials", () => {
  const preview = createBrowserAppConnectorsPreview(basePayload);
  const mail = preview.connectors.find((item) => item.id === "business_email");

  assert.ok(mail, "business email connector should exist");
  assert.equal(mail.status, "needs_auth");
  assert.equal(mail.actions[0]?.id, "connect");
  assert.ok(preview.localOnlyNotice.includes("token"));
  assert.ok(preview.guardrails.some((guardrail) => guardrail.includes("credential")));
});

test("createBrowserAppConnectorsPreview supports manual fallback selection", () => {
  const preview = createBrowserAppConnectorsPreview({
    ...basePayload,
    manualFallbackConnectorIds: ["business_calendar"]
  });
  const calendar = preview.connectors.find((item) => item.id === "business_calendar");

  assert.ok(calendar, "business calendar connector should exist");
  assert.equal(calendar.status, "manual_fallback");
  assert.equal(calendar.actions.find((action) => action.id === "manual")?.enabled, true);
  assert.ok(calendar.manualFallback.includes("calendar web app"));
});

test("createBrowserAppConnectorsPreview blocks all scopes for blocked connectors", () => {
  const preview = createBrowserAppConnectorsPreview({
    ...basePayload,
    blockedConnectorIds: ["oci_object_storage"]
  });
  const storage = preview.connectors.find((item) => item.id === "oci_object_storage");

  assert.ok(storage, "object storage connector should exist");
  assert.equal(storage.status, "blocked");
  assert.ok(storage.scopes.every((scope) => scope.decision === "blocked"));
  assert.ok(storage.guardrails.some((guardrail) => guardrail.includes("policy review")));
});

test("createBrowserAppConnectorsPreview counts connector status groups", () => {
  const preview = createBrowserAppConnectorsPreview({
    ...basePayload,
    connectedConnectorIds: ["business_email"],
    manualFallbackConnectorIds: ["business_calendar"],
    blockedConnectorIds: ["oci_object_storage"]
  });

  assert.deepEqual(
    preview.stats.map((stat) => `${stat.label}:${stat.value}`),
    ["Connected:3", "Needs auth:0", "Fallback:2", "Blocked:1"]
  );
  assert.ok(preview.recommendedConnectorIds.includes("oracle_ai_database"));
});
