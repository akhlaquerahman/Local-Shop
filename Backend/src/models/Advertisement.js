const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  redirectUrl: { type: String },
  location: { type: String, enum: ['HOME_TOP', 'HOME_MIDDLE', 'SIDEBAR', 'SEARCH_RESULTS'], default: 'HOME_TOP' },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'PAUSED', 'REJECTED', 'EXPIRED'], default: 'ACTIVE' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }, // If sponsored by a seller
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
