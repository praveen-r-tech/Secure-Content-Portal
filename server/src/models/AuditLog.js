const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['upload', 'edit', 'delete'],
      required: true,
    },
    performedBy: {
      email: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    targetTitle: { type: String, required: true },
    targetType: { type: String },
    details: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.methods.toJson = function () {
  return {
    id: this._id,
    action: this.action,
    performedBy: this.performedBy,
    targetTitle: this.targetTitle,
    targetType: this.targetType,
    details: this.details,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
