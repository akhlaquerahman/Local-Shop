const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['DISCOUNT', 'BOGO', 'FREE_SHIPPING', 'FLASH_SALE', 'SPONSORED'], required: true },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'SCHEDULED'], default: 'SCHEDULED' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ordersAttributed: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
  roi: { type: Number, default: 0 },
  description: { type: String },
  targetAudience: { type: String, default: 'All Customers' }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', PromotionSchema);
