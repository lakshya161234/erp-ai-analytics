const TOP_SOLD_PRODUCT_SQL = `
  WITH line_items AS (
    SELECT
      oi.product_id,
      SUM(oi.qty) AS total_qty
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= $1 AND o.created_at < $2
    GROUP BY oi.product_id
  )
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    li.total_qty
  FROM line_items li
  JOIN products p ON p.id = li.product_id
  ORDER BY li.total_qty DESC
  LIMIT $3
`;

module.exports = { TOP_SOLD_PRODUCT_SQL };
