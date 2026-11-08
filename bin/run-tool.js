// Uruchamia narzędzie (ESLint, Prettier) z zależności tego pakietu, a nie z repo aplikacji.
// Dzięki temu repo i bramka zawsze używają wersji przypiętej w pakiecie, nawet gdy npm wyniesie
// na górę drzewa inną wersję narzędzia.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

export function packageFile(relativePath) {
  return path.join(import.meta.dirname, "..", relativePath);
}

function toolBin(packageName, binPath) {
  return path.join(path.dirname(require.resolve(`${packageName}/package.json`)), binPath);
}

// Odrzuca flagi spoza listy: inaczej `--config` albo `--rule` pozwoliłyby osłabić reguły z linii poleceń.
export function checkArgs(args, allowedFlags) {
  const rejected = args.filter(
    (arg) => arg.startsWith("-") && !allowedFlags.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );
  if (rejected.length > 0) {
    console.error(`Niedozwolone flagi: ${rejected.join(" ")}. Dozwolone: ${allowedFlags.join(" ")} oraz ścieżki.`);
    process.exit(2);
  }
}

export function runTool({ packageName, binPath, fixedArgs, args }) {
  const run = spawnSync(process.execPath, [toolBin(packageName, binPath), ...fixedArgs, ...args], { stdio: "inherit" });
  process.exit(run.status ?? 1);
}
