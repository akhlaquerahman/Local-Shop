const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String },
  customerName: { type: String },
  shopId: { type: String },
  shopName: { type: String },
  subtotal: { type: Number },
  tax: { type: Number },
  deliveryFee: { type: Number },
  discount: { type: Number },
  total: { type: Number },
  status: { 
    type: String, 
    enum: [
      'pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 
      'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 
      'arrived_at_destination', 'delivered', 'cancelled'
    ], 
    default: 'pending' 
  },
  deliveryVerificationCode: { type: String },
  auditLogs: [{
    user: String,
    role: String,
    previousStatus: String,
    newStatus: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  estimatedTimeMinutes: { type: Number, default: 20 },
  eta: { type: String },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  paymentMethod: { type: String, default: 'upi' },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String
  }],
  deliveryDetails: {
    riderId: { type: String, default: '' },
    riderName: { type: String, default: '' },
    riderPhone: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },
    deliveredAt: { type: Date },
    pickedUpAt: { type: Date }
  }
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);
