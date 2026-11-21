import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Reglas de calidad automáticas (también aplican al código escrito por la IA).
export default tseslint.config(
  { ignores: [".expo/**", "node_modules/**", "dist/**", "ia/**", "*.config.js", "jest.setup.js", "expo-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["error"] }],
      eqeqeq: "error",
      complexity: ["error", 12],
      "max-lines-per-function": ["error", { max: 90, skipComments: true }],
      "max-lines": ["error", { max: 300, skipComments: true }],
      // Los tokens solo se guardan en expo-secure-store.
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "@react-native-async-storage/async-storage", message: "Use expo-secure-store para tokens." }] },
      ],
    },
  },
  { files: ["**/__tests__/**"], rules: { "max-lines-per-function": "off" } },
);
