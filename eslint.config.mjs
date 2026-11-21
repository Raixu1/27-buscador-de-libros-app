// Reglas de calidad automáticas (también aplican al código escrito por la IA).
import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  globalIgnores([".expo/**", "dist/**", "android/**", "ios/**", "coverage/**", "expo-env.d.ts"]),
  {
    rules: {
      complexity: ["error", 10],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 3],
      "no-console": "error",
      eqeqeq: ["error", "always"],
      // Los tokens solo se guardan en expo-secure-store.
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "@react-native-async-storage/async-storage", message: "Use expo-secure-store para tokens." }],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": true, "ts-nocheck": true }],
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Guardia de seguridad de la IA y archivos de configuración: scripts de Node.
    files: ["ia/**/*.mjs", "*.config.{js,mjs}", "jest.setup.js"],
    languageOptions: { globals: { process: "readonly" } },
  },
]);
