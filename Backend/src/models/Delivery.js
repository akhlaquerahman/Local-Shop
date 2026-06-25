const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'requested', 'assigned', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_dropoff', 'delivered', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  pickupLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  dropoffLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  distanceKm: { type: Number },
  etaMinutes: { type: Number },
  deliveryFee: { type: Number },
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  pickupDeadline: { type: Date },
  deliveredAt: { type: Date },
  notes: { type: String },
  rating: { type: Number },
  earningsBreakdown: {
    base: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    tips: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 }
  },
  failureReason: { type: String },
  failureEvidence: [{ type: String }],
  adminReviewStatus: { type: String, enum: ['pending', 'resolved', 'appealed'] }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', DeliverySchema);
