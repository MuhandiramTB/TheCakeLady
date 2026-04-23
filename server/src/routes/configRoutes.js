import { Router } from 'express';
import { SALON_NAME, SALON_LOGO_URL, PRIMARY_COLOR, SECONDARY_COLOR } from '../config.js';
import db from '../db/database.js';

const router = Router();

// GET /api/v1/config/branding — public (prefers DB store_info, falls back to env)
router.get('/branding', async (req, res) => {
  let storeName = SALON_NAME;
  let logoUrl = SALON_LOGO_URL;
  try {
    const row = await db.prepare('SELECT store_name as storeName, logo_url as logoUrl FROM store_info WHERE id = 1').get();
    if (row?.storeName) storeName = row.storeName;
    if (row?.logoUrl) logoUrl = row.logoUrl;
  } catch { /* table not yet migrated */ }
  res.json({
    data: {
      storeName,
      salonName: storeName, // shared UI components still read `salonName`
      logoUrl,
      primaryColor: PRIMARY_COLOR,
      secondaryColor: SECONDARY_COLOR,
    },
  });
});

export default router;
