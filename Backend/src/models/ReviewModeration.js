const mongoose = require('mongoose');

const reviewModerationSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  criteria: {
    keywords: [String],
    minRating: Number,
    maxRating: Number,
    minRiskScore: Number
  },
  action: {
    type: String,
    enum: ['AUTO_HIDE', 'FLAG_FOR_REVIEW', 'AUTO_DELETE'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewModeration', reviewModerationSchema);
