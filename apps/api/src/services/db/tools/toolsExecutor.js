const { pool } = require("../pool");
const { TOP_SOLD_PRODUCT_SQL, TOP_PRODUCTS_BY_REVENUE_SQL } = require("../queries/sales.queries");
const {
  REVENUE_SUMMARY_SQL,
  REVENUE_BY_DAY_SQL,
  REVENUE_BY_WEEK_SQL,
  REVENUE_COMPARE_PERIODS_SQL,
} = require("../queries/revenue.queries");
const { TOP_CLIENTS_BY_REVENUE_SQL } = require("../queries/clients.queries");
const { ORDERS_HISTORY_SQL, ORDER_ITEMS_FOR_ORDER_SQL } = require("../queries/orders.queries");
const { SALES_BY_MONTH_SQL } = require("../queries/seasonal.queries");
const { AVG_PRICE_BY_MONTH_SQL } = require("../queries/market.queries");
const { MATERIAL_USAGE_BY_DAY_SQL, TOP_MATERIALS_USED_SQL } = require("../queries/materials.queries");
const { CUSTOMER_REPEAT_STATS_SQL, CUSTOMER_PRODUCT_AFFINITY_SQL } = require("../queries/customers.queries");
const { toIsoRange } = require("../../../utils/dateRange");
const { indexHolidays } = require("../../../utils/holidays");
const { DateTime } = require("luxon");

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clampLimit(v, def, max) {
  const n = Number(v ?? def);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}

function resolveMonthRange(args, opts) {
  // months_back default 12; range ends "now".
  const zone = opts?.now?.zone || "Asia/Kolkata";
  const nowISO = opts?.now?.now_local_iso;
  const now = nowISO ? DateTime.fromISO(nowISO, { zone }) : DateTime.now().setZone(zone);
  const monthsBack = clampLimit(args.months_back, 12, 60);
  const to = args.to ? DateTime.fromISO(String(args.to), { zone }) : now;
  const from = args.from ? DateTime.fromISO(String(args.from), { zone }) : to.minus({ months: monthsBack }).startOf("month");
  return { from: from.toUTC().toISO(), to: to.toUTC().toISO(), months_back: monthsBack };
}

