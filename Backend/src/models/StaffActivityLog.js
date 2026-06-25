const mongoose = require('mongoose');

const StaffActivityLogSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  action: { type: String, required: true }, // e.g., 'LOGIN', 'CREATE_PRODUCT', 'UPDATE_ORDER'
  entityId: { type: mongoose.Schema.Types.ObjectId }, // ID of the product, order, etc.
  entityType: { type: String }, // e.g., 'Product', 'Order'
  ipAddress: { type: String },
  browser: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StaffActivityLog', StaffActivityLogSchema);
