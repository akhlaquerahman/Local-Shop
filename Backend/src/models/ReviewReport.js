const mongoose = require('mongoose');

const reviewReportSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['Spam', 'Fake', 'Offensive', 'Harassment', 'Misleading', 'Other'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewReport', reviewReportSchema);
