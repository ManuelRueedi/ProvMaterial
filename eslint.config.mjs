// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default withNuxt(
  eslintConfigPrettier, // ➊ turn off stylistic rules that clash
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    // ➋ (optional) run Prettier as an ESLint rule
    rules: {
      "prettier/prettier": "off",
      "vue/no-multiple-template-root": "off",
    },
  },
  // Your custom configs here
);
