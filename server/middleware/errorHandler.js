// Centralized error handler - keeps controllers free of repetitive try/catch noise
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }
  if (err.sqlMessage && err.sqlMessage.includes('CONSTRAINT')) {
    return res.status(400).json({ message: 'Data violates a database constraint.', detail: err.sqlMessage });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
