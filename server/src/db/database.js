import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { DB_PATH, DATABASE_URL } from '../config.js';

const { Pool } = pg;
const usePostgres = !!DATABASE_URL;

let db;

if (usePostgres) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  db = {
    isPostgres: true,
    prepare(sql) {
      let i = 0;
      let pgSql = sql.replace(/\?/g, () => `$${++i}`);
      // Auto-quote camelCase aliases so PostgreSQL preserves case
      // Matches: `as camelCase` or `AS camelCase` (with lowercase+uppercase mix)
      pgSql = pgSql.replace(/\b[aA][sS]\s+([a-z][a-z0-9]*[A-Z]\w*)/g, 'AS "$1"');
      return {
        async get(...params) {
          const res = await pool.query(pgSql, params);
          return res.rows[0];
        },
        async all(...params) {
          const res = await pool.query(pgSql, params);
          return res.rows;
        },
        async run(...params) {
          let finalSql = pgSql;
          if (/^\s*INSERT/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
            finalSql = pgSql.replace(/;?\s*$/, ' RETURNING id;');
          }
          const res = await pool.query(finalSql, params);
          return {
            lastInsertRowid: res.rows[0]?.id,
            changes: res.rowCount,
          };
        },
      };
    },
    async exec(sql) {
      await pool.query(sql);
    },
    pragma() {},
    transaction(fn) {
      return async (...args) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await fn(...args);
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      };
    },
  };
  console.log('Using PostgreSQL database');
} else {
  // SQLite for local dev only — lazy import to avoid build errors on Vercel
  const { default: Database } = await import('better-sqlite3');
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const sqliteDb = new Database(DB_PATH);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');

  db = {
    isPostgres: false,
    prepare(sql) {
      const stmt = sqliteDb.prepare(sql);
      return {
        get: (...params) => Promise.resolve(stmt.get(...params)),
        all: (...params) => Promise.resolve(stmt.all(...params)),
        run: (...params) => Promise.resolve(stmt.run(...params)),
      };
    },
    exec: (sql) => Promise.resolve(sqliteDb.exec(sql)),
    pragma: (...args) => sqliteDb.pragma(...args),
    transaction(fn) {
      const tx = sqliteDb.transaction(fn);
      return async (...args) => tx(...args);
    },
  };
  console.log('Using SQLite database (local dev)');
}

export default db;
