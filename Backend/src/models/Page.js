const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['PUBLISHED', 'DRAFT'], default: 'DRAFT' },
  seoTitle: { type: String },
  seoDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
