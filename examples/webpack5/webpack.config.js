/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "development",
  entry: "./src/index",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};
