import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
  },

  {
    plugins: {
      unicorn,
    },
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],

      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-meaningless-void-operator": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",

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
      "grouped-accessor-pairs": ["error", "getBeforeSet"],

      "@typescript-eslint/prefer-readonly": "error",

      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "no-public",
          },
        },
      ],

      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],

      "unicorn/consistent-destructuring": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-ternary": "warn",

      "no-console": "error",
      "no-regex-spaces": "error",
      "no-control-regex": "error",
      "no-useless-escape": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-unneeded-ternary": "error",

      "no-self-compare": "error",
      eqeqeq: ["error", "always"],
      "object-shorthand": ["error", "always"],
    },
  },
]);
