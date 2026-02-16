const REVENUE_SUMMARY_SQL = `
  SELECT
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
`;

const REVENUE_BY_DAY_SQL = `
  SELECT
    DATE_TRUNC('day', o.created_at) AS day,
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  GROUP BY 1
  ORDER BY 1 ASC
`;

module.exports = { REVENUE_SUMMARY_SQL, REVENUE_BY_DAY_SQL };
