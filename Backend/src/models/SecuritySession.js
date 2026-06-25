const mongoose = require('mongoose');

const SecuritySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  isActive: { type: Boolean, default: true },
  device: { type: String, required: true },
  browser: { type: String, required: true },
  location: { type: String, required: true },
  ipAddress: { type: String, required: true },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SecuritySession', SecuritySessionSchema);
