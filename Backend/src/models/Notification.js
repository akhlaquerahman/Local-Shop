const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['Order', 'Promotion', 'Wallet', 'Coupon', 'System'], default: 'System' },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
