const app = require("../src/index");

// Vercel Node Function entrypoint
module.exports = (req, res) => app(req, res);
