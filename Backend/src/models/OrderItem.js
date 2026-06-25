const mongoose = require('mongoose');
const OrderItemSchema = new mongoose.Schema({
  name: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('OrderItem', OrderItemSchema);
