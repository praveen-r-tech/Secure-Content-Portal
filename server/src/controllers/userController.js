const User = require('../models/User');

// Comma-separated emails granted the admin role, e.g. "a@x.com,b@x.com".
// Simple admin elevation mechanism - no invitation system.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

async function getCurrentUser(req, res, next) {
  try {
    const profile = await getAuth0Profile(req.auth.token, req.auth.payload);
    const auth0Id = profile.sub;
    const email = (profile.email || '').toLowerCase();
    const name = profile.name || profile.nickname || '';

    let user = await User.findOne({ auth0Id });

    if (!user) {
      // New users always start as viewers.
      user = await User.create({ auth0Id, email, name, role: 'viewer' });
    }

    // Elevate a viewer whose email is now listed as an admin email.
    if (ADMIN_EMAILS.includes(email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    res.status(200).json({
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCurrentUser };