const mongoose = require('mongoose');

const disputeMessageSchema = new mongoose.Schema({
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['CUSTOMER', 'MERCHANT', 'ADMIN', 'SYSTEM'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    name: String
  }],
  isInternal: {
    type: Boolean,
    default: false // If true, only visible to Admins
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DisputeMessage', disputeMessageSchema);
