const { Pool } = require("pg");

let _pool;

function pool() {
  if (_pool) return _pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("Missing DATABASE_URL");
  const timeoutMs = Number(process.env.QUERY_TIMEOUT_MS || 5000);
  _pool = new Pool({
    connectionString: cs,
    // Enforce server-side query timeout (prevents runaway analytics queries)
    options: `-c statement_timeout=${timeoutMs}`,
  });
  return _pool;
}

module.exports = { pool };
