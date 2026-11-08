#!/usr/bin/env node
// Prettier z konfiguracją pakietu. Uruchamiać z roota repo.
// Użycie: chobart-format [ścieżki] [--check | --write | --list-different]; domyślnie `--check .`
import { checkArgs, packageFile, runTool } from "./run-tool.js";

const args = process.argv.slice(2);
checkArgs(args, ["--check", "--write", "--list-different"]);

const mode = args.some((arg) => arg.startsWith("-")) ? [] : ["--check"];
const paths = args.some((arg) => !arg.startsWith("-")) ? [] : ["."];

runTool({
  packageName: "prettier",
  binPath: "bin/prettier.cjs",
  fixedArgs: ["--config", packageFile("prettier.config.js")],
  args: [...mode, ...args, ...paths],
});
