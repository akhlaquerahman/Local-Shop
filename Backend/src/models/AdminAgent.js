const mongoose = require('mongoose');

const AdminAgentSchema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, required: true, min: 18 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  profileImage: { type: String },
  dateOfJoining: { type: Date, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
  role: { 
    type: String, 
    enum: ['SUPPORT_AGENT', 'DISPUTE_MANAGER', 'OPERATIONS_MANAGER', 'CUSTOM'], 
    required: false 
  },
  permissions: [{ type: String }],
  effectivePermissions: [{ type: String }],
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AdminAgent', AdminAgentSchema);
