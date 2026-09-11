const { jwtCheck } = require('../config/auth0');

// Wraps the raw JWT validator so failed authentication becomes a clean
// JSON 401 response instead of falling through to the error handler.
function authenticate(req, res, next) {
  jwtCheck(req, res, (err) => {
    if (err) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  });
}

module.exports = { authenticate };