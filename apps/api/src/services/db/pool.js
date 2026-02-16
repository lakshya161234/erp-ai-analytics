const { Pool } = require("pg");

let _pool;

function pool() {
  if (_pool) return _pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("Missing DATABASE_URL");
  _pool = new Pool({ connectionString: cs });
  return _pool;
}

module.exports = { pool };
