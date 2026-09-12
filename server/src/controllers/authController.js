const User = require('../models/User');
const { verifyGoogleToken } = require('../config/googleAuth');
const { signSessionToken, setSessionCookie, clearSessionCookie } = require('../utils/token');

// POST /api/auth/google - Authenticate using Google OAuth ID token
async function loginWithGoogle(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential token.' });
    }

    const payload = await verifyGoogleToken(credential);
    const profile = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || '',
    };

    const user = await User.findOrCreateByGoogle(profile);
    const token = signSessionToken(user);
    setSessionCookie(res, token);

    res.status(200).json({ user: user.toJson() });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(401).json({
      message: error.message ? `Google authentication failed: ${error.message}` : 'Invalid Google authentication token.',
    });
  }
}

// POST /api/auth/logout - Sign out and clear HttpOnly cookie
function logout(req, res) {
  clearSessionCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
}

// GET /api/auth/me - Return current user profile from HttpOnly session
function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  res.status(200).json({ user: req.user.toJson() });
}

module.exports = { loginWithGoogle, logout, getMe };
