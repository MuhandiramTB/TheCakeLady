// Serverless-ready app initializer for Vercel
// Caches migrations/seed across warm invocations, retries on failure
import app from './app.js';
import { runMigrations } from './db/migrate.js';
import { seedAdmin } from './db/seed.js';
import { seedDemoData } from './db/seed-demo-fn.js';
import db from './db/database.js';

let initialized = false;
let initPromise = null;

async function initialize() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[init] Starting database initialization...');
      console.log('[init] DATABASE_URL set:', !!process.env.DATABASE_URL);
      console.log('[init] SEED_DEMO:', process.env.SEED_DEMO);

      await runMigrations();
      console.log('[init] Migrations applied successfully');

      await seedAdmin();
      console.log('[init] Admin seed complete');

      if (process.env.SEED_DEMO === 'true') {
        const existing = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
        console.log('[init] Existing categories count:', existing.c);

        if (existing.c === 0) {
          console.log('[init] Seeding demo data...');
          await seedDemoData();
          console.log('[init] Demo data seeded successfully');
        } else {
          console.log('[init] Demo data already exists, skipping');
        }
      }

      initialized = true;
      console.log('[init] Initialization complete');
    } catch (err) {
      console.error('[init] FAILED:', err.message);
      console.error(err.stack);
      // Reset so next request retries
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export default async function handler(req, res) {
  try {
    await initialize();
  } catch (err) {
    console.error('Handler init failed:', err);
    return res.status(500).json({
      error: 'Server initialization failed',
      details: process.env.NODE_ENV === 'production' ? err.message : err.stack,
    });
  }
  return app(req, res);
}
