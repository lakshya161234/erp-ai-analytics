const rateLimit = require("express-rate-limit");

function rateLimitMiddleware() {
  // Defaults tightened to protect Gemini quota (you can override via env)
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const max = Number(process.env.RATE_LIMIT_MAX || 30); // was 120

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: "Too many requests (API rate limit)" },

    // Avoid rate-limiting health checks
    skip: (req) => req.path === "/health" || req.originalUrl.startsWith("/health"),
  });
}

module.exports = { rateLimitMiddleware };
