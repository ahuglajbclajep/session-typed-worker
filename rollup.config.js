import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";

export default {
  input: "src/index.ts",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript(),
    babel({ extensions: [".ts"], babelHelpers: "bundled" }),
  ],
};
