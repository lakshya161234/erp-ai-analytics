const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Load env deterministically (prevents "edited wrong .env" issue)
const envPathLocal = path.resolve(__dirname, "../.env"); // apps/api/.env
const envPathRoot = path.resolve(__dirname, "../../../.env"); // repo root .env

if (fs.existsSync(envPathLocal)) {
  require("dotenv").config({ path: envPathLocal });
} else if (fs.existsSync(envPathRoot)) {
  require("dotenv").config({ path: envPathRoot });
} else {
  require("dotenv").config(); // fallback to CWD
}

const { rateLimitMiddleware } = require("./middlewares/rateLimit");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const healthRoutes = require("./routes/health.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Apply rate limit (defaults tightened in rateLimit.js below)
app.use(rateLimitMiddleware());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "erp-ai-analytics-api",
    routes: ["/health", "/chat"],
  });
});

app.use("/health", healthRoutes);
app.use("/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
