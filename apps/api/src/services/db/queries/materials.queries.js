// Material usage trends derived from product BOM x sold quantity

const MATERIAL_USAGE_BY_DAY_SQL = `
  SELECT
    DATE_TRUNC('day', o.created_at) AS day,
    m.id AS material_id,
    m.name AS material_name,
    m.uom,
    SUM(oi.qty * bom.qty_per_unit)::numeric AS used_qty
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_bom bom ON bom.product_id = oi.product_id
  JOIN materials m ON m.id = bom.material_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
    AND ($4::int IS NULL OR m.id = $4::int)
  GROUP BY 1,2,3,4
  ORDER BY 1 ASC, used_qty DESC
`;

const TOP_MATERIALS_USED_SQL = `
  SELECT
    m.id AS material_id,
    m.name AS material_name,
    m.uom,
    SUM(oi.qty * bom.qty_per_unit)::numeric AS used_qty
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN product_bom bom ON bom.product_id = oi.product_id
  JOIN materials m ON m.id = bom.material_id
  WHERE o.created_at >= $1 AND o.created_at < $2
    AND ($3::int IS NULL OR o.factory_id = $3::int)
  GROUP BY 1,2,3
  ORDER BY used_qty DESC
  LIMIT $4
`;

module.exports = { MATERIAL_USAGE_BY_DAY_SQL, TOP_MATERIALS_USED_SQL };
