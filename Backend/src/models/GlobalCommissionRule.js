const mongoose = require('mongoose');

const globalCommissionRuleSchema = new mongoose.Schema({
  marketplaceCommission: { type: Number, required: true, default: 10 },
  deliveryCommission: { type: Number, required: true, default: 10 },
  platformConvenienceFee: { type: Number, required: true, default: 20 },
  gst: { type: Number, required: true, default: 18 },
  minCommission: { type: Number, required: true, default: 5 },
  maxCommission: { type: Number, required: true, default: 500 },
  settlementDeduction: { type: Number, required: true, default: 2 },
  latePenalty: { type: Number, required: true, default: 5 },
  cancellationFee: { type: Number, required: true, default: 50 },
  returnHandlingFee: { type: Number, required: true, default: 100 },
  refundProcessingFee: { type: Number, required: true, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('GlobalCommissionRule', globalCommissionRuleSchema);
