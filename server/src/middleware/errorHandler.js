export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

  // Custom status errors
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'This record already exists' });
  }
  if (err.code?.startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ error: 'Data constraint violation' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
