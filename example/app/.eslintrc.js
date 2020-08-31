// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  extends: ["@rushstack/eslint-config", "@rushstack/eslint-config/react"],
  parserOptions: { tsconfigRootDir: __dirname },

  settings: {
    react: {
      version: "16.13",
    },
  },
};
