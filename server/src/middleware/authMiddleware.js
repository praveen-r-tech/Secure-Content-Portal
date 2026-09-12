const User = require('../models/User');
const { verifyGoogleToken } = require('../config/googleAuth');
const { verifySessionToken, COOKIE_NAME } = require('../utils/token');

// Verifies either the HttpOnly session cookie or Bearer token
async function authenticate(req, res, next) {
  try {
    // 1. Check HttpOnly cookie first (secure standard)
    const cookieToken = req.cookies && req.cookies[COOKIE_NAME];
    if (cookieToken) {
      try {
        const decoded = verifySessionToken(cookieToken);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Invalid or expired cookie
      }
    }

    // 2. Check Authorization Bearer header
    const header = req.headers.authorization || '';
    const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (bearerToken) {
      try {
        const decoded = verifySessionToken(bearerToken);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Not a session token
      }

      // Fallback: direct Google ID token
      try {
        const payload = await verifyGoogleToken(bearerToken);
        req.googleUser = payload;
        return next();
      } catch (err) {
        // Invalid
      }
    }

    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication required' });
  }
}

// Ensures req.user is loaded.
async function loadUser(req, res, next) {
  try {
    if (req.user) {
      return next();
    }

    if (req.googleUser) {
      const payload = req.googleUser;
      const profile = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || '',
      };
      req.user = await User.findOrCreateByGoogle(profile);
      return next();
    }

    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate, loadUser };