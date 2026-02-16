// Customer behavior / purchase patterns

const CUSTOMER_REPEAT_STATS_SQL = `
  WITH base AS (
    SELECT
      o.client_id,
      MIN(o.created_at) AS first_order_at,
      MAX(o.created_at) AS last_order_at,
      COUNT(*)::int AS orders_count,
      COALESCE(SUM(o.total_amount),0)::numeric AS revenue
    FROM orders o
    WHERE o.created_at >= $1 AND o.created_at < $2
      AND ($3::int IS NULL OR o.factory_id = $3::int)
      AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
    GROUP BY o.client_id
  )
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    base.orders_count,
    base.revenue,
    base.first_order_at,
    base.last_order_at,
    CASE WHEN base.orders_count > 1
      THEN EXTRACT(EPOCH FROM (base.last_order_at - base.first_order_at)) / 86400 / (base.orders_count - 1)
      ELSE NULL
    END AS avg_days_between_orders
  FROM base
  JOIN clients c ON c.id = base.client_id
  ORDER BY base.revenue DESC
  LIMIT $4
`;

const CUSTOMER_PRODUCT_AFFINITY_SQL = `
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    p.id AS product_id,
    p.name AS product_name,
    SUM(oi.qty)::numeric AS total_qty,
    SUM(oi.qty * oi.price)::numeric AS revenue
  FROM orders o
  JOIN clients c ON c.id = o.client_id
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND ($4::int IS NULL OR c.id = $4::int)
  GROUP BY c.id, c.name, p.id, p.name
  ORDER BY revenue DESC
  LIMIT $5
`;

module.exports = { CUSTOMER_REPEAT_STATS_SQL, CUSTOMER_PRODUCT_AFFINITY_SQL };
