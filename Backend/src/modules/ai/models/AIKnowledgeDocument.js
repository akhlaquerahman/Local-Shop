const mongoose = require('mongoose');

const aiKnowledgeDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['PDF', 'TXT', 'DOCX', 'MARKDOWN'],
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'INDEXED', 'FAILED'],
    default: 'PENDING'
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  qdrantCollection: {
    type: String,
    required: true
  },
  errorMessage: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AIKnowledgeDocument', aiKnowledgeDocumentSchema);
