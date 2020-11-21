import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";

export default {
  input: "src/index.ts",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [
    typescript(),
    babel({ extensions: [".ts"], babelHelpers: "bundled" }),
  ],
};
