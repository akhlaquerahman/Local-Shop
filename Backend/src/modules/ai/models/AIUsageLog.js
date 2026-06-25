const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['CUSTOMER', 'SELLER', 'RIDER', 'SUPER_ADMIN', 'DELIVERY_PARTNER']
  },
  promptTokens: {
    type: Number,
    default: 0
  },
  completionTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  modelUsed: {
    type: String,
    default: 'gemini-2.5-flash'
  },
  responseTimeMs: {
    type: Number,
    default: 0
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  endpoint: {
    type: String,
    default: '/chat' // could be /embeddings or /chat
  }
}, { timestamps: true });

module.exports = mongoose.model('AIUsageLog', aiUsageLogSchema);
