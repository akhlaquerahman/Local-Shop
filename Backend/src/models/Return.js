const mongoose = require('mongoose');

const OrderReturnSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  orderItemId: { type: String }, // Optional if it's a full order return
  customerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  riderId: { type: String },
  
  requestType: {
    type: String,
    enum: ['RETURN', 'REPLACEMENT', 'CANCELLATION'],
    required: true
  },
  
  reason: { type: String, required: true },
  description: { type: String },
  evidenceImages: [{ type: String }],
  
  status: {
    type: String,
    enum: [
      'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
      'PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS', 'ITEM_RECEIVED',
      'REFUND_INITIATED', 'REFUND_COMPLETED',
      'REPLACEMENT_SHIPPED', 'REPLACEMENT_DELIVERED', 'CLOSED'
    ],
    default: 'REQUESTED'
  },
  
  refundAmount: { type: Number, default: 0 },
  refundMethod: { type: String, enum: ['WALLET', 'ORIGINAL_PAYMENT', 'BANK_ACCOUNT', 'UPI'], default: 'WALLET' },
  rejectionReason: { type: String },
  
  assignedAdmin: { type: String },
  assignedRider: { type: String },
  approvedBy: { type: String },
  
  auditLogs: [{
    user: String,
    role: String,
    previousStatus: String,
    newStatus: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('OrderReturn', OrderReturnSchema);
