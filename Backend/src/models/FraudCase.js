const mongoose = require('mongoose');

const fraudCaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'], default: 'OPEN' },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  resolutionNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FraudCase', fraudCaseSchema);
