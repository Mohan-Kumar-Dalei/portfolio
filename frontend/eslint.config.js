import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Copy contains plenty of apostrophes and quotes; readability beats entities here.
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // src/components/ui is generated shadcn/cmdk code, kept as upstream ships it.
    files: ["src/components/ui/**/*.jsx"],
    rules: { "react/no-unknown-property": "off" },
  },
  {
    // Config files run in Node, not the browser.
    files: ["vite.config.js", "tailwind.config.js", "postcss.config.js", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
];
