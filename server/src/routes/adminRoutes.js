import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { hashPassword } from '../utils/passwordUtils.js';

const router = Router();

const ADMIN_ORDER_SELECT = `
  SELECT o.id, o.user_id as userId, o.product_id as productId,
         o.size, o.flavor, o.message_on_cake as messageOnCake,
         o.total_price as totalPrice, o.delivery_date as deliveryDate,
         o.delivery_time as deliveryTime, o.delivery_address as deliveryAddress,
         o.delivery_type as deliveryType, o.customer_note as customerNote,
         o.status, o.created_at as createdAt, o.updated_at as updatedAt,
         p.name as productName, p.image_url as productImage,
         u.name as customerName, u.email as customerEmail, u.phone as customerPhone
  FROM orders o
  JOIN products p ON o.product_id = p.id
  JOIN users u ON o.user_id = u.id
`;

// GET /api/v1/admin/stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const customers = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get()).count;
    const products = (await db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get()).count;
    const categories = (await db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_active = 1').get()).count;
    const total = (await db.prepare('SELECT COUNT(*) as count FROM orders').get()).count;
    const pending = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get()).count;
    const confirmed = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'").get()).count;
    const baking = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'baking'").get()).count;
    const delivered = (await db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'").get()).count;

    res.json({ data: { customers, categories, products, orders: { total, pending, confirmed, baking, delivered } } });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/orders — filters: status, deliveryDate
router.get('/orders', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { status, delivery_date } = req.query;
    let sql = ADMIN_ORDER_SELECT + ' WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND o.status = ?'; params.push(status); }
    if (delivery_date) { sql += ' AND o.delivery_date = ?'; params.push(delivery_date); }
    sql += ' ORDER BY o.delivery_date ASC, o.created_at DESC';
    const rows = await db.prepare(sql).all(...params);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/orders/:id — update order status
router.patch('/orders/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'baking', 'ready', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
    await db.prepare(`UPDATE orders SET status = ?, updated_at = ${nowFn} WHERE id = ?`).run(status, req.params.id);
    const updated = await db.prepare(ADMIN_ORDER_SELECT + ' WHERE o.id = ?').get(req.params.id);
    res.json({ data: updated });
  } catch (err) { next(err); }
});

// POST /api/v1/admin/orders — admin creates order (walk-in / phone)
router.post('/orders', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      customerName, customerPhone, productId, size = '', flavor = '',
      messageOnCake = '', totalPrice, deliveryDate, deliveryTime = '',
      deliveryAddress = '', deliveryType = 'pickup', customerNote = '',
      status = 'confirmed',
    } = req.body;
    if (!customerName || !customerPhone || !productId || !totalPrice || !deliveryDate) {
      return res.status(400).json({ error: 'Required: customerName, customerPhone, productId, totalPrice, deliveryDate' });
    }

    let customer = await db.prepare('SELECT id FROM users WHERE phone = ?').get(customerPhone);
    if (!customer) {
      const walkinEmail = `walkin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@walkin.local`;
      const passwordHash = await hashPassword(customerPhone);
      const r = await db.prepare("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')")
        .run(customerName, walkinEmail, customerPhone, passwordHash);
      customer = { id: r.lastInsertRowid };
    }

    const result = await db.prepare(
      `INSERT INTO orders (user_id, product_id, size, flavor, message_on_cake, total_price,
        delivery_date, delivery_time, delivery_address, delivery_type, customer_note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(customer.id, Number(productId), size, flavor, messageOnCake, Number(totalPrice),
          deliveryDate, deliveryTime, deliveryAddress, deliveryType, customerNote, status);

    const order = await db.prepare(ADMIN_ORDER_SELECT + ' WHERE o.id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: order });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/users — list customers
router.get('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const users = await db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at as createdAt,
             (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as orderCount,
             (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status = 'delivered') as deliveredCount
      FROM users u
      WHERE u.role = 'customer'
      ORDER BY u.created_at DESC
    `).all();
    res.json({ data: users });
  } catch (err) { next(err); }
});

// DELETE /api/v1/admin/users/:id
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin' });
    await db.prepare('DELETE FROM orders WHERE user_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ data: { message: 'User deleted' } });
  } catch (err) { next(err); }
});

export default router;
