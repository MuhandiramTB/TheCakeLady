import db from './database.js';
import { PG_MIGRATIONS, SQLITE_MIGRATIONS } from './migrations-data.js';

export async function runMigrations() {
  if (db.isPostgres) {
    await db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  } else {
    await db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
  }

  const appliedRows = await db.prepare('SELECT name FROM _migrations').all();
  const applied = new Set(appliedRows.map((r) => r.name));

  const migrations = db.isPostgres ? PG_MIGRATIONS : SQLITE_MIGRATIONS;

  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    await db.exec(m.sql);
    await db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(m.name);
    console.log(`Applied migration: ${m.name}`);
  }
}
