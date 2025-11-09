import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores  } from "eslint/config";

export default defineConfig([
  
  { files: ["**/*.ts"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
    
    {
      rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
},
tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
      {
        files: ["**/*.spec.ts"],
      rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off"
  }
},
globalIgnores([
		"node_modules",
    "main.js",
    "coverage"
	]),
]);
