// Historical orders + line totals

const ORDERS_HISTORY_SQL = `
  SELECT
    o.id AS order_id,
    o.created_at,
    o.status,
    o.total_amount,
    o.factory_id,
    f.name AS factory_name,
    c.id AS client_id,
    c.name AS client_name
  FROM orders o
  JOIN clients c ON c.id = o.client_id
  JOIN factories f ON f.id = o.factory_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND ($4::int IS NULL OR o.client_id = $4::int)
  ORDER BY o.created_at DESC
  LIMIT $5
`;

const ORDER_ITEMS_FOR_ORDER_SQL = `
  SELECT
    oi.id AS order_item_id,
    oi.product_id,
    p.name AS product_name,
    oi.qty,
    oi.price,
    (oi.qty * oi.price)::numeric AS line_total
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = $1
  ORDER BY oi.id ASC
`;

module.exports = { ORDERS_HISTORY_SQL, ORDER_ITEMS_FOR_ORDER_SQL };
