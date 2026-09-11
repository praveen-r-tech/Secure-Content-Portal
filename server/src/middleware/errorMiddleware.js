// 404 handler for unknown routes.
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Routes pass errors here with next(err).
// A generic message is returned for server errors so internals are not leaked.
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };