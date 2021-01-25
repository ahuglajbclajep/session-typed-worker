/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "development",
  entry: "./src/index",
  target: ["web", "es2019"], // for Object.fromEntries()
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  resolve: { extensions: [".js", ".ts"] },
};
