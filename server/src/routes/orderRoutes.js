import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

const ORDER_SELECT = `
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

// POST /api/v1/orders — authenticated customer creates an order
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      productId, size = '', flavor = '', messageOnCake = '',
      totalPrice, deliveryDate, deliveryTime = '',
      deliveryAddress = '', deliveryType = 'pickup', customerNote = '',
    } = req.body;

    if (!productId || !totalPrice || !deliveryDate) {
      return res.status(400).json({ error: 'productId, totalPrice, deliveryDate are required' });
    }

    const product = await db.prepare('SELECT id FROM products WHERE id = ? AND is_active = 1').get(productId);
    if (!product) return res.status(400).json({ error: 'Product not found or inactive' });

    if (deliveryType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
    }

    const result = await db.prepare(
      `INSERT INTO orders (user_id, product_id, size, flavor, message_on_cake, total_price,
        delivery_date, delivery_time, delivery_address, delivery_type, customer_note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      req.user.id, Number(productId), size, flavor, messageOnCake, Number(totalPrice),
      deliveryDate, deliveryTime, deliveryAddress, deliveryType, customerNote
    );

    const order = await db.prepare(ORDER_SELECT + ' WHERE o.id = ?').get(result.lastInsertRowid);
    res.status(201).json({ data: order });
  } catch (err) { next(err); }
});

// GET /api/v1/orders/my — authenticated customer's own orders
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const rows = await db.prepare(ORDER_SELECT + ' WHERE o.user_id = ? ORDER BY o.created_at DESC')
      .all(req.user.id);
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// PATCH /api/v1/orders/:id/cancel — customer cancels own pending order
router.patch('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
    await db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = ${nowFn} WHERE id = ?`).run(req.params.id);
    res.json({ data: { message: 'Order cancelled' } });
  } catch (err) { next(err); }
});

export default router;
