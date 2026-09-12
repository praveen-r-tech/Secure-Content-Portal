const User = require('../models/User');

// GET /api/users/me - returns the Mongo user, creating it on first login.
// The authenticate middleware has already verified the Google ID token and
// attached the decoded payload to req.googleUser.
async function getCurrentUser(req, res, next) {
  try {
    const payload = req.googleUser;
    const profile = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || '',
    };
    const user = await User.findOrCreateByGoogle(profile);
    res.status(200).json({ user: user.toJson() });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCurrentUser };