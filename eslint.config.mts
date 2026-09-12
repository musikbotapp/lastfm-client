import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";
import tsdoc from "eslint-plugin-tsdoc";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
  },

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.all,

  {
    plugins: {
      tsdoc,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    rules: {
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Rules not included in any presets
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: [
            "signature",
            "call-signature",
            "public-static-field",
            "protected-static-field",
            "private-static-field",
            "#private-static-field",
            "public-instance-field",
            "protected-instance-field",
            "private-instance-field",
            "#private-instance-field",
            "constructor",
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",
          ],
        },
      ],

      "no-console": "error",
      "no-unneeded-ternary": "error",
      "no-self-compare": "error",
      eqeqeq: ["error", "always"],
      "object-shorthand": ["error", "always"],
      "grouped-accessor-pairs": ["error", "getBeforeSet"],

      "tsdoc/syntax": "error",

      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Intentional Option Overrides for Preset Rules
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],

      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Unicorn Disabled Rules
      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      "unicorn/no-null": "off",
      "unicorn/consistent-class-member-order": "off",
      "unicorn/require-array-sort-compare": "off",
      "unicorn/prefer-await": "off",
      "unicorn/no-asterisk-prefix-in-documentation-comments": "off",
      "unicorn/prefer-error-is-error": "off",
      "unicorn/no-keyword-prefix": "off",
      "unicorn/no-unreadable-new-expression": "off",
      "unicorn/comment-content": "off",
    },
  },
]);
