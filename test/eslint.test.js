// Każda decyzja konfiguracji ma plik z dawnym błędem, który musi oblać, oraz pliki poprawne, które muszą przejść.
// ESLint jest uruchamiany tak jak w bramce: z katalogu repo, z konfiguracją pakietu przez `-c`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";

const packageDir = path.resolve(import.meta.dirname, "..");
const fixtureDir = path.join(import.meta.dirname, "fixture");
const eslintBin = path.join(packageDir, "node_modules/.bin/eslint");

const UNUSED_DIRECTIVE = "unused-directive";

const expectedByFile = {
  "bad/floating-promise.ts": "@typescript-eslint/no-floating-promises",
  "bad/explicit-any.ts": "@typescript-eslint/no-explicit-any",
  "bad/non-null-assertion.ts": "@typescript-eslint/no-non-null-assertion",
  "bad/unused-var.ts": "@typescript-eslint/no-unused-vars",
  "bad/ts-ignore.ts": "@typescript-eslint/ban-ts-comment",
  "bad/console-log.ts": "no-console",
  "bad/hook-in-condition.tsx": "react-hooks/rules-of-hooks",
  "bad/missing-deps.tsx": "react-hooks/exhaustive-deps",
  "bad/img-alt.tsx": "jsx-a11y/alt-text",
  "bad/label-control.tsx": "jsx-a11y/label-has-associated-control",
  "bad/missing-key.tsx": "react/jsx-key",
  "bad/disable-without-reason.ts": "@eslint-community/eslint-comments/require-description",
  "bad/disable-whole-file.ts": "@eslint-community/eslint-comments/no-use",
  "bad/inline-config.ts": "@eslint-community/eslint-comments/no-use",
  "bad/disable-unlimited.ts": "@eslint-community/eslint-comments/no-unlimited-disable",
  "bad/disable-restricted.ts": "@eslint-community/eslint-comments/no-restricted-disable",
  "bad/unused-disable.ts": UNUSED_DIRECTIVE,
};

function runEslint() {
  const run = spawnSync(eslintBin, ["-c", path.join(packageDir, "eslint.config.js"), "--format", "json", "."], {
    cwd: fixtureDir,
    encoding: "utf8",
  });
  assert.ok(run.stdout, `ESLint nie zwrócił wyniku: ${run.stderr}`);
  const results = JSON.parse(run.stdout);
  return new Map(results.map((result) => [path.relative(fixtureDir, result.filePath), result.messages]));
}

const messagesByFile = runEslint();

function ruleIds(messages) {
  // Nieużywana dyrektywa eslint-disable nie ma ruleId.
  return messages.map((message) => message.ruleId ?? UNUSED_DIRECTIVE);
}

for (const [file, expectedRule] of Object.entries(expectedByFile)) {
  test(`${file} oblewa na ${expectedRule}`, () => {
    const messages = messagesByFile.get(file);
    assert.ok(messages, `ESLint nie sprawdził pliku ${file}`);
    assert.ok(ruleIds(messages).includes(expectedRule), `Znalezione: ${ruleIds(messages).join(", ") || "nic"}`);
  });
}

test("każdy plik w bad/ ma oczekiwaną regułę", () => {
  const badFiles = [...messagesByFile.keys()].filter((file) => file.startsWith("bad/"));
  assert.deepEqual(badFiles.sort(), Object.keys(expectedByFile).sort());
});

test("pliki w good/ przechodzą bez uwag", () => {
  const goodFiles = [...messagesByFile.keys()].filter((file) => file.startsWith("good/"));
  assert.ok(goodFiles.length >= 3, `Za mało plików good/: ${goodFiles.join(", ")}`);
  for (const file of goodFiles) {
    assert.deepEqual(ruleIds(messagesByFile.get(file)), [], file);
  }
});

test("żadna reguła w wyliczonej konfiguracji nie jest ostrzeżeniem", () => {
  for (const file of ["good/component.tsx", "good/tool.config.js"]) {
    const run = spawnSync(eslintBin, ["-c", path.join(packageDir, "eslint.config.js"), "--print-config", file], {
      cwd: fixtureDir,
      encoding: "utf8",
    });
    const { rules } = JSON.parse(run.stdout);
    assert.ok(Object.keys(rules).length > 100, `${file}: podejrzanie mało reguł`);
    const warnRules = Object.entries(rules)
      .filter(([, setting]) => (Array.isArray(setting) ? setting[0] : setting) === 1)
      .map(([name]) => name);
    assert.deepEqual(warnRules, [], file);
  }
});
