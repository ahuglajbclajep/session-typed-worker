const WorkerPlugin = require("worker-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [new WorkerPlugin()],
  resolve: {
    extensions: [".js", ".ts"]
  },
  output: {
    globalObject: "self"
  }
};
