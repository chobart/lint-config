// Wspólna konfiguracja ESLint (flat config) dla repo JS/TS.
// Repo aplikacji: `export { default } from "@chobart/lint-config";` w eslint.config.js w roocie.
// Bramka uruchamia ESLint z tym plikiem przez `-c`, więc zmiany w konfiguracji repo nie osłabiają reguł.
import comments from "@eslint-community/eslint-plugin-eslint-comments";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { existsSync } from "node:fs";
import path from "node:path";
import tseslint from "typescript-eslint";

// Repo jest katalogiem, z którego uruchamia się ESLint (skrypt `lint` w roocie albo bramka).
// `import.meta.dirname` wskazywałby na node_modules pakietu, dlatego cwd.
const rootDir = process.cwd();
const gitignorePath = path.join(rootDir, ".gitignore");

const TS_FILES = ["**/*.{ts,tsx,mts,cts}"];
const JS_FILES = ["**/*.{js,jsx,mjs,cjs}"];
const JSX_FILES = ["**/*.{jsx,tsx}"];

// Reguł z tej listy nie da się wyłączyć nawet komentarzem z powodem.
const NEVER_DISABLE = [
  "@typescript-eslint/no-floating-promises",
  "@typescript-eslint/no-misused-promises",
  "@typescript-eslint/ban-ts-comment",
  "react-hooks/rules-of-hooks",
  "@eslint-community/eslint-comments/*",
];

// Decyzja 8: każda reguła to błąd albo jest wyłączona. Presety pluginów mają część reguł jako "warn".
function warnToError(configs) {
  return configs.map((config) => {
    if (!config.rules) return config;
    const rules = Object.fromEntries(
      Object.entries(config.rules).map(([name, setting]) => {
        if (setting === "warn" || setting === 1) return [name, "error"];
        if (Array.isArray(setting) && (setting[0] === "warn" || setting[0] === 1))
          return [name, ["error", ...setting.slice(1)]];
        return [name, setting];
      }),
    );
    return { ...config, rules };
  });
}

const baseConfigs = [
  {
    name: "chobart/ignores-defaults",
    ignores: ["**/node_modules/", "**/build/", "**/dist/", "**/coverage/", "**/.react-router/", "**/.vercel/"],
  },
  ...(existsSync(gitignorePath) ? [includeIgnoreFile(gitignorePath, "chobart/gitignore")] : []),
  {
    name: "chobart/linter-options",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  js.configs.recommended,
  // Decyzja 2: strictTypeChecked z projectService (TS z repo aplikacji).
  ...tseslint.configs.strictTypeChecked.map((config) => ({ ...config, files: config.files ?? TS_FILES })),
  {
    name: "chobart/typescript-parser",
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: rootDir,
      },
    },
  },
  {
    name: "chobart/globals",
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // Decyzja 6: React, hooks i dostępność w wariantach recommended.
  { ...react.configs.flat.recommended, files: JSX_FILES },
  { ...react.configs.flat["jsx-runtime"], files: JSX_FILES },
  { ...reactHooks.configs.flat.recommended, files: [...TS_FILES, ...JS_FILES] },
  { ...jsxA11y.flatConfigs.recommended, files: JSX_FILES },
  {
    name: "chobart/react-settings",
    settings: {
      react: { version: "detect" },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
  },
  // Decyzja 7: własne reguły Barta.
  {
    name: "chobart/rules",
    rules: {
      "no-console": ["error", { allow: ["error", "warn", "info"] }],
      "jsx-a11y/no-autofocus": "off",
    },
  },
  {
    name: "chobart/typescript-rules",
    files: TS_FILES,
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  // Decyzja 9: wyjątek tylko jako `eslint-disable-next-line <reguła> -- powód`.
  {
    name: "chobart/disable-comments",
    plugins: { "@eslint-community/eslint-comments": comments },
    rules: {
      "@eslint-community/eslint-comments/no-use": ["error", { allow: ["eslint-disable-next-line"] }],
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/no-duplicate-disable": "error",
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-restricted-disable": ["error", ...NEVER_DISABLE],
    },
  },
  // Pliki JS (np. konfiguracje narzędzi) nie należą do tsconfig: bez reguł wymagających typów.
  { ...tseslint.configs.disableTypeChecked, files: JS_FILES },
  // Decyzja 5: Prettier działa osobno; wyłączyć reguły, które się z nim gryzą. Musi być ostatni.
  prettier,
];

export default defineConfig(warnToError(baseConfigs));
