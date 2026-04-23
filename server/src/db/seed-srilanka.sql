-- ============================================
-- TheCakeLady — Sri Lanka Home Bakery Seed
-- Paste into Neon SQL Editor and Run
--
-- Deletes ALL data from orders/products/categories (keeps users untouched).
-- Reseeds with Sri Lankan home-baker cakes (Love Cake, Ribbon Cake, etc.)
-- Prices in LKR. Images use stable Unsplash CDN URLs — replace with
-- your own photos via Admin → Products → Edit once you have real ones.
-- ============================================

-- 1. Clean in FK-safe order (keep users!)
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;

ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, display_order, is_active) VALUES
  ('Traditional Sri Lankan', 1, 1),
  ('Birthday Cakes', 2, 1),
  ('Wedding & Anniversary', 3, 1),
  ('Cupcakes & Bites', 4, 1),
  ('Custom Designs', 5, 1);

-- ============================================
-- PRODUCTS — Sri Lankan home-baker menu
-- Image URLs are stable Unsplash CDN links (free CC0).
-- Replace with your own photos anytime via admin panel.
-- ============================================

-- TRADITIONAL SRI LANKAN (category_id = 1)
INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (1, 'Love Cake',
   'The Sri Lankan classic — rich semolina cake with cashews, pumpkin preserve, honey, cardamom and rose essence. A home-baker favourite for weddings and tea parties.',
   'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=600&q=80',
   3500, '1lb,2lb', 'Classic Love Cake,Extra Cashew,Less Sweet', 1, 1),

  (1, 'Ribbon Cake',
   'Layered pink, yellow and white sponge — the bake-sale favourite. Soft, light, and perfect with tea.',
   'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
   2200, '1lb,2lb,1kg', 'Vanilla,Strawberry,Butterscotch', 1, 1),

  (1, 'Breudher (Dutch Burgher Cake)',
   'Traditional Dutch Burgher yeast cake with raisins. Rich, buttery, slightly sweet — best with Edam cheese.',
   'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=600&q=80',
   3000, '1lb,2lb', 'Classic,Extra Raisin', 1, 0),

  (1, 'Butter Cake',
   'Home-style butter cake — fluffy, moist, perfect for every occasion. Made with real butter.',
   'https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&w=600&q=80',
   1800, '1lb,2lb,1kg,2kg', 'Plain Butter,Vanilla,Coffee', 1, 0),

  (1, 'Rich Fruit Cake',
   'Traditional rich fruit cake with cashews, raisins, dates, candied peel and a splash of brandy. Ideal for Christmas and weddings.',
   'https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&w=600&q=80',
   4500, '1lb,2lb,1kg', 'Classic,With Brandy,Non-Alcoholic', 1, 0);

-- BIRTHDAY CAKES (category_id = 2)
INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (2, 'Chocolate Fudge Cake',
   'Rich chocolate sponge layered with velvety fudge frosting. A classic birthday favourite.',
   'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
   2500, '0.5kg,1kg,2kg,3kg', 'Dark Chocolate,Milk Chocolate,White Chocolate', 1, 1),

  (2, 'Red Velvet',
   'Moist red velvet layers with cream cheese frosting. A head-turner at any party.',
   'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=600&q=80',
   2800, '0.5kg,1kg,2kg', 'Classic Cream Cheese,Extra Cream', 1, 1),

  (2, 'Vanilla Buttercream',
   'Light vanilla sponge with silky buttercream. Decorate with your choice of colours and theme.',
   'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
   2200, '0.5kg,1kg,2kg', 'Vanilla,Strawberry,Blueberry,Pineapple', 1, 0),

  (2, 'Kids Cartoon Cake',
   'Custom cartoon theme cake — tell us the character and we''ll bring it to life in edible art.',
   'https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=600&q=80',
   3500, '1kg,2kg,3kg', 'Vanilla,Chocolate,Mixed Fruit', 1, 1),

  (2, 'Black Forest',
   'German classic — chocolate sponge with fresh cream and cherries. Rich but light.',
   'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=600&q=80',
   2800, '1kg,2kg', 'Classic,Extra Cherry', 1, 0);

