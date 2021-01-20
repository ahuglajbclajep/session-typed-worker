const HtmlWebpackPlugin = require("html-webpack-plugin");

/** @type {(env: NodeJS.ProcessEnv, argv: { mode?: string }) => import("webpack").Configuration} */
module.exports = (env, { mode }) => {
  const dev = mode !== "production";
  return {
    mode: "development",
    entry: "./src/index",
    target: ["web", "es2019"], // for Object.fromEntries()
    module: {
      rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }],
    },
    plugins: [new HtmlWebpackPlugin({ scriptLoading: "defer" })],
    resolve: { extensions: [".js", ".ts", ".tsx"] },
    devtool: dev ? "eval-source-map" : false,
  };
};
