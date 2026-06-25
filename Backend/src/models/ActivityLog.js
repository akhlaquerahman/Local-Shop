const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  event: { type: String, required: true },
  category: { type: String, enum: ['Orders', 'Security', 'Profile', 'Reviews', 'Payments'], required: true },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
