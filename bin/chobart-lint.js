#!/usr/bin/env node
// ESLint z konfiguracją pakietu i bez tolerancji ostrzeżeń. Uruchamiać z roota repo.
// Użycie: chobart-lint [ścieżki] [--fix] [--format=json] [--cache]
import { checkArgs, packageFile, runTool } from "./run-tool.js";

const args = process.argv.slice(2);
checkArgs(args, ["--fix", "--format", "--cache"]);

runTool({
  packageName: "eslint",
  binPath: "bin/eslint.js",
  fixedArgs: ["--config", packageFile("eslint.config.js"), "--max-warnings", "0"],
  args: args.some((arg) => !arg.startsWith("-")) ? args : [...args, "."],
});
