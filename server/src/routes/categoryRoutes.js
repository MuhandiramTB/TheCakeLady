import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// GET /api/v1/categories — public (only active)
router.get('/', async (req, res, next) => {
  try {
    const all = req.query.all === 'true';
    const sql = all
      ? 'SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories ORDER BY display_order, name'
      : 'SELECT id, name, display_order as displayOrder FROM categories WHERE is_active = 1 ORDER BY display_order, name';
    const rows = await db.prepare(sql).all();
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// POST /api/v1/categories — admin
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, displayOrder = 0, isActive = 1 } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await db.prepare(
      'INSERT INTO categories (name, display_order, is_active) VALUES (?, ?, ?)'
    ).run(name, displayOrder, isActive ? 1 : 0);
    const row = await db.prepare('SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: row });
  } catch (err) { next(err); }
});

// PUT /api/v1/categories/:id — admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const existing = await db.prepare('SELECT id, name, display_order, is_active FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const name = req.body.name ?? existing.name;
    const displayOrder = req.body.displayOrder ?? existing.display_order;
    const isActive = req.body.isActive !== undefined ? (req.body.isActive ? 1 : 0) : existing.is_active;
    await db.prepare('UPDATE categories SET name = ?, display_order = ?, is_active = ? WHERE id = ?').run(name, displayOrder, isActive, req.params.id);
    const row = await db.prepare('SELECT id, name, display_order as displayOrder, is_active as isActive FROM categories WHERE id = ?').get(req.params.id);
    res.json({ data: row });
  } catch (err) { next(err); }
});

// DELETE /api/v1/categories/:id — admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const hasProducts = await db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(req.params.id);
    if (hasProducts.c > 0) return res.status(400).json({ error: 'Cannot delete category with products. Deactivate or move products first.' });
    await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ data: { message: 'Category deleted' } });
  } catch (err) { next(err); }
});

export default router;
