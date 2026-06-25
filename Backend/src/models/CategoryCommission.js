const mongoose = require('mongoose');

const categoryCommissionSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, unique: true },
  commissionPercent: { type: Number, required: true },
  gstPercent: { type: Number, required: true, default: 18 },
  minFee: { type: Number, default: 0 },
  maxFee: { type: Number },
  effectiveFrom: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('CategoryCommission', categoryCommissionSchema);
