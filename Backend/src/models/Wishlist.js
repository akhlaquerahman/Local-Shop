const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true }
}, { timestamps: true });

// Ensure a user can only add a product once to their wishlist
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