async function executeTool(name, args = {}, opts = {}) {
  const p = pool();
  const factoryId = toIntOrNull(args.factory_id);

  // date ranges
  const { from, to } = toIsoRange(args, { zone: opts?.now?.zone || "Asia/Kolkata" });

  if (name === "sales.top_products") {
    const limit = clampLimit(args.limit, 5, Number(process.env.MAX_ROWS || 50));
    const { rows } = await p.query(TOP_SOLD_PRODUCT_SQL, [from, to, factoryId, limit]);
    return { from, to, factory_id: factoryId, limit, rows };
  }

  if (name === "sales.top_products_by_revenue") {
    const limit = clampLimit(args.limit, 5, Number(process.env.MAX_ROWS || 50));
    const { rows } = await p.query(TOP_PRODUCTS_BY_REVENUE_SQL, [from, to, factoryId, limit]);
    return { from, to, factory_id: factoryId, limit, rows };
  }

  if (name === "revenue.summary") {
    const { rows } = await p.query(REVENUE_SUMMARY_SQL, [from, to, factoryId]);
    return { from, to, factory_id: factoryId, ...rows[0] };
  }

  if (name === "revenue.by_day") {
    const { rows } = await p.query(REVENUE_BY_DAY_SQL, [from, to, factoryId]);
    return { from, to, factory_id: factoryId, rows };
  }

  if (name === "revenue.by_week") {
    const { rows } = await p.query(REVENUE_BY_WEEK_SQL, [from, to, factoryId]);
    return { from, to, factory_id: factoryId, rows };
  }

  if (name === "revenue.compare_periods") {
    const a_from = args.a_from;
    const a_to = args.a_to;
    const b_from = args.b_from;
    const b_to = args.b_to;
    if (!a_from || !a_to || !b_from || !b_to) {
      const err = new Error("compare_periods requires a_from, a_to, b_from, b_to");
      err.status = 400;
      throw err;
    }
    const { rows } = await p.query(REVENUE_COMPARE_PERIODS_SQL, [a_from, a_to, b_from, b_to, factoryId]);
    return { a_from, a_to, b_from, b_to, factory_id: factoryId, ...rows[0] };
  }

  if (name === "clients.top_by_revenue") {
    const limit = clampLimit(args.limit, 5, Number(process.env.MAX_ROWS || 50));
    const { rows } = await p.query(TOP_CLIENTS_BY_REVENUE_SQL, [from, to, factoryId, limit]);
    return { from, to, factory_id: factoryId, limit, rows };
  }

  if (name === "materials.top_used") {
    const limit = clampLimit(args.limit, 5, Number(process.env.MAX_ROWS || 50));
    const { rows } = await p.query(TOP_MATERIALS_USED_SQL, [from, to, factoryId, limit]);
    return { from, to, factory_id: factoryId, limit, rows };
  }

  if (name === "materials.usage_by_day") {
    const materialId = toIntOrNull(args.material_id);
    const { rows } = await p.query(MATERIAL_USAGE_BY_DAY_SQL, [from, to, factoryId, materialId]);
    return { from, to, factory_id: factoryId, material_id: materialId, rows };
  }

  if (name === "orders.history") {
    const limit = clampLimit(args.limit, 20, Number(process.env.MAX_ROWS || 50));
    const clientId = toIntOrNull(args.client_id);
    const includeItems = Boolean(args.include_items);
    const { rows } = await p.query(ORDERS_HISTORY_SQL, [from, to, factoryId, clientId, limit]);
    if (!includeItems || rows.length === 0) {
      return { from, to, factory_id: factoryId, client_id: clientId, limit, rows };
    }
    const withItems = [];
    for (const r of rows) {
      const items = await p.query(ORDER_ITEMS_FOR_ORDER_SQL, [r.order_id]);
      withItems.push({ ...r, items: items.rows });
    }
    return { from, to, factory_id: factoryId, client_id: clientId, limit, rows: withItems };
  }

  if (name === "seasonal.sales_by_month") {
    const mr = resolveMonthRange(args, opts);
    const { rows } = await p.query(SALES_BY_MONTH_SQL, [mr.from, mr.to, factoryId]);
    return { from: mr.from, to: mr.to, months_back: mr.months_back, factory_id: factoryId, rows };
  }

  if (name === "market.pricing_trend") {
    const mr = resolveMonthRange(args, opts);
    const productId = toIntOrNull(args.product_id);
    const { rows } = await p.query(AVG_PRICE_BY_MONTH_SQL, [mr.from, mr.to, factoryId, productId]);
    return { from: mr.from, to: mr.to, months_back: mr.months_back, factory_id: factoryId, product_id: productId, rows };
  }

  if (name === "customers.repeat_stats") {
    const limit = clampLimit(args.limit, 10, Number(process.env.MAX_ROWS || 50));
    const { rows } = await p.query(CUSTOMER_REPEAT_STATS_SQL, [from, to, factoryId, limit]);
    return { from, to, factory_id: factoryId, limit, rows };
  }

  if (name === "customers.product_affinity") {
    const limit = clampLimit(args.limit, 10, Number(process.env.MAX_ROWS || 50));
    const clientId = toIntOrNull(args.client_id);
    const { rows } = await p.query(CUSTOMER_PRODUCT_AFFINITY_SQL, [from, to, factoryId, clientId, limit]);
    return { from, to, factory_id: factoryId, client_id: clientId, limit, rows };
  }

  if (name === "external.holiday_impact") {
    // Reuse revenue.by_day and tag fixed-date holidays
    const { rows } = await p.query(REVENUE_BY_DAY_SQL, [from, to, factoryId]);
    const holidayMap = indexHolidays({ fromISO: from, toISO: to, zone: opts?.now?.zone || "Asia/Kolkata" });
    const tagged = rows.map((r) => {
      const dayLocal = DateTime.fromJSDate(new Date(r.day)).setZone(opts?.now?.zone || "Asia/Kolkata").toFormat('yyyy-LL-dd');
      return {
        ...r,
        day_local: dayLocal,
        holiday: holidayMap.get(dayLocal) || null,
      };
    });
    return { from, to, factory_id: factoryId, rows: tagged, notes: "Holiday list is fixed-date only (demo)." };
  }

  const err = new Error(`Unknown tool: ${name}`);
  err.status = 400;
  throw err;
}

module.exports = { executeTool };
