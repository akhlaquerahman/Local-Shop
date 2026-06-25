const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['shop', 'rider'], required: true },
  amount: { type: Number, required: true },
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'SETTLED', 'FAILED'], default: 'PENDING' },
  referenceNumber: { type: String },
  processedAt: { type: Date },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayoutBatch' },
  commissionBreakdown: {
    platformFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }
  },
  settlementPeriod: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payout', PayoutSchema);
