const mongoose = require('mongoose');

// Admin email list configured via environment variables.
// Any user whose Google email is in ADMIN_EMAILS receives the admin role.
// Any other Google account strictly defaults to viewer.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, trim: true },
    name: { type: String, default: '' },
    role: { type: String, enum: ['viewer', 'admin'], default: 'viewer' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || '').trim().toLowerCase());
}

// Finds the user for a Google account or creates it (role viewer by default).
// Used by /api/users/me and by loadUser on every protected route.
userSchema.statics.findOrCreateByGoogle = async function (profile = {}) {
  const googleId = profile.sub;
  let user = await this.findOne({ googleId });

  if (!user) {
    user = await this.create({
      googleId,
      email: (profile.email || '').toLowerCase(),
      name: profile.name || '',
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
    googleId: this.googleId,
    email: this.email,
    name: this.name,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);