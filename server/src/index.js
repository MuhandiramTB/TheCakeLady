import app from './app.js';
import { PORT } from './config.js';
import { runMigrations } from './db/migrate.js';
import { seedAdmin } from './db/seed.js';
import db from './db/database.js';

async function start() {
  try {
    await runMigrations();
    console.log('Database migrations completed');
    await seedAdmin();

    // Auto-seed demo data if production DB is empty (only on first deploy)
    if (process.env.SEED_DEMO === 'true') {
      const existing = await db.prepare('SELECT COUNT(*) as c FROM categories').get();
      if (existing.c === 0) {
        const { seedDemoData } = await import('./db/seed-demo-fn.js');
        await seedDemoData();
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();
