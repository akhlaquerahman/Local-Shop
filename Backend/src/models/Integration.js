const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  baseUrl: { type: String, required: true },
  authType: { 
    type: String, 
    enum: ['API_KEY', 'BEARER_TOKEN', 'OAUTH2', 'BASIC_AUTH', 'CUSTOM_HEADER', 'NONE'],
    default: 'NONE'
  },
  apiKey: { type: String }, // Encrypted
  secretKey: { type: String }, // Encrypted
  headers: [{
    key: { type: String },
    value: { type: String }
  }],
  webhookUrl: { type: String },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'ERROR'],
    default: 'INACTIVE'
  },
  description: { type: String },
  lastTestedAt: { type: Date },
  lastTestResult: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
