module.exports = {
  presets: ["@babel/env"],
  plugins: [["polyfill-corejs3", { method: "usage-pure" }]],
};
