const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'], required: true },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  source: { type: String, default: 'API' }
}, { timestamps: true });

module.exports = mongoose.model('SystemLog', systemLogSchema);
