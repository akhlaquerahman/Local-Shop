const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  provider: { type: String, enum: ['upi', 'card', 'wallet'], required: true },
  maskedNumber: { type: String, required: true },
  expiry: { type: String },
  isDefault: { type: Boolean, default: false },
  cardHolderName: { type: String },
  icon: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
