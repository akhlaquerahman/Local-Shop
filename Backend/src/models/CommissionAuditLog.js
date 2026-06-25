const mongoose = require('mongoose');

const commissionAuditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  reason: { type: String, required: true },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CommissionAuditLog', commissionAuditLogSchema);
