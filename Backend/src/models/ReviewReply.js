const mongoose = require('mongoose');

const reviewReplySchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  replier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  replierRole: {
    type: String,
    enum: ['SELLER', 'ADMIN'],
    required: true
  },
  replyText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'HIDDEN', 'DELETED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReviewReply', reviewReplySchema);
