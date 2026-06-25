const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });
module.exports = mongoose.model('AuditLog', AuditLogSchema);
