// Seasonal / time-series patterns

const SALES_BY_MONTH_SQL = `
  SELECT
    DATE_TRUNC('month', o.created_at) AS month,
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  GROUP BY 1
  ORDER BY 1 ASC
`;

const PRODUCT_SALES_BY_MONTH_SQL = `
  SELECT
    DATE_TRUNC('month', o.created_at) AS month,
    p.id AS product_id,
    p.name AS product_name,
    SUM(oi.qty)::numeric AS total_qty,
    SUM(oi.qty * oi.price)::numeric AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND ($4::int IS NULL OR p.id = $4::int)
  GROUP BY 1,2,3
  ORDER BY 1 ASC, revenue DESC
`;

module.exports = { SALES_BY_MONTH_SQL, PRODUCT_SALES_BY_MONTH_SQL };
