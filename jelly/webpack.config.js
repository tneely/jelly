const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  target: "async-node",
  resolve: {
    // Note: Do not specify '.ts' or '.tsx' here.
    // Webpack runs as a postprocess after the compiler.
    extensions: [".js", ".jsx", ".json"],
  },
  entry: {
    auth: "./dist/lambda/auth/index.js",
  },
  output: {
    filename: "[name]/index.js",
    path: path.resolve(__dirname, "dist/lambda"),
  },
  plugins: [new webpack.IgnorePlugin(/aws-sdk/), new webpack.IgnorePlugin(/aws-lambda/)],
};
