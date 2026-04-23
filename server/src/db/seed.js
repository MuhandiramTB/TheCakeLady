import db from './database.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config.js';

export async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('No ADMIN_EMAIL/ADMIN_PASSWORD set — skipping admin seed');
    return;
  }

  const existing = await db.prepare('SELECT id FROM users WHERE email = ? AND role = ?').get(ADMIN_EMAIL, 'admin');
  if (existing) return;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  ).run('Admin', ADMIN_EMAIL, passwordHash, 'admin');

  console.log(`Admin user seeded: ${ADMIN_EMAIL}`);
}
