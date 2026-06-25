const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeCode: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, required: true, min: 18 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  profileImage: { type: String },
  dateOfJoining: { type: Date, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffRole' },
  role: { 
    type: String, 
    enum: ['STORE_MANAGER', 'INVENTORY_MANAGER', 'ORDER_MANAGER', 'SUPPORT_AGENT', 'CUSTOM'], 
    required: false // Optional now for backward compatibility
  },
  permissions: [{ type: String }], // Legacy explicit permissions
  effectivePermissions: [{ type: String }],
  customAddedPermissions: [{ type: String }],
  customRemovedPermissions: [{ type: String }],
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
