const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  icon: { type: String },
  color: { type: String },
  bg: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Category', CategorySchema);

