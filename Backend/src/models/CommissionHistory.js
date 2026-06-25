const mongoose = require('mongoose');

const commissionHistorySchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CommissionHistory', commissionHistorySchema);
