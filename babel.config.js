module.exports = {
  presets: [["@babel/env", { bugfixes: true }]],
  plugins: [
    ["polyfill-corejs3", { method: "usage-pure", exclude: ["es.promise"] }],
  ],
};
