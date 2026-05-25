import * as assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { checkOciConfig, getDefaultOciConfigPath, parseOciConfig } from "./ociConfigProbe";

async function createTempDir(): Promise<string> {
  const path = join(tmpdir(), `ai-launchpad-oci-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(path, {
    recursive: true
  });
  return path;
}

test("parseOciConfig reads default and named profiles without exposing values", () => {
  const profiles = parseOciConfig(`
[DEFAULT]
tenancy=ocid1.tenancy.oc1..example
region=ap-tokyo-1

[DEMO]
user=ocid1.user.oc1..example # inline comment
fingerprint=11:22:33
`);

  assert.equal(profiles.get("DEFAULT")?.tenancy, "ocid1.tenancy.oc1..example");
  assert.equal(profiles.get("DEMO")?.user, "ocid1.user.oc1..example");
  assert.equal(profiles.get("DEMO")?.fingerprint, "11:22:33");
});

test("getDefaultOciConfigPath resolves to the provided home directory", () => {
  assert.match(getDefaultOciConfigPath({ homeDir: "C:/Users/demo" }), /[/\\]\.oci[/\\]config$/);
});

test("checkOciConfig reports missing config file", async () => {
  const dir = await createTempDir();

  try {
    const result = await checkOciConfig({
      configPath: join(dir, "missing-config"),
      profile: "DEFAULT"
    });

    assert.equal(result.status, "not-configured");
    assert.equal(result.profile, "DEFAULT");
    assert.equal(result.checks?.[0].ok, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkOciConfig validates complete config and readable key file", async () => {
  const dir = await createTempDir();
  const configPath = join(dir, "config");
  const keyPath = join(dir, "oci_api_key.pem");

  try {
    await writeFile(keyPath, "-----BEGIN PRIVATE KEY-----\nmock\n-----END PRIVATE KEY-----\n", "utf8");
    await writeFile(
      configPath,
      [
        "[DEFAULT]",
        "tenancy=ocid1.tenancy.oc1..example",
        "user=ocid1.user.oc1..example",
        "fingerprint=11:22:33",
        "key_file=oci_api_key.pem",
        "region=ap-tokyo-1"
      ].join("\n"),
      "utf8"
    );

    const result = await checkOciConfig({ configPath, profile: "DEFAULT" });

    assert.equal(result.status, "ready");
    assert.equal(result.keyFilePath, keyPath);
    assert.equal(result.missingFields, undefined);
    assert.ok(result.checks?.every((check) => check.ok));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkOciConfig expands tilde key_file against the current home directory", async () => {
  const dir = await createTempDir();
  const configPath = join(dir, "config");
  const keyPath = join(dir, "oci_api_key.pem");

  try {
    await writeFile(keyPath, "mock-key", "utf8");
    await writeFile(
      configPath,
      [
        "[DEFAULT]",
        "tenancy=ocid1.tenancy.oc1..example",
        "user=ocid1.user.oc1..example",
        "fingerprint=11:22:33",
        "key_file=~/oci_api_key.pem",
        "region=ap-tokyo-1"
      ].join("\n"),
      "utf8"
    );

    const result = await checkOciConfig({ configPath, profile: "DEFAULT", homeDir: dir });

    assert.equal(result.status, "ready");
    assert.equal(result.keyFilePath, keyPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkOciConfig reports missing required fields without returning secret values", async () => {
  const dir = await createTempDir();
  const configPath = join(dir, "config");

  try {
    await writeFile(
      configPath,
      ["[DEFAULT]", "tenancy=ocid1.tenancy.oc1..example", "region=ap-tokyo-1"].join("\n"),
      "utf8"
    );

    const result = await checkOciConfig({ configPath, profile: "DEFAULT" });

    assert.equal(result.status, "invalid");
    assert.deepEqual(result.missingFields, ["user", "fingerprint", "key_file"]);
    assert.doesNotMatch(JSON.stringify(result), /ocid1\.tenancy/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
