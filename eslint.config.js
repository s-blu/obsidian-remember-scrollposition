import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores  } from "eslint/config";

export default defineConfig([
  { files: ["**/*.ts"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
    { files: ["**/*.spec.ts"], 
      rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
},
globalIgnores([
		"node_modules",
    "main.js",
    "coverage"
	]),
]);
