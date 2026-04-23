// Reset + seed a Neon PostgreSQL database from seed-neon.sql
//
// Usage (PowerShell):
//   cd server
//   $env:DATABASE_URL="<neon-url>"
//   node src/db/reset-neon.js
//
// Usage (one-line PowerShell):
//   $env:DATABASE_URL="postgresql://..." ; node src/db/reset-neon.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL env var is required');
  console.error('');
  console.error('PowerShell:');
  console.error('  $env:DATABASE_URL="postgresql://..."; node src/db/reset-neon.js');
  console.error('');
  console.error('bash/zsh:');
  console.error('  DATABASE_URL="postgresql://..." node src/db/reset-neon.js');
  process.exit(1);
}

const seedPath = path.join(__dirname, 'seed-neon.sql');
const sql = fs.readFileSync(seedPath, 'utf-8');

const { Pool } = pg;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log('🔄 Connecting to Neon…');

try {
  // pg splits by ; internally; we send the whole SQL as a single query string
  const res = await pool.query(sql);
  console.log('✅ Seed complete');
  // Last command in seed-neon.sql is a SELECT showing operating hours — print its rows if present
  const last = Array.isArray(res) ? res[res.length - 1] : res;
  if (last?.rows?.length) {
    console.log('');
    console.log('📋 Operating hours:');
    console.table(last.rows);
  }
} catch (err) {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
