const User = require('../models/User');

// Fetches the Auth0 profile (email/name) with the validated access token.
// Falls back to the JWT claims if userinfo fails (e.g. when a custom API
// audience is configured instead of the /userinfo audience).
async function getAuth0Profile(accessToken, payload) {
  try {
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) {
      throw new Error(`userinfo request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return payload;
  }
}

// GET /api/users/me - returns the Mongo user, creating it on first login.
async function getCurrentUser(req, res, next) {
  try {
    const profile = await getAuth0Profile(req.auth.token, req.auth.payload);
    const user = await User.findOrCreateByAuth0(profile.sub, profile);
    res.status(200).json({ user: user.toJson() });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCurrentUser };