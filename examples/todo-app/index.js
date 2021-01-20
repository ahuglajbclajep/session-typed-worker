const { json } = require("micro");
const handler = require("serve-handler");

let contents = [];

module.exports = async (req, res) => {
  if (req.url === "/api" && req.method === "GET") return contents;
  if (req.url === "/api" && req.method === "POST") {
    contents = await json(req);
    return "";
  }
  return handler(req, res, { public: "dist" });
};
