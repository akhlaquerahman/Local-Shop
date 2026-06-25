const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  imageUrl: { type: String }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  shopId: { type: String },
  shopName: { type: String },
  items: [CartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
