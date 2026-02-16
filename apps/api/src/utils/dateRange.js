const { DateTime } = require("luxon");

/**
 * Convert args that include a date range into normalized ISO strings.
 *
 * Supported inputs:
 * - args.from, args.to (ISO strings)
 * - args.range: "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" |
 *              "this_year" | "last_year" | "last_7_days" | "last_30_days" | "last_90_days"
 * - args.months_back: number (for monthly seasonal views, e.g. 12)
 *
 * Timezone: Asia/Kolkata (matches your users)
 * Default: last_30_days
 */
function toIsoRange(args = {}, opts = {}) {
  const zone = opts.zone || "Asia/Kolkata";
  const now = opts.now ? DateTime.fromJSDate(opts.now, { zone }) : DateTime.now().setZone(zone);

  if (args.from && args.to) {
    const from = DateTime.fromISO(String(args.from), { zone }).toUTC();
    const to = DateTime.fromISO(String(args.to), { zone }).toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  const range = String(args.range || "last_30_days").trim();

  // day ranges
  if (range === "today") {
    const from = now.startOf("day").toUTC();
    const to = now.plus({ days: 1 }).startOf("day").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  if (range === "yesterday") {
    const from = now.minus({ days: 1 }).startOf("day").toUTC();
    const to = now.startOf("day").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  // week ranges (Mon-Sun)
  if (range === "this_week") {
    const from = now.startOf("week").toUTC();
    const to = now.endOf("week").plus({ milliseconds: 1 }).toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }
  if (range === "last_week") {
    const from = now.minus({ weeks: 1 }).startOf("week").toUTC();
    const to = now.startOf("week").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  // month ranges
  if (range === "this_month") {
    const from = now.startOf("month").toUTC();
    const to = now.plus({ months: 1 }).startOf("month").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }
  if (range === "last_month") {
    const from = now.minus({ months: 1 }).startOf("month").toUTC();
    const to = now.startOf("month").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  // year ranges
  if (range === "this_year") {
    const from = now.startOf("year").toUTC();
    const to = now.plus({ years: 1 }).startOf("year").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }
  if (range === "last_year") {
    const from = now.minus({ years: 1 }).startOf("year").toUTC();
    const to = now.startOf("year").toUTC();
    return { from: from.toISO(), to: to.toISO() };
  }

  // rolling windows
  const days =
    range === "last_7_days" ? 7 :
    range === "last_90_days" ? 90 :
    30;

  const from = now.minus({ days }).toUTC();
  const to = now.toUTC();
  return { from: from.toISO(), to: to.toISO() };
}

function nowContext(opts = {}) {
  const zone = opts.zone || "Asia/Kolkata";
  const now = opts.now ? DateTime.fromJSDate(opts.now, { zone }) : DateTime.now().setZone(zone);
  return {
    zone,
    now_local_iso: now.toISO(),
    today_local: now.toFormat("yyyy-LL-dd"),
    now_utc_iso: now.toUTC().toISO(),
  };
}

module.exports = { toIsoRange, nowContext };
