/**
 * Convert args that include a date range into normalized ISO strings.
 * Accepts:
 * - args.from, args.to (ISO strings)
 * - args.range = "last_month" | "last_30_days" | "this_month" (optional)
 *
 * Default: last_30_days
 */
function toIsoRange(args = {}) {
  const now = new Date();

  if (args.from && args.to) {
    return {
      from: new Date(args.from).toISOString(),
      to: new Date(args.to).toISOString(),
    };
  }

  const range = (args.range || "last_30_days").toString();

  if (range === "this_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { from: from.toISOString(), to: to.toISOString() };
  }

  if (range === "last_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return { from: from.toISOString(), to: to.toISOString() };
  }

  // last_30_days
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: now.toISOString() };
}

module.exports = { toIsoRange };
