const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  reportName: { type: String, required: true },
  category: { type: String, enum: ['Sales', 'Inventory', 'Payouts', 'Tax', 'Customers'], required: true },
  format: { type: String, enum: ['CSV', 'Excel', 'PDF'], required: true },
  status: { type: String, enum: ['GENERATING', 'COMPLETED', 'FAILED'], default: 'GENERATING' },
  fileUrl: { type: String },
  generatedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
