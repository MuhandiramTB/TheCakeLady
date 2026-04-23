// Vercel serverless function entrypoint
// Routes all /api/* requests to our Express app
import handler from '../server/src/serverless.js';

export default handler;
