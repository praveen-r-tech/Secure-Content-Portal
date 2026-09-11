// 404 handler for unknown routes.
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Routes pass errors here with next(err).
// A generic message is returned for server errors so internals are not leaked.
function errorHandler(err, req, res, next) {
  console.error(err.stack || err);

  // Multer upload errors -> 400 with a clear message.
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds the allowed limit.'
        : 'Invalid file upload request.';
    return res.status(400).json({ message });
  }

  // Invalid Mongo ObjectId (e.g. /api/content/not-an-id) -> 404.
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Content not found.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };