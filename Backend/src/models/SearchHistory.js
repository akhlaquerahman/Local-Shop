const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  term: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index query terms per user
SearchHistorySchema.index({ userId: 1, term: 1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
