const mongoose = require('mongoose');

const accountSuspensionSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  suspendedAt: { type: Date, default: Date.now },
  suspendedUntil: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['ACTIVE', 'LIFTED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('AccountSuspension', accountSuspensionSchema);
