const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'FIXED' },
  discountAmount: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  startDate: { type: Date },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED'], default: 'ACTIVE' },
  usageConditions: { type: String },
  usersUsed: [{ type: String }], // Array of user IDs who have used it
  usageCount: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', CouponSchema);
