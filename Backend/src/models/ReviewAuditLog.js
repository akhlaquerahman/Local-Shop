const mongoose = require('mongoose');

const reviewAuditLogSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['HIDDEN', 'APPROVED', 'DELETED', 'RESTORED', 'FLAGGED', 'SPAM_MARKED'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  ipAddress: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewAuditLog', reviewAuditLogSchema);
