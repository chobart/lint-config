// Komendy chobart-lint i chobart-format: używają konfiguracji pakietu i odrzucają flagi osłabiające reguły.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";

const binDir = path.resolve(import.meta.dirname, "../bin");
const fixtureDir = path.join(import.meta.dirname, "fixture");

function run(bin, args) {
  return spawnSync(process.execPath, [path.join(binDir, bin), ...args], { cwd: fixtureDir, encoding: "utf8" });
}

test("chobart-lint oblewa na plikach z błędami", () => {
  assert.equal(run("chobart-lint.js", ["bad/console-log.ts"]).status, 1);
});

test("chobart-lint przepuszcza poprawne pliki", () => {
  const result = run("chobart-lint.js", ["good"]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("chobart-lint odrzuca flagi zmieniające reguły i konfigurację", () => {
  for (const flag of ["--rule=no-console:off", "--config=inny.js", "-c", "--no-inline-config", "--max-warnings=10"]) {
    const result = run("chobart-lint.js", [flag, "good"]);
    assert.equal(result.status, 2, flag);
  }
});

test("chobart-format sprawdza format i odrzuca inne flagi", () => {
  assert.equal(run("chobart-format.js", ["good/tool.config.js"]).status, 0);
  assert.equal(run("chobart-format.js", ["--config=inny.json", "good"]).status, 2);
});
