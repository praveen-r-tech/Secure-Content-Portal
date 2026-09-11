const mongoose = require('mongoose');

// Comma-separated emails granted the admin role, e.g. "a@x.com,b@x.com".
// Simple admin elevation mechanism - no invitation system.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const userSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, trim: true },
    name: { type: String, default: '' },
    // First login always creates a viewer. Admin is granted only via
    // the ADMIN_EMAILS list in server/.env.
    role: { type: String, enum: ['viewer', 'admin'], default: 'viewer' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || '').toLowerCase());
}

// Finds the user for an Auth0 account or creates it (role viewer by default).
// Used by /api/users/me and by loadUser on every protected route.
userSchema.statics.findOrCreateByAuth0 = async function (auth0Id, profile = {}) {
  let user = await this.findOne({ auth0Id });

  if (!user) {
    user = await this.create({
      auth0Id,
      email: (profile.email || '').toLowerCase(),
      name: profile.name || profile.nickname || '',
      role: isAdminEmail(profile.email) ? 'admin' : 'viewer',
    });
  }

  // Elevate a viewer whose email is now listed as an admin email.
  if (isAdminEmail(user.email || profile.email) && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }

  return user;
};

userSchema.methods.toJson = function () {
  return {
    id: this._id,
    auth0Id: this.auth0Id,
    email: this.email,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);