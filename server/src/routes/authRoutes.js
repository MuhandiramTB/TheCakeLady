import { Router } from 'express';
import db from '../db/database.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { signToken } from '../utils/tokenUtils.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/authSchemas.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.validatedBody;

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.prepare(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone || null, passwordHash, 'customer');

    const user = await db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ data: req.user });
});

// PUT /api/v1/auth/profile — update name/phone
router.put('/profile', authMiddleware, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, phone } = req.validatedBody;
    await db.prepare(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?'
    ).run(name ?? null, phone ?? null, req.user.id);

    const user = await db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/auth/password — change password
router.put('/password', authMiddleware, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHash = await hashPassword(newPassword);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
});

export default router;
