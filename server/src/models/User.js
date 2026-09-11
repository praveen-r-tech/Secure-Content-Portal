const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);