const mongoose = require('mongoose');

const AIAuditLogSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true },
  actionType: { type: String, required: true }, // e.g., 'TOOL_EXECUTION', 'RECOMMENDATION', 'AUTONOMOUS_RUN'
  prompt: { type: String },
  response: { type: String },
  toolsUsed: [{ type: String }],
  tokensUsed: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AIAuditLog', AIAuditLogSchema);
