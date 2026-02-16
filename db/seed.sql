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
    INSERT INTO orders (client_id, status, total_amount, created_at)
    VALUES (
      cid,
      'CONFIRMED',
      (200 + random()*2500)::numeric(12,2),
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
  END LOOP;
END $$;
