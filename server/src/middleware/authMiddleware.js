const User = require('../models/User');
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

// Loads (or creates) the Mongo user and attaches it to req.user.
// Must run after authenticate (needs req.auth.payload).
async function loadUser(req, res, next) {
  try {
    const payload = req.auth.payload;
    req.user = await User.findOrCreateByAuth0(payload.sub, payload);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate, loadUser };