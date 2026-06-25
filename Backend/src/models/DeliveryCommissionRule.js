const mongoose = require('mongoose');

const deliveryCommissionRuleSchema = new mongoose.Schema({
  platformDeliveryFee: { type: Number, required: true, default: 20 },
  riderEarnings: { type: Number, required: true, default: 80 },
  peakHourSurcharge: { type: Number, default: 0 },
  rainSurcharge: { type: Number, default: 0 },
  nightDeliveryFee: { type: Number, default: 0 },
  expressDeliveryFee: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryCommissionRule', deliveryCommissionRuleSchema);
