// Pluginy Prettiera pochodzą z pakietu, a nie z node_modules repo, w którym uruchomiono komendę.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const formatBin = path.resolve(import.meta.dirname, "../bin/chobart-format.js");

const input = `import { helper } from './local'
import { z } from 'zod'
export const View = () => <div className='text-white p-4 flex'>{[helper, z].length}</div>
`;

const expected = `import { z } from "zod";

import { helper } from "./local";

export const View = () => <div className="flex p-4 text-white">{[helper, z].length}</div>;
`;

function formatInRepo(t, fakePlugins) {
  const repoDir = mkdtempSync(path.join(tmpdir(), "lint-config-"));
  t.after(() => rmSync(repoDir, { recursive: true }));
  for (const name of fakePlugins) {
    const pluginDir = path.join(repoDir, "node_modules", name);
    mkdirSync(pluginDir, { recursive: true });
    writeFileSync(path.join(pluginDir, "package.json"), JSON.stringify({ name, main: "index.js" }));
    writeFileSync(path.join(pluginDir, "index.js"), 'throw new Error("plugin z repo");');
  }
  const viewPath = path.join(repoDir, "view.tsx");
  writeFileSync(viewPath, input);
  const result = spawnSync(process.execPath, [formatBin, "--write", "view.tsx"], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return readFileSync(viewPath, "utf8");
}

test("repo bez pluginów w node_modules", (t) => {
  assert.equal(formatInRepo(t, []), expected);
});

for (const name of ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"]) {
  test(`repo z własnym ${name}`, (t) => {
    assert.equal(formatInRepo(t, [name]), expected);
  });
}
