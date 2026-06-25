const mongoose = require('mongoose');
const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  logoUrl: { type: String },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  eta: { type: String, default: '15-20 Mins' },
  category: { type: String },
  status: { type: String, enum: ['active', 'pending_approval', 'inactive'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false // temporarily false to allow existing shops to load without errors
    },
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  distance: { type: Number, default: 1.2 },
  deliveryFee: { type: Number, default: 40 },
  operatingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' },
    daysOpen: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] }
  },
  taxSettings: {
    gstNumber: String,
    taxPercentage: { type: Number, default: 0 },
    isTaxIncludedInPrice: { type: Boolean, default: true }
  },
  deliverySettings: {
    freeDeliveryThreshold: { type: Number, default: 500 },
    deliveryRadiusKm: { type: Number, default: 5 },
    selfPickupEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });
ShopSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Shop', ShopSchema);


