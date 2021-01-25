const WorkerPlugin = require("worker-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index",
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  plugins: [new WorkerPlugin()],
  resolve: { extensions: [".js", ".ts"] },
};
