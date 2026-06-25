const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: String, required: true },
  referredEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  rewardAmount: { type: Number, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model('Referral', ReferralSchema);
