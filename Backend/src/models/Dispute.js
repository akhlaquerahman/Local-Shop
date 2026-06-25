const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['SHOP', 'SELLER', 'DELIVERY'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['Shop', 'User', 'DeliveryPartner']
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    url: String,
    description: String
  }],
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_REVIEW', 'ESCALATED', 'RESOLVED', 'DISMISSED'],
    default: 'OPEN'
  },
  resolutionWinner: {
    type: String,
    enum: ['CUSTOMER', 'MERCHANT', 'NONE'],
  },
  resolutionNotes: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Pre-save to auto-generate disputeId if not present
disputeSchema.pre('validate', async function(next) {
  if (!this.disputeId) {
    const count = await mongoose.model('Dispute').countDocuments();
    this.disputeId = `DSP-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
