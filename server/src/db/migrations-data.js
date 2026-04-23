// Migrations as JS strings (Vercel doesn't bundle .sql files)

export const PG_MIGRATIONS = [
  {
    name: '001-init.sql',
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT DEFAULT '',
  base_price INTEGER NOT NULL,
  size_options TEXT DEFAULT '',
  flavor_options TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  size TEXT DEFAULT '',
  flavor TEXT DEFAULT '',
  message_on_cake TEXT DEFAULT '',
  total_price INTEGER NOT NULL,
  delivery_date TEXT NOT NULL,
  delivery_time TEXT DEFAULT '',
  delivery_address TEXT DEFAULT '',
  delivery_type TEXT NOT NULL DEFAULT 'pickup' CHECK(delivery_type IN ('pickup', 'delivery')),
  customer_note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'baking', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`
  },
  {
    name: '002-store-info.sql',
    sql: `
CREATE TABLE IF NOT EXISTS store_info (
  id SERIAL PRIMARY KEY,
  store_name TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  owner_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  lead_time_days INTEGER DEFAULT 2,
  delivery_enabled INTEGER DEFAULT 1,
  pickup_enabled INTEGER DEFAULT 1,
  order_note TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO store_info (id, order_note)
SELECT 1, 'Please place orders at least 2 days in advance. For custom designs, contact us directly.'
WHERE NOT EXISTS (SELECT 1 FROM store_info WHERE id = 1);
`
  },
];

export const SQLITE_MIGRATIONS = [
  {
    name: '001-init.sql',
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT DEFAULT '',
  base_price INTEGER NOT NULL,
  size_options TEXT DEFAULT '',
  flavor_options TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  size TEXT DEFAULT '',
  flavor TEXT DEFAULT '',
  message_on_cake TEXT DEFAULT '',
  total_price INTEGER NOT NULL,
  delivery_date TEXT NOT NULL,
  delivery_time TEXT DEFAULT '',
  delivery_address TEXT DEFAULT '',
  delivery_type TEXT NOT NULL DEFAULT 'pickup' CHECK(delivery_type IN ('pickup', 'delivery')),
  customer_note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'baking', 'ready', 'delivered', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
`
  },
  {
    name: '002-store-info.sql',
    sql: `
CREATE TABLE IF NOT EXISTS store_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_name TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  owner_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  lead_time_days INTEGER DEFAULT 2,
  delivery_enabled INTEGER DEFAULT 1,
  pickup_enabled INTEGER DEFAULT 1,
  order_note TEXT DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO store_info (id, order_note)
VALUES (1, 'Please place orders at least 2 days in advance. For custom designs, contact us directly.');
`
  },
];
