const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secure-content-portal-session-secret-key-2026';
const COOKIE_NAME = 'session_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function signSessionToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifySessionToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

module.exports = {
  COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  setSessionCookie,
  clearSessionCookie,
};
