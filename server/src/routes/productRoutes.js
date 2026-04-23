import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const SELECT_BASE = `
  SELECT p.id, p.category_id as categoryId, p.name, p.description,
         p.image_url as imageUrl, p.base_price as basePrice,
         p.size_options as sizeOptions, p.flavor_options as flavorOptions,
         p.is_active as isActive, p.is_featured as isFeatured,
         c.name as categoryName
  FROM products p
  JOIN categories c ON p.category_id = c.id
`;

// GET /api/v1/products — public (active by default; ?all=true for admin)
router.get('/', async (req, res, next) => {
  try {
    const all = req.query.all === 'true';
    const featured = req.query.featured === 'true';
    const categoryId = req.query.category_id;
    let sql = SELECT_BASE;
    const where = [];
    const params = [];
    if (!all) where.push('p.is_active = 1');
    if (featured) where.push('p.is_featured = 1');
    if (categoryId) { where.push('p.category_id = ?'); params.push(categoryId); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY p.is_featured DESC, p.id DESC';
    const rows = await db.prepare(sql).all(...params);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// GET /api/v1/products/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.prepare(SELECT_BASE + ' WHERE p.id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: row });
  } catch (err) { next(err); }
});

// POST /api/v1/products — admin
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      categoryId, name, description = '', imageUrl = '',
      basePrice, sizeOptions = '', flavorOptions = '',
      isActive = 1, isFeatured = 0,
    } = req.body;
    if (!categoryId || !name || basePrice === undefined) {
      return res.status(400).json({ error: 'categoryId, name, basePrice are required' });
    }
    const result = await db.prepare(
      `INSERT INTO products (category_id, name, description, image_url, base_price, size_options, flavor_options, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(Number(categoryId), name, description, imageUrl, Number(basePrice), sizeOptions, flavorOptions, isActive ? 1 : 0, isFeatured ? 1 : 0);
    const row = await db.prepare(SELECT_BASE + ' WHERE p.id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: row });
  } catch (err) { next(err); }
});

// PUT /api/v1/products/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const existing = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const b = req.body;
    const categoryId = b.categoryId ?? existing.category_id;
    const name = b.name ?? existing.name;
    const description = b.description ?? existing.description;
    const imageUrl = b.imageUrl ?? existing.image_url;
    const basePrice = b.basePrice ?? existing.base_price;
    const sizeOptions = b.sizeOptions ?? existing.size_options;
    const flavorOptions = b.flavorOptions ?? existing.flavor_options;
    const isActive = b.isActive !== undefined ? (b.isActive ? 1 : 0) : existing.is_active;
    const isFeatured = b.isFeatured !== undefined ? (b.isFeatured ? 1 : 0) : existing.is_featured;
    await db.prepare(
      `UPDATE products SET category_id = ?, name = ?, description = ?, image_url = ?,
         base_price = ?, size_options = ?, flavor_options = ?, is_active = ?, is_featured = ?
       WHERE id = ?`
    ).run(Number(categoryId), name, description, imageUrl, Number(basePrice), sizeOptions, flavorOptions, isActive, isFeatured, req.params.id);
    const row = await db.prepare(SELECT_BASE + ' WHERE p.id = ?').get(req.params.id);
    res.json({ data: row });
  } catch (err) { next(err); }
});

// DELETE /api/v1/products/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const hasOrders = await db.prepare('SELECT COUNT(*) as c FROM orders WHERE product_id = ?').get(req.params.id);
    if (hasOrders.c > 0) return res.status(400).json({ error: 'Cannot delete product with existing orders. Deactivate instead.' });
    await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ data: { message: 'Product deleted' } });
  } catch (err) { next(err); }
});

export default router;
