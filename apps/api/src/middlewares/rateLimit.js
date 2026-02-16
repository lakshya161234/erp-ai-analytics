const rateLimit = require("express-rate-limit");

function rateLimitMiddleware() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: "Too many requests" },
  });
}

module.exports = { rateLimitMiddleware };
