// `ios/` i `.github/` w roocie repo są poza zasięgiem obu komend (merge `ios/**` w screendogu publikuje TestFlight).
// Repo testowe powstaje w katalogu tymczasowym, bo `--write` zmienia pliki.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

const binDir = path.resolve(import.meta.dirname, "../bin");
const repoDir = realpathSync(mkdtempSync(path.join(tmpdir(), "lint-config-")));
after(() => rmSync(repoDir, { recursive: true }));

const UNFORMATTED_JSON = '{  "a":1 }\n';
const LINT_ERROR = "undefinedName;\n";
const IGNORED_DIRS = ["ios", ".github"];
// Ta sama nazwa głębiej w repo nie jest ignorowana.
const CHECKED_DIRS = ["web", "web/ios", "web/.github"];

for (const dir of [...IGNORED_DIRS, ...CHECKED_DIRS]) {
  mkdirSync(path.join(repoDir, dir), { recursive: true });
  writeFileSync(path.join(repoDir, dir, "file.json"), UNFORMATTED_JSON);
  writeFileSync(path.join(repoDir, dir, "file.js"), LINT_ERROR);
}

// Repo nie może cofnąć blokady własnym .gitignore.
writeFileSync(path.join(repoDir, ".gitignore"), "!ios/\n!.github/\n");

// Prettier szuka pluginów od katalogu uruchomienia; w repo aplikacji są w node_modules po instalacji pakietu.
symlinkSync(path.resolve(import.meta.dirname, "../node_modules"), path.join(repoDir, "node_modules"));

function run(bin, args) {
  return spawnSync(process.execPath, [path.join(binDir, bin), ...args], { cwd: repoDir, encoding: "utf8" });
}

function readJson(dir) {
  return readFileSync(path.join(repoDir, dir, "file.json"), "utf8");
}

test("chobart-lint pomija ios/ i .github/ tylko w roocie", () => {
  const { stdout, stderr } = run("chobart-lint.js", ["--format=json"]);
  assert.ok(stdout, stderr);
  const lintedDirs = JSON.parse(stdout).map(({ filePath }) => path.relative(repoDir, path.dirname(filePath)));
  assert.deepEqual(lintedDirs.sort(), [...CHECKED_DIRS].sort());
});

test("chobart-format pomija ios/ i .github/ tylko w roocie", () => {
  const { stdout } = run("chobart-format.js", ["--list-different"]);
  const jsonFiles = stdout.split("\n").filter((file) => file.endsWith(".json"));
  assert.deepEqual(jsonFiles.sort(), CHECKED_DIRS.map((dir) => `${dir}/file.json`).sort());
});

for (const dir of IGNORED_DIRS) {
  const outsideDir = path.basename(repoDir);
  const targets = [
    dir,
    `${dir}/file.json`,
    `./${dir}/file.json`,
    `${dir}/**`,
    `./${dir}/**`,
    `web/../${dir}/file.json`,
    `../${outsideDir}/${dir}/file.json`,
    path.join(repoDir, dir, "file.json"),
    path.join(repoDir, dir, "**"),
  ];
  for (const target of targets) {
    test(`chobart-format --write nie zmienia pliku: ${target.replace(repoDir, "<repo>").replace(outsideDir, "<repo>")}`, () => {
      writeFileSync(path.join(repoDir, dir, "file.json"), UNFORMATTED_JSON);
      const result = run("chobart-format.js", ["--write", target]);
      assert.equal(readJson(dir), UNFORMATTED_JSON, result.stdout);
      assert.notEqual(result.status, 0);
    });
  }
}

// Na końcu, bo zmienia pliki z CHECKED_DIRS.
test("chobart-format --write formatuje resztę repo", () => {
  assert.equal(run("chobart-format.js", ["--write"]).status, 0);
  for (const dir of IGNORED_DIRS) assert.equal(readJson(dir), UNFORMATTED_JSON, dir);
  for (const dir of CHECKED_DIRS) assert.equal(readJson(dir), '{ "a": 1 }\n', dir);
});
