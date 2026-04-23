import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const TOKEN_EXPIRY = '24h';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
