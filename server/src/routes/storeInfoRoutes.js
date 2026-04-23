import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

const SELECT_SQL = `SELECT id,
  store_name as storeName,
  logo_url as logoUrl,
  owner_name as ownerName,
  phone, whatsapp, email, address,
  google_maps_url as googleMapsUrl,
  facebook_url as facebookUrl,
  instagram_url as instagramUrl,
  lead_time_days as leadTimeDays,
  delivery_enabled as deliveryEnabled,
  pickup_enabled as pickupEnabled,
  order_note as orderNote
FROM store_info WHERE id = 1`;

router.get('/', async (req, res, next) => {
  try {
    const info = await db.prepare(SELECT_SQL).get();
    res.json({ data: info || null });
  } catch (err) { next(err); }
});

router.put('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      storeName = '', logoUrl = '', ownerName = '',
      phone = '', whatsapp = '', email = '', address = '',
      googleMapsUrl = '', facebookUrl = '', instagramUrl = '',
      leadTimeDays = 2, deliveryEnabled = 1, pickupEnabled = 1,
      orderNote = '',
    } = req.body || {};
    const existing = await db.prepare('SELECT id FROM store_info WHERE id = 1').get();
    const nowFn = db.isPostgres ? 'NOW()' : "datetime('now')";
    if (existing) {
      await db.prepare(
        `UPDATE store_info SET
           store_name = ?, logo_url = ?, owner_name = ?,
           phone = ?, whatsapp = ?, email = ?, address = ?,
           google_maps_url = ?, facebook_url = ?, instagram_url = ?,
           lead_time_days = ?, delivery_enabled = ?, pickup_enabled = ?,
           order_note = ?, updated_at = ${nowFn}
         WHERE id = 1`
      ).run(storeName, logoUrl, ownerName, phone, whatsapp, email, address,
            googleMapsUrl, facebookUrl, instagramUrl,
            Number(leadTimeDays), deliveryEnabled ? 1 : 0, pickupEnabled ? 1 : 0, orderNote);
    } else {
      await db.prepare(
        `INSERT INTO store_info (id, store_name, logo_url, owner_name, phone, whatsapp, email, address, google_maps_url, facebook_url, instagram_url, lead_time_days, delivery_enabled, pickup_enabled, order_note)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(storeName, logoUrl, ownerName, phone, whatsapp, email, address,
            googleMapsUrl, facebookUrl, instagramUrl,
            Number(leadTimeDays), deliveryEnabled ? 1 : 0, pickupEnabled ? 1 : 0, orderNote);
    }
    const updated = await db.prepare(SELECT_SQL).get();
    res.json({ data: updated });
  } catch (err) { next(err); }
});

export default router;
