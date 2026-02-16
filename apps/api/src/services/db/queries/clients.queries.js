const TOP_CLIENTS_BY_REVENUE_SQL = `
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    COALESCE(SUM(o.total_amount), 0)::numeric AS revenue,
    COUNT(*)::int AS orders_count
  FROM orders o
  JOIN clients c ON c.id = o.client_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CLOSED')
  GROUP BY c.id, c.name
  ORDER BY revenue DESC
  LIMIT $3
`;

module.exports = { TOP_CLIENTS_BY_REVENUE_SQL };
