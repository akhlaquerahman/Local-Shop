const mongoose = require('mongoose');

const KycDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['SELLER', 'RIDER'], required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }, // Optional for riders
  documentType: { type: String, required: true },
  documentNumber: { type: String },
  frontImageUrl: { type: String },
  backImageUrl: { type: String },
  pdfUrl: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUIRED'], 
    default: 'PENDING' 
  },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  expiryDate: { type: Date }
}, { timestamps: true });

// Ensure a user only uploads one active document of a specific type
// We might not enforce unique at the DB level to allow re-uploads easily if we just update the existing record.
// A compound index can be useful if we want to ensure uniqueness.
KycDocumentSchema.index({ userId: 1, documentType: 1 });

module.exports = mongoose.model('KycDocument', KycDocumentSchema);
