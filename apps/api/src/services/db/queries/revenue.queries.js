const REVENUE_SUMMARY_SQL = `
  SELECT
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
`;

const REVENUE_BY_DAY_SQL = `
  SELECT
    DATE_TRUNC('day', o.created_at) AS day,
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  GROUP BY 1
  ORDER BY 1 ASC
`;

const REVENUE_BY_WEEK_SQL = `
  SELECT
    DATE_TRUNC('week', o.created_at) AS week,
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  GROUP BY 1
  ORDER BY 1 ASC
`;

const REVENUE_COMPARE_PERIODS_SQL = `
  WITH a AS (
    SELECT COALESCE(SUM(o.total_amount),0)::numeric AS revenue, COUNT(*)::int AS orders_count
    FROM orders o
    WHERE o.created_at >= $1 AND o.created_at < $2
      AND ($5::int IS NULL OR o.factory_id = $5::int)
      AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  ),
  b AS (
    SELECT COALESCE(SUM(o.total_amount),0)::numeric AS revenue, COUNT(*)::int AS orders_count
    FROM orders o
    WHERE o.created_at >= $3 AND o.created_at < $4
      AND ($5::int IS NULL OR o.factory_id = $5::int)
      AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  )
  SELECT
    a.revenue AS revenue_a,
    b.revenue AS revenue_b,
    a.orders_count AS orders_a,
    b.orders_count AS orders_b
  FROM a, b
`;

module.exports = { REVENUE_SUMMARY_SQL, REVENUE_BY_DAY_SQL, REVENUE_BY_WEEK_SQL, REVENUE_COMPARE_PERIODS_SQL };
