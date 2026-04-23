import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Fail fast if JWT_SECRET missing in production
if (isProduction && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

// Fail fast if admin credentials missing in production
if (isProduction && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  console.error('FATAL: ADMIN_EMAIL and ADMIN_PASSWORD required in production');
  process.exit(1);
}

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-never-use-in-prod';
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'sallon.db');
export const DATABASE_URL = process.env.DATABASE_URL || null;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const SALON_NAME = process.env.SALON_NAME || 'SallonArt';
export const SALON_LOGO_URL = process.env.SALON_LOGO_URL || '';
export const PRIMARY_COLOR = process.env.PRIMARY_COLOR || '#1e1e2e';
export const SECONDARY_COLOR = process.env.SECONDARY_COLOR || '#c9a96e';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
