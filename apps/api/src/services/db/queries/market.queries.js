// Pricing / market patterns derived from order_items price data

const AVG_PRICE_BY_MONTH_SQL = `
  SELECT
    DATE_TRUNC('month', o.created_at) AS month,
    p.id AS product_id,
    p.name AS product_name,
    AVG(oi.price)::numeric(12,2) AS avg_unit_price,
    SUM(oi.qty)::numeric AS total_qty
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND ($4::int IS NULL OR p.id = $4::int)
  GROUP BY 1,2,3
  ORDER BY 1 ASC
`;

module.exports = { AVG_PRICE_BY_MONTH_SQL };
