import * as assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkAdbWallet } from "./adbWalletProbe";

async function createTempDir(): Promise<string> {
  const path = join(tmpdir(), `ai-launchpad-wallet-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(path, { recursive: true });
  return path;
}

test("checkAdbWallet reports missing wallet path", async () => {
  const result = await checkAdbWallet({});

  assert.equal(result.status, "not-configured");
  assert.match(result.message, /ADB wallet path/);
});

test("checkAdbWallet accepts readable wallet zip", async () => {
  const dir = await createTempDir();
  try {
    const walletPath = join(dir, "Wallet_demo.zip");
    await writeFile(walletPath, "mock wallet", "utf8");

    const result = await checkAdbWallet({ walletPath });

    assert.equal(result.status, "ready");
    assert.equal(result.walletPath, walletPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkAdbWallet validates wallet directory files", async () => {
  const dir = await createTempDir();
  try {
    await writeFile(join(dir, "tnsnames.ora"), "mock", "utf8");
    await writeFile(join(dir, "sqlnet.ora"), "mock", "utf8");
    await writeFile(join(dir, "ewallet.pem"), "mock", "utf8");

    const result = await checkAdbWallet({ walletPath: dir });

    assert.equal(result.status, "ready");
    assert.equal(result.checks?.every((check) => check.ok), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkAdbWallet rejects incomplete wallet directory", async () => {
  const dir = await createTempDir();
  try {
    await writeFile(join(dir, "tnsnames.ora"), "mock", "utf8");

    const result = await checkAdbWallet({ walletPath: dir });

    assert.equal(result.status, "invalid");
    assert.match(result.message, /不足ファイル/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
