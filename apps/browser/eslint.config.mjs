import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["out", "dist", "node_modules", ".tmp"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/renderer/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
    }
  },
  {
    files: ["electron.vite.config.ts", "src/main/**/*.ts", "src/preload/**/*.ts"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ["*.cjs"],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node
    }
  }
);
