import db from './database.js';

// Seed demo cake products if the database is empty.
export async function seedDemoData() {
  const existing = await db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (existing.c > 0) return { skipped: true, reason: 'products already exist' };

  // Categories
  await db.prepare('INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)').run('Birthday Cakes', 1);
  await db.prepare('INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)').run('Wedding & Anniversary', 2);
  await db.prepare('INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)').run('Cupcakes & Cookies', 3);
  await db.prepare('INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, 1)').run('Custom Designs', 4);

  const birthday = 1, wedding = 2, cupcakes = 3, custom = 4;

  const products = [
    [birthday, 'Classic Chocolate', 'Rich chocolate sponge with chocolate ganache', 2500, '0.5kg,1kg,2kg', 'Dark Chocolate,Milk Chocolate,White Chocolate', 1],
    [birthday, 'Vanilla Buttercream', 'Fluffy vanilla sponge with buttercream frosting', 2200, '0.5kg,1kg,2kg', 'Vanilla,Strawberry,Blueberry', 1],
    [birthday, 'Red Velvet Dream', 'Moist red velvet with cream cheese frosting', 2800, '0.5kg,1kg,2kg', 'Classic,Extra Cream', 1],
    [birthday, 'Rainbow Unicorn', 'Layered rainbow sponge — a kids favourite', 3200, '1kg,2kg', 'Vanilla,Mixed Fruit', 0],
    [wedding, 'Elegant Two-Tier', 'Two-tier vanilla cake with fresh flowers', 8500, '2kg,3kg,4kg', 'Vanilla,Almond,Lemon', 1],
    [wedding, 'Anniversary Rose', 'Single-tier with piped roses', 4500, '1kg,2kg', 'Vanilla,Strawberry,Red Velvet', 0],
    [cupcakes, 'Cupcake Box (6)', 'Box of 6 assorted cupcakes', 1200, '6 pieces,12 pieces', 'Chocolate,Vanilla,Red Velvet,Lemon', 1],
    [cupcakes, 'Chocolate Chip Cookies', 'Freshly baked cookies — 12 pieces', 800, '12 pieces,24 pieces', 'Classic,Double Chocolate', 0],
    [custom, 'Photo Cake', 'Edible-print photo on a buttercream cake', 3500, '1kg,2kg', 'Vanilla,Chocolate', 1],
    [custom, 'Theme Cake (Custom)', 'Tell us your theme — contact us first', 4000, '1kg,2kg,3kg', 'Vanilla,Chocolate,Red Velvet', 0],
  ];

  for (const [catId, name, desc, price, sizes, flavors, featured] of products) {
    await db.prepare(
      'INSERT INTO products (category_id, name, description, base_price, size_options, flavor_options, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
    ).run(catId, name, desc, price, sizes, flavors, featured);
  }

  console.log('Seeded demo cake data');
  return { seeded: true };
}
