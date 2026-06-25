const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['credit', 'debit', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  referenceId: { type: String }, // e.g. orderId
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
