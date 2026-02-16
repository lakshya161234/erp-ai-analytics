-- Minimal demo schema for ERP analytics PoC
-- Designed for read-only analytics queries.
-- You can adapt these tables to match your real ERP schema later.

CREATE TABLE IF NOT EXISTS clients (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  sku         TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS factories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional materials/BOM for "material usage" analytics
CREATE TABLE IF NOT EXISTS materials (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  uom         TEXT NOT NULL DEFAULT 'kg',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bill of materials: how much of a material is used per 1 unit of product
CREATE TABLE IF NOT EXISTS product_bom (
  id              SERIAL PRIMARY KEY,
  product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id     INT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  qty_per_unit    NUMERIC(12,4) NOT NULL DEFAULT 0,
  UNIQUE(product_id, material_id)
);

-- Keep status values aligned with your ERP if needed
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  client_id    INT NOT NULL REFERENCES clients(id),
  factory_id   INT NOT NULL REFERENCES factories(id),
  status       TEXT NOT NULL DEFAULT 'CONFIRMED',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  qty        NUMERIC(12,2) NOT NULL DEFAULT 0,
  price      NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_factory_id ON orders(factory_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
