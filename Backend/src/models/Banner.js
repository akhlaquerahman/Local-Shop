const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    enum: ['HERO_SLIDER', 'CATEGORY_TOP', 'PROMO_STRIP', 'POPUP'],
    required: true,
    default: 'HERO_SLIDER'
  },
  desktopImage: {
    type: String,
    required: true
  },
  mobileImage: {
    type: String, // If not provided, fallback to desktopImage in frontend
  },
  linkType: {
    type: String,
    enum: ['PRODUCT', 'CATEGORY', 'SHOP', 'EXTERNAL', 'NONE'],
    default: 'NONE'
  },
  linkTarget: {
    type: String // The ID or URL depending on linkType
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

bannerSchema.index({ position: 1, isActive: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
