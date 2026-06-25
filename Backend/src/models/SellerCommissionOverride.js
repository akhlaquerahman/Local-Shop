const mongoose = require('mongoose');

const sellerCommissionOverrideSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  overrideCommission: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('SellerCommissionOverride', sellerCommissionOverrideSchema);
