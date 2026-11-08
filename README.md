# @chobart/lint-config

Wspólna konfiguracja ESLint i Prettier dla repo JS/TS. Repo aplikacji nie zmieniają reguł; zmiana reguły to nowa wersja tego pakietu.

## Podpięcie repo

1. `.npmrc` w roocie repo (npm 12 domyślnie odrzuca zależności z gita):
   ```
   allow-git=root
   ```
2. Instalacja w roocie (w monorepo: w roocie, nie w workspace):
   ```
   npm install -D github:chobart/lint-config#v1.0.0
   ```
3. `eslint.config.js` w roocie, dokładnie jedna linia (dla edytora):
   ```js
   export { default } from "@chobart/lint-config";
   ```
4. W `package.json` roota:
   ```json
   "prettier": "@chobart/lint-config/prettier",
   "scripts": {
     "lint": "chobart-lint",
     "format": "chobart-format --write",
     "format:check": "chobart-format"
   }
   ```
5. Usunąć własne `eslint`, `prettier`, ich pluginy i pliki konfiguracji (`.eslintrc*`, `.prettierrc*`, `prettier.config.*`, `eslint.config.*` w workspace'ach).

Wymagania: Node `>=20.9`, TypeScript `>=5.0 <6.1` w repo (typy sprawdza TypeScript repo).

## Komendy

- `chobart-lint [ścieżki] [--fix] [--format=…] [--cache]` – ESLint z konfiguracją pakietu, `--max-warnings 0`, domyślnie `.`.
- `chobart-format [ścieżki] [--check | --write | --list-different]` – Prettier z konfiguracją pakietu, domyślnie `--check .`.

Obie uruchamiają ESLint i Prettier w wersjach z tego pakietu, niezależnie od tego, co jest w repo. Inne flagi są odrzucane.

## Zasady

- Każda reguła jest błędem albo jest wyłączona; ostrzeżeń nie ma.
- TypeScript: `typescript-eslint` `strictTypeChecked`. React i hooks: `recommended`. Dostępność: `jsx-a11y` `recommended`.
- Prettier: podwójne cudzysłowy, szerokość 120, przecinki na końcu, sortowanie importów, sortowanie klas Tailwinda (domyślny motyw Tailwind 4).
- Ignorowane: `.gitignore` repo oraz `build/`, `dist/`, `coverage/`, `.react-router/`, `.vercel/`.

## Wyjątki

Jedyna dozwolona forma: komentarz nad linią, z nazwą reguły i powodem.

```ts
// eslint-disable-next-line no-console -- tymczasowy log do diagnozy
console.log(value);
```

Odrzucane: wyłączenie bez nazwy reguły, bez powodu, na cały plik lub blok, konfiguracja w komentarzu (`/* eslint … */`), nieużywane wyłączenie. Nie da się wyłączyć: `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`, `@typescript-eslint/ban-ts-comment`, `react-hooks/rules-of-hooks` i reguł `eslint-comments`.

Każdy nowy wyjątek w PR wymaga akceptacji właściciela.

## Wersje

- Tag semver na każdą zmianę reguł; repo przypina tag, lockfile przypina commit.
- Przejście repo na nowy tag to osobna zmiana („bump”), razem z naprawą nowych błędów.
- ESLint 9, bo `eslint-plugin-react` i `eslint-plugin-jsx-a11y` nie obsługują jeszcze ESLint 10.
- `npm test` sprawdza, że każda reguła oblewa na przykładowym błędzie (`test/fixture/bad/`), a poprawny kod przechodzi (`test/fixture/good/`).
