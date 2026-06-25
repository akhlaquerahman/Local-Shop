const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  },
  notifications: {
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotional: { type: Boolean, default: false },
    wallet: { type: Boolean, default: true }
  },
  preferences: {
    defaultAddressId: { type: String },
    defaultPaymentId: { type: String },
    autoApplyCoupons: { type: Boolean, default: true }
  },
  privacy: {
    personalizedRecommendations: { type: Boolean, default: true },
    marketingPreferences: { type: Boolean, default: false }
  },
  region: {
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    region: { type: String, default: 'IN' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
