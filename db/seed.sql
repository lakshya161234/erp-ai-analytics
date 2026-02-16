-- Seed demo data (safe to re-run)
INSERT INTO clients (name, email, phone)
VALUES
  ('Aarav Traders', 'aarav@example.com', '+91-9000000001'),
  ('Bharat Wholesale', 'bharat@example.com', '+91-9000000002'),
  ('Citrine Retail', 'citrine@example.com', '+91-9000000003')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, sku)
VALUES
  ('Rock Salt 1kg', 'SALT-ROCK-1KG'),
  ('Turmeric Powder 200g', 'SPICE-TURM-200G'),
  ('Cumin Seeds 500g', 'SPICE-CUMIN-500G'),
  ('Himalayan Pink Salt 1kg', 'SALT-PINK-1KG')
ON CONFLICT DO NOTHING;

INSERT INTO factories (name, city)
VALUES
  ('Factory 1', 'Delhi'),
  ('Factory 2', 'Mumbai')
ON CONFLICT DO NOTHING;

INSERT INTO materials (name, uom)
VALUES
  ('Raw Salt', 'kg'),
  ('Turmeric', 'kg'),
  ('Cumin', 'kg'),
  ('Packaging', 'pcs')
ON CONFLICT DO NOTHING;

-- Simple BOM mapping for demo
-- (numbers are illustrative)
INSERT INTO product_bom (product_id, material_id, qty_per_unit)
VALUES
  (1, 1, 1.0000),  -- Rock Salt 1kg uses 1kg Raw Salt
  (1, 4, 1.0000),  -- + 1 package
  (2, 2, 0.2000),  -- Turmeric 200g uses 0.2kg Turmeric
  (2, 4, 1.0000),
  (3, 3, 0.5000),  -- Cumin 500g uses 0.5kg Cumin
  (3, 4, 1.0000),
  (4, 1, 1.0000),
  (4, 4, 1.0000)
ON CONFLICT DO NOTHING;

-- Create orders across recent days
DO $$
DECLARE
  i INT;
  cid INT;
  oid INT;
  pid INT;
BEGIN
  FOR i IN 1..60 LOOP
    cid := 1 + (random() * 2)::int; -- 1..3
    INSERT INTO orders (client_id, factory_id, status, total_amount, created_at)
    VALUES (
      cid,
      1 + (random() * 1)::int, -- 1..2
      'CONFIRMED',
      0,
      NOW() - (random()*60 || ' days')::interval
    ) RETURNING id INTO oid;

    -- 1-3 items each
    FOR pid IN 1..(1 + (random()*2)::int) LOOP
      INSERT INTO order_items (order_id, product_id, qty, price)
      VALUES (
        oid,
        1 + (random()*3)::int,
        (1 + random()*9)::numeric(12,2),
        (50 + random()*500)::numeric(12,2)
      );
    END LOOP;

    -- set order total based on items
    UPDATE orders o
    SET total_amount = COALESCE((
      SELECT SUM(oi.qty * oi.price) FROM order_items oi WHERE oi.order_id = o.id
    ), 0)
    WHERE o.id = oid;
  END LOOP;
END $$;
