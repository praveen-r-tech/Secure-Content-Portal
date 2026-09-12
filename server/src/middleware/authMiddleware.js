const User = require('../models/User');
const { verifyGoogleToken } = require('../config/googleAuth');

// Verifies the Google ID token sent by the frontend and attaches the
// decoded payload to req.googleUser. The token is sent in the
// `Authorization: Bearer <token>` header.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = await verifyGoogleToken(token);
    req.googleUser = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication required' });
  }
}

// Loads (or creates) the Mongo user and attaches it to req.user.
// Must run after authenticate (needs req.googleUser).
async function loadUser(req, res, next) {
  try {
    const payload = req.googleUser;
    const profile = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || '',
    };
    req.user = await User.findOrCreateByGoogle(profile);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate, loadUser };