const mongoose = require('mongoose');

const AIAgentTaskSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true },
  taskType: { type: String, required: true }, // e.g., 'FRAUD_CHECK_DAILY'
  payload: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ACTION_REQUIRED'], default: 'PENDING' },
  result: { type: mongoose.Schema.Types.Mixed },
  requiresAdminApproval: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AIAgentTask', AIAgentTaskSchema);
