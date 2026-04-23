-- ============================================
-- TheCakeLady — Seed Data
-- Paste into Neon SQL Editor to reset + seed
-- ============================================

DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;

ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;

INSERT INTO categories (name, display_order, is_active) VALUES
  ('Birthday Cakes', 1, 1),
  ('Wedding & Anniversary', 2, 1),
  ('Cupcakes & Cookies', 3, 1),
  ('Custom Designs', 4, 1);

INSERT INTO products (category_id, name, description, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (1, 'Classic Chocolate', 'Rich chocolate sponge with chocolate ganache', 2500, '0.5kg,1kg,2kg', 'Dark Chocolate,Milk Chocolate,White Chocolate', 1, 1),
  (1, 'Vanilla Buttercream', 'Fluffy vanilla sponge with buttercream frosting', 2200, '0.5kg,1kg,2kg', 'Vanilla,Strawberry,Blueberry', 1, 1),
  (1, 'Red Velvet Dream', 'Moist red velvet with cream cheese frosting', 2800, '0.5kg,1kg,2kg', 'Classic,Extra Cream', 1, 1),
  (1, 'Rainbow Unicorn', 'Layered rainbow sponge — a kids favourite', 3200, '1kg,2kg', 'Vanilla,Mixed Fruit', 1, 0),
  (2, 'Elegant Two-Tier', 'Two-tier vanilla cake with fresh flowers', 8500, '2kg,3kg,4kg', 'Vanilla,Almond,Lemon', 1, 1),
  (2, 'Anniversary Rose', 'Single-tier with piped roses', 4500, '1kg,2kg', 'Vanilla,Strawberry,Red Velvet', 1, 0),
  (3, 'Cupcake Box (6)', 'Box of 6 assorted cupcakes', 1200, '6 pieces,12 pieces', 'Chocolate,Vanilla,Red Velvet,Lemon', 1, 1),
  (3, 'Chocolate Chip Cookies', 'Freshly baked cookies — 12 pieces', 800, '12 pieces,24 pieces', 'Classic,Double Chocolate', 1, 0),
  (4, 'Photo Cake', 'Edible-print photo on a buttercream cake', 3500, '1kg,2kg', 'Vanilla,Chocolate', 1, 1),
  (4, 'Theme Cake (Custom)', 'Tell us your theme — contact us first', 4000, '1kg,2kg,3kg', 'Vanilla,Chocolate,Red Velvet', 1, 0);

-- Store info
INSERT INTO store_info (id, order_note)
VALUES (1, 'Please place orders at least 2 days in advance. For custom designs, contact us directly.')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Categories:' as label, COUNT(*)::text as count FROM categories
UNION ALL SELECT 'Products:', COUNT(*)::text FROM products
UNION ALL SELECT 'Orders (should be 0):', COUNT(*)::text FROM orders;
