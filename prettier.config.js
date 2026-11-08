// Wspólna konfiguracja Prettiera. Repo aplikacji: `"prettier": "@chobart/lint-config/prettier"` w package.json.
// Ustawienia jak w .prettierrc screendoga; prettier-plugin-tailwindcss musi być ostatni (wymóg pluginu).
// Bez `tailwindStylesheet`: plugin sortuje według domyślnego motywu Tailwind 4.
/** @type {import("prettier").Config} */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  bracketSpacing: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 120,
  endOfLine: "auto",
  importOrder: ["^react$", "^@(.*)|^[aA-zZ](.*)", "^[.|~]/(.*)"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
