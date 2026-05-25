import * as assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkSqlcl } from "./sqlclProbe";

async function createTempDir(): Promise<string> {
  const path = join(tmpdir(), `ai-launchpad-sqlcl-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(path, { recursive: true });
  return path;
}

test("checkSqlcl reports missing executable", async () => {
  const result = await checkSqlcl({
    pathValue: ""
  });

  assert.equal(result.status, "not-configured");
  assert.match(result.message, /SQLcl executable/);
});

test("checkSqlcl honors explicit SQLCL path", async () => {
  const dir = await createTempDir();
  try {
    const sqlclPath = join(dir, process.platform === "win32" ? "sql.exe" : "sql");
    await writeFile(sqlclPath, "mock sqlcl", "utf8");

    const result = await checkSqlcl({
      sqlclPath,
      pathValue: ""
    });

    assert.equal(result.status, "ready");
    assert.equal(result.executablePath, sqlclPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("checkSqlcl finds SQLcl from PATH", async () => {
  const dir = await createTempDir();
  try {
    const sqlclPath = join(dir, process.platform === "win32" ? "sql.exe" : "sql");
    await writeFile(sqlclPath, "mock sqlcl", "utf8");

    const result = await checkSqlcl({
      pathValue: dir
    });

    assert.equal(result.status, "ready");
    assert.equal(result.executablePath, sqlclPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
