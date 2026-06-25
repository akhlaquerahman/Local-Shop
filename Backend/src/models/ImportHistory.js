const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  records: {
    type: Number,
    required: true,
    default: 0
  },
  successCount: {
    type: Number,
    required: true,
    default: 0
  },
  failureCount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'FAILED', 'PARTIAL_SUCCESS'],
    default: 'COMPLETED'
  },
  importErrors: [{
    row: Number,
    message: String,
    product: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ImportHistory', importHistorySchema);
