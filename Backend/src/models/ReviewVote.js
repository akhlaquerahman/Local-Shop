const mongoose = require('mongoose');

const ReviewVoteSchema = new mongoose.Schema({
  reviewId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  voteType: { type: String, enum: ['helpful', 'unhelpful'], required: true }
}, { timestamps: true });

ReviewVoteSchema.index({ reviewId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('ReviewVote', ReviewVoteSchema);