-- WEDDING & ANNIVERSARY (category_id = 3)
INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (3, 'Two-Tier Wedding Cake',
   'Elegant two-tier cake with your choice of flavor. Decorated with fresh or edible flowers. Contact us 1 week ahead for complex designs.',
   'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
   9500, '2kg,3kg,4kg', 'Vanilla,Almond,Chocolate,Red Velvet', 1, 1),

  (3, 'Anniversary Special',
   'Single-tier premium cake with piped roses and personalized message. Perfect for intimate celebrations.',
   'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
   4500, '1kg,2kg', 'Vanilla,Strawberry,Red Velvet,Chocolate', 1, 0),

  (3, 'Rich Wedding Fruit Cake',
   'Traditional rich fruit cake iced with royal icing — the classic Sri Lankan wedding centerpiece.',
   'https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&w=600&q=80',
   6500, '2kg,3kg,5kg', 'Classic Rich Fruit,Extra Cashew', 1, 0);

-- CUPCAKES & BITES (category_id = 4)
INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (4, 'Assorted Cupcake Box',
   'Box of freshly baked cupcakes — mix-and-match flavors. Perfect for office parties or small gatherings.',
   'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
   1500, '6 pieces,12 pieces,24 pieces', 'Chocolate,Vanilla,Red Velvet,Lemon,Salted Caramel', 1, 1),

  (4, 'Chocolate Chip Cookies',
   'Home-baked cookies with Belgian chocolate chips. Soft in the middle, crisp at the edges.',
   'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
   1000, '12 pieces,24 pieces', 'Classic,Double Chocolate,Oatmeal Raisin', 1, 0),

  (4, 'Brownie Box',
   'Fudgy chocolate brownies with walnuts. A tea-time must-have.',
   'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
   1200, '6 pieces,12 pieces', 'Classic,Nutty,Triple Chocolate', 1, 0);

-- CUSTOM DESIGNS (category_id = 5)
INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured) VALUES
  (5, 'Edible Photo Cake',
   'We print your favourite photo on an edible sheet over a buttercream cake — perfect for birthdays and retirements.',
   'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&q=80',
   3800, '1kg,2kg,3kg', 'Vanilla,Chocolate,Butterscotch', 1, 1),

  (5, 'Fondant Theme Cake',
   'Fully custom fondant cake — tell us your theme (sports, movie, hobby) and we''ll design it. WhatsApp us a reference photo first.',
   'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80',
   4500, '1kg,2kg,3kg', 'Vanilla,Chocolate,Red Velvet,Mixed Fruit', 1, 0),

  (5, 'Number/Letter Cake',
   'Cut-out number or letter cake topped with fresh cream and decorations — trending for birthdays and anniversaries.',
   'https://images.unsplash.com/photo-1586985289906-406988974504?auto=format&fit=crop&w=600&q=80',
   3500, '1 digit,2 digits,3 digits', 'Vanilla,Chocolate,Strawberry', 1, 0);

-- ============================================
-- STORE INFO — Sri Lankan placeholder defaults
-- (Edit from Admin → Store Info after first login)
-- ============================================
INSERT INTO store_info (
  id, store_name, owner_name, phone, whatsapp, email, address,
  lead_time_days, delivery_enabled, pickup_enabled, order_note
) VALUES (
  1, 'TheCakeLady', '', '', '', '', '',
  2, 1, 1,
  'Please place orders at least 2 days in advance. For custom designs, please WhatsApp us a reference photo first.'
)
ON CONFLICT (id) DO UPDATE SET
  order_note = EXCLUDED.order_note
WHERE store_info.order_note = '' OR store_info.order_note IS NULL;

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Categories:' as label, COUNT(*)::text as count FROM categories
UNION ALL SELECT 'Products:', COUNT(*)::text FROM products
UNION ALL SELECT 'Featured products:', COUNT(*)::text FROM products WHERE is_featured = 1
UNION ALL SELECT 'Orders (should be 0):', COUNT(*)::text FROM orders
UNION ALL SELECT 'Users (untouched):', COUNT(*)::text FROM users;

-- Quick peek at products by category
SELECT c.name as category, p.name as cake, p.base_price as "Rs.", p.is_featured as featured
FROM products p JOIN categories c ON p.category_id = c.id
ORDER BY c.display_order, p.is_featured DESC, p.id;
