const path = require("path");

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
  externals: {
    "aws-sdk": "commonjs aws-sdk",
    "aws-lambda": "commonjs aws-lambda",
  },
};
