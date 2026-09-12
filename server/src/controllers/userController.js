const User = require('../models/User');

// GET /api/users/me - returns the authenticated user
async function getCurrentUser(req, res, next) {
  try {
    if (req.user) {
      return res.status(200).json({
        user: typeof req.user.toJson === 'function' ? req.user.toJson() : req.user,
      });
    }

    if (req.googleUser) {
      const payload = req.googleUser;
      const profile = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || '',
      };
      const user = await User.findOrCreateByGoogle(profile);
      return res.status(200).json({ user: user.toJson() });
    }

    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCurrentUser };