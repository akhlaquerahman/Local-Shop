const mongoose = require('mongoose');

const AINotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Insight', 'Warning', 'Recommendation', 'Automation', 'Action Required'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionPayload: { type: mongoose.Schema.Types.Mixed }, // Payload for suggested action
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('AINotification', AINotificationSchema);
