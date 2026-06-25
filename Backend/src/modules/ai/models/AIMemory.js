const mongoose = require('mongoose');

const AIMemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  preferences: {
    type: Map,
    of: String,
    default: {}
  },
  recentEntities: [{
    entityType: { type: String }, // e.g., 'ORDER', 'PRODUCT'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    viewedAt: { type: Date, default: Date.now }
  }],
  activeWorkflows: [{
    workflowType: { type: String },
    state: { type: mongoose.Schema.Types.Mixed },
    startedAt: { type: Date, default: Date.now }
  }],
  lastInsightGenerated: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AIMemory', AIMemorySchema);
