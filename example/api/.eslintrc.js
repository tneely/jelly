// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  extends: ["@rushstack/eslint-config"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
  },
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/typedef": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
