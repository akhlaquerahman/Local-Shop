const mongoose = require('mongoose');

const promotionalCommissionRuleSchema = new mongoose.Schema({
  campaignName: { type: String, required: true },
  commissionPercent: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  appliesTo: {
    type: String,
    enum: ['ALL', 'SPECIFIC_CATEGORIES', 'SPECIFIC_SELLERS'],
    default: 'ALL'
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('PromotionalCommissionRule', promotionalCommissionRuleSchema);
