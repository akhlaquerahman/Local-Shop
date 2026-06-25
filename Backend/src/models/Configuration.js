const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  value: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['AI', 'PAYMENT', 'COMMUNICATION', 'STORAGE', 'MAPS', 'ANALYTICS', 'GENERAL', 'FEATURE_FLAG', 'SECRETS'],
    required: true 
  },
  provider: { 
    type: String 
  },
  isSecret: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String 
  },
  tenantId: { 
    type: String, 
    default: 'GLOBAL' 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Configuration', ConfigurationSchema);
