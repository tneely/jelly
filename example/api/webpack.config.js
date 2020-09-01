module.exports = {
  mode: "production",
  target: "node",
  resolve: {
    // Note: Do not specify '.ts' or '.tsx' here.
    // Webpack runs as a postprocess after the compiler.
    extensions: [".js", ".jsx", ".json"],
  },
  entry: "./temp/index.js",
  output: {
    libraryTarget: "commonjs",
    filename: "index.js",
  },
  externals: {
    "aws-sdk": "commonjs aws-sdk",
  },
};
