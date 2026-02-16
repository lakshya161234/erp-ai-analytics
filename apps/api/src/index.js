const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const { rateLimitMiddleware } = require("./middlewares/rateLimit");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const healthRoutes = require("./routes/health.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
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

// ✅ Export for Vercel serverless
module.exports = app;

// ✅ Keep local dev working
if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}
