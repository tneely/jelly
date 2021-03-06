// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  extends: [
    "@rushstack/eslint-config/profile/web-app",
    // "@rushstack/eslint-config/mixins/react", // TODO: Enable once conflict with CRA is resolved
  ],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/typedef": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@rushstack/typedef-var": "off",
    "no-new": "off",
  },

  settings: {
    react: {
      version: "17.0",
    },
  },
};
