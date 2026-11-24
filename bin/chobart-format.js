#!/usr/bin/env node
// Prettier z konfiguracją pakietu. Uruchamiać z roota repo.
// Użycie: chobart-format [ścieżki] [--check | --write | --list-different]; domyślnie `--check .`
import path from "node:path";

import { checkArgs, packageFile, runTool } from "./run-tool.js";

// Tylko w roocie repo. Ta sama lista w eslint.config.js.
const IGNORED = ["!ios/**", "!.github/**"];

const args = process.argv.slice(2);
checkArgs(args, ["--check", "--write", "--list-different"]);

// Prettier nie stosuje wzorców `!` do ścieżek bezwzględnych ani wychodzących w górę drzewa.
const outsidePaths = args.filter((arg) => path.isAbsolute(arg) || arg.split(/[\\/]/).includes(".."));
if (outsidePaths.length > 0) {
  console.error(`Niedozwolone ścieżki: ${outsidePaths.join(" ")}. Podaj ścieżki względem roota repo, bez "..".`);
  process.exit(2);
}

const mode = args.some((arg) => arg.startsWith("-")) ? [] : ["--check"];
const paths = args.some((arg) => !arg.startsWith("-")) ? [] : ["."];

runTool({
  packageName: "prettier",
  binPath: "bin/prettier.cjs",
  fixedArgs: ["--config", packageFile("prettier.config.js")],
  args: [...mode, ...args, ...paths, ...IGNORED],
});
