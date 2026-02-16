function notFound(req, res, next) {
  res.status(404).json({ ok: false, error: "Not Found" });
}

function errorHandler(err, req, res, next) {
  const status = Number(err.status || 500);
  const msg = err.message || "Internal Server Error";
  if (process.env.NODE_ENV !== "test") {
    console.error("[error]", err);
  }
  res.status(status).json({
    ok: false,
    error: msg,
  });
}

module.exports = { errorHandler, notFound };
