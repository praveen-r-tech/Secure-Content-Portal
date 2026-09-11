const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    // Derived from the uploaded file - never trusted from the client.
    type: { type: String, enum: ['video', 'pdf', 'html'], required: true },
    storagePublicId: { type: String, required: true },
    // Stored for the backend's own use only - never returned to clients.
    storageUrl: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Public shape of a content item (no storage public id / url).
contentSchema.methods.toJson = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    type: this.type,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Content', contentSchema);