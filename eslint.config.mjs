import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import noAtelierTokens from "./eslint-rules/no-atelier-tokens.mjs";

/**
 * The `itrix` plugin carries repo-local rules that enforce decisions the type
 * system cannot. Currently one: the retired Atelier Indigo token names stay
 * retired (Surface 2 v5.0 §06 Phase 1 acceptance — "No file in src/ references
 * a retired token name").
 */
const itrixPlugin = {
  rules: {
    "no-atelier-tokens": noAtelierTokens,
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { itrix: itrixPlugin },
    rules: {
      "itrix/no-atelier-tokens": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
