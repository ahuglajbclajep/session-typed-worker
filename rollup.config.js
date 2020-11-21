import typescript from "rollup-plugin-typescript2";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/index.module.js",
      format: "es",
      plugins: [
        getBabelOutputPlugin({
          presets: [["@babel/env", { bugfixes: true }]],
        }),
      ],
    },
    {
      file: "lib/index.js",
      format: "cjs",
      plugins: [
        getBabelOutputPlugin({
          presets: [["@babel/env", { ignoreBrowserslistConfig: true }]],
          plugins: ["babel-plugin-transform-async-to-promises"],
        }),
      ],
    },
  ],
  plugins: [typescript()],
};
