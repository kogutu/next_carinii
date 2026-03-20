import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ← dodaj to
  globalIgnores([
    "components/ui/**",      // najpewniejszy i najczęściej używany sposób
    // ewentualnie bardziej precyzyjne:
    // "components/ui/**/*.{js,ts,jsx,tsx}",

    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;