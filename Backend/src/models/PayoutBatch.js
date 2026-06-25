const mongoose = require('mongoose');

const payoutBatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  runDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 },
  totalAccounts: { type: Number, default: 0 },
  status: { type: String, enum: ['GENERATED', 'APPROVED', 'PAID', 'FAILED'], default: 'GENERATED' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PayoutBatch', payoutBatchSchema);
