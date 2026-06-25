const mongoose = require('mongoose');

const reviewAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  productReviews: { type: Number, default: 0 },
  shopReviews: { type: Number, default: 0 },
  deliveryReviews: { type: Number, default: 0 },
  sellerReviews: { type: Number, default: 0 },
  flaggedReviews: { type: Number, default: 0 },
  hiddenReviews: { type: Number, default: 0 },
  pendingModeration: { type: Number, default: 0 },
  oneStarReviews: { type: Number, default: 0 },
  fiveStarReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewAnalytics', reviewAnalyticsSchema);
