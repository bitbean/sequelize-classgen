/** @type {import("eslint").Linter.BaseConfig} */
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: [".eslintrc.cjs", "example.*", "bin/", "lib/"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.eslint.json",
    ecmaVersion: "latest",
    sourceType: "module",
    /** See https://stackoverflow.com/a/64940811 */
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-var-requires": "off",
    // "prefer-const": "off",
    "@typescript-eslint/no-namespace": "off",
    // "@typescript-eslint/no-non-null-assertion": "off",
    // "@typescript-eslint/naming-convention": "warn",
    // "@typescript-eslint/no-var-requires": "off",
    // "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        /** Allow all unused args. */
        argsIgnorePattern: ".",
        /** Allow unused vars that start with an underscore. */
        varsIgnorePattern: "^_",
      },
    ],
    "no-useless-escape": "off",
    // "prefer-const": "off",

    "node/no-missing-require": "off",
    "node/no-extraneous-require": "off",
  },
};
