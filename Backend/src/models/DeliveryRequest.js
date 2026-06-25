const mongoose = require('mongoose');

const DeliveryRequestSchema = new mongoose.Schema({
  deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
  reason: { type: String },
  expiresAt: { type: Date }
}, { timestamps: true });

DeliveryRequestSchema.index({ deliveryId: 1, riderId: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryRequest', DeliveryRequestSchema);
