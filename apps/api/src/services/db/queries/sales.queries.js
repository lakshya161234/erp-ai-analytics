const TOP_SOLD_PRODUCT_SQL = `
  WITH line_items AS (
    SELECT
      oi.product_id,
      SUM(oi.qty) AS total_qty,
      SUM(oi.qty * oi.price) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= $1 AND o.created_at < $2
      AND ($3::int IS NULL OR o.factory_id = $3::int)
    GROUP BY oi.product_id
  )
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    li.total_qty,
    li.revenue
  FROM line_items li
  JOIN products p ON p.id = li.product_id
  ORDER BY li.total_qty DESC
  LIMIT $4
`;

const TOP_PRODUCTS_BY_REVENUE_SQL = `
  WITH line_items AS (
    SELECT
      oi.product_id,
      SUM(oi.qty) AS total_qty,
      SUM(oi.qty * oi.price) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= $1 AND o.created_at < $2
      AND ($3::int IS NULL OR o.factory_id = $3::int)
    GROUP BY oi.product_id
  )
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    li.total_qty,
    li.revenue
  FROM line_items li
  JOIN products p ON p.id = li.product_id
  ORDER BY li.revenue DESC
  LIMIT $4
`;

module.exports = { TOP_SOLD_PRODUCT_SQL, TOP_PRODUCTS_BY_REVENUE_SQL };
