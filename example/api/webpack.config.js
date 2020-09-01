const webpack = require("webpack");

module.exports = {
  mode: "production",
  target: "async-node",
  resolve: {
    // Note: Do not specify '.ts' or '.tsx' here.
    // Webpack runs as a postprocess after the compiler.
    extensions: [".js", ".jsx", ".json"],
  },
  entry: "./temp/index.js",
  output: {
    filename: "index.js",
  },
  plugins: [new webpack.IgnorePlugin(/aws-sdk/), new webpack.IgnorePlugin(/aws-lambda/)],
};
