import * as assert from "node:assert/strict";
import { test } from "node:test";
import { createBrowserExtensionPermissionsPreview } from "./browserExtensionPermissions";

test("createBrowserExtensionPermissionsPreview creates a Chrome-compatible permission review", () => {
  const preview = createBrowserExtensionPermissionsPreview({
    workspaceName: "金融向け RAG 提案",
    currentUrl: "https://docs.oracle.com/en/database/oracle/oracle-database/26/vecse/",
    currentTitle: "Oracle AI Vector Search Documentation",
    captureCount: 2,
    connectedMcpCount: 1
  });

  assert.equal(preview.title, "Extensions Preview");
  assert.equal(preview.hostname, "docs.oracle.com");
  assert.equal(preview.installedCount, 5);
  assert.equal(preview.allowedCount, 1);
  assert.equal(preview.reviewCount, 3);
  assert.equal(preview.blockedCount, 1);
  assert.match(preview.guardrails.join("\n"), /BrowserOS source \/ extension manifest/);
  assert.match(preview.guardrails.join("\n"), /Chrome Web Store request/);
});

test("createBrowserExtensionPermissionsPreview keeps broad permissions under review", () => {
  const preview = createBrowserExtensionPermissionsPreview({
    workspaceName: "Oracle Launchpad",
    currentUrl: "https://example.com/sales-demo",
    currentTitle: "Customer demo",
    captureCount: 0
  });
  const broadPermissions = preview.extensions.flatMap((extension) =>
    extension.permissions.filter((permission) => permission.scope === "all_sites" || permission.scope === "cookies")
  );

  assert.ok(broadPermissions.length >= 3);
  assert.equal(broadPermissions.every((permission) => permission.decision !== "allowed"), true);
});

test("createBrowserExtensionPermissionsPreview blocks AI autofill and disconnected native host", () => {
  const preview = createBrowserExtensionPermissionsPreview({
    workspaceName: "Oracle Launchpad",
    currentUrl: "https://cloud.oracle.com/",
    currentTitle: "OCI Console",
    captureCount: 1,
    connectedMcpCount: 0
  });
  const autofill = preview.extensions.find((extension) => extension.id === "ai-autofill-agent");
  const nativeHost = preview.extensions.find((extension) => extension.id === "local-mcp-native-host");

  assert.equal(autofill?.decision, "blocked");
  assert.equal(nativeHost?.decision, "blocked");
  assert.match(autofill?.detail ?? "", /approval gate/);
});

test("createBrowserExtensionPermissionsPreview does not enable install or import actions", () => {
  const preview = createBrowserExtensionPermissionsPreview({
    workspaceName: "Oracle Launchpad",
    currentUrl: "https://docs.oracle.com/",
    currentTitle: "Oracle Docs",
    captureCount: 1,
    connectedMcpCount: 2
  });

  assert.equal(preview.actions.find((action) => action.id === "review_permissions")?.enabled, true);
  assert.equal(preview.actions.find((action) => action.id === "import_from_chrome")?.enabled, false);
  assert.equal(preview.actions.find((action) => action.id === "install_extension")?.enabled, false);
  assert.match(preview.guardrails.join("\n"), /password、cookie、wallet、token、private key/);
});
