const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  targetType: {
    type: String,
    enum: ['PRODUCT', 'SHOP', 'SELLER', 'DELIVERY'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['Product', 'Shop', 'User', 'DeliveryPartner'] // User for SELLER
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  images: [{
    url: String,
    publicId: String
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'HIDDEN', 'REPORTED', 'DELETED', 'PENDING'],
    default: 'ACTIVE'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  aiRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiRiskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'UNSCORED'],
    default: 'UNSCORED'
  },
  aiAnalysisFlags: [{
    type: String // e.g., 'MULTIPLE_REVIEWS_SAME_IP', 'SUSPICIOUS_TEXT'
  }]
}, {
  timestamps: true
});

// Indexes for fast querying on the Admin dashboard
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ aiRiskLevel: 1 });

module.exports = mongoose.model('Review', reviewSchema);
