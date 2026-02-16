const { pool } = require("../pool");
const { TOP_SOLD_PRODUCT_SQL } = require("../queries/sales.queries");
const { REVENUE_SUMMARY_SQL, REVENUE_BY_DAY_SQL } = require("../queries/revenue.queries");
const { TOP_CLIENTS_BY_REVENUE_SQL } = require("../queries/clients.queries");
const { toIsoRange } = require("../../../utils/dateRange");

async function executeTool(name, args = {}) {
  const p = pool();
  const { from, to } = toIsoRange(args);

  if (name === "sales.top_products") {
    const limit = Number(args.limit || 5);
    const { rows } = await p.query(TOP_SOLD_PRODUCT_SQL, [from, to, limit]);
    return { from, to, limit, rows };
  }

  if (name === "revenue.summary") {
    const { rows } = await p.query(REVENUE_SUMMARY_SQL, [from, to]);
    return { from, to, ...rows[0] };
  }

  if (name === "revenue.by_day") {
    const { rows } = await p.query(REVENUE_BY_DAY_SQL, [from, to]);
    return { from, to, rows };
  }

  if (name === "clients.top_by_revenue") {
    const limit = Number(args.limit || 5);
    const { rows } = await p.query(TOP_CLIENTS_BY_REVENUE_SQL, [from, to, limit]);
    return { from, to, limit, rows };
  }

  const err = new Error(`Unknown tool: ${name}`);
  err.status = 400;
  throw err;
}

module.exports = { executeTool };
