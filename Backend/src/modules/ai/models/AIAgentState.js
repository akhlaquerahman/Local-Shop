const mongoose = require('mongoose');

const AIAgentStateSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true }, // e.g., 'FRAUD_AGENT'
  name: { type: String, required: true },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
  totalRuns: { type: Number, default: 0 },
  successRate: { type: Number, default: 100 },
  failedRuns: { type: Number, default: 0 },
  totalTokensUsed: { type: Number, default: 0 },
  lastRunAt: { type: Date },
  configuration: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('AIAgentState', AIAgentStateSchema);
