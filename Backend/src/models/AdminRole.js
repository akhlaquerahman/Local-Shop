const mongoose = require('mongoose');

const AdminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isSystem: { type: Boolean, default: false },
  permissions: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AdminRole', AdminRoleSchema);
