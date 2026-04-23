# 🎂 TheCakeLady

Home-made cake ordering system. Customers browse cakes, customize size/flavor/message, place orders. Admin manages orders via dashboard + WhatsApp.

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind CSS v4
- **Backend:** Node.js + Express + Zod + JWT
- **Database:** SQLite (local dev) / PostgreSQL via Neon (production)
- **Hosting:** Vercel serverless

## Quick start

```bash
# Install deps
cd client && npm install
cd ../server && npm install

# Run dev servers (two terminals)
cd server && npm run dev     # http://localhost:3000
cd client && npm run dev     # http://localhost:5173
```

## Env vars

Create `.env` in `server/`:
```
JWT_SECRET=change-me-to-something-random-and-long
ADMIN_EMAIL=admin@thecakelady.com
ADMIN_PASSWORD=cakelady@123
SALON_NAME=TheCakeLady
# Leave DATABASE_URL empty for local SQLite, set for Neon PG in production
```

## Deploy

- Push to GitHub → connect repo to Vercel
- Set env vars in Vercel project settings (include `DATABASE_URL` for Neon)
- Auto-deploys on every push to main
