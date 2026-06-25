const mongoose = require('mongoose');

const settlementLedgerSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountType: { type: String, enum: ['SELLER', 'RIDER'], required: true },
  transactionType: { 
    type: String, 
    enum: ['CREDIT_REVENUE', 'DEBIT_COMMISSION', 'DEBIT_PENALTY', 'CREDIT_PAYOUT', 'ADJUSTMENT'],
    required: true 
  },
  amount: { type: Number, required: true },
  referenceId: { type: String }, // e.g., Order ID, Payout ID
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SettlementLedger', settlementLedgerSchema);
