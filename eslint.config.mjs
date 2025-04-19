// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

export default withNuxt(
  eslintConfigPrettier, // ➊ turn off stylistic rules that clash
  {
    // ➋ (optional) run Prettier as an ESLint rule
    rules: { "prettier/prettier": "error" },
  },
  // Your custom configs here
);
