const mongoose = require('mongoose');

const DeliveryEventSchema = new mongoose.Schema({
  deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['GPS_PING', 'CALL_LOG', 'PHOTO_EVIDENCE', 'FAILURE_REPORT', 'OTP_VERIFICATION'], required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Arbitrary payload
}, { timestamps: true });

module.exports = mongoose.model('DeliveryEvent', DeliveryEventSchema);
