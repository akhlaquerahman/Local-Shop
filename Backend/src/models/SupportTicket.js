const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'support', 'customer', 'seller', 'rider', 'admin'], required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const SupportTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  ticketId: { type: String, required: false }, // Ghost index bypass
  userId: { type: String, required: true },
  userRole: { type: String, enum: ['customer', 'seller', 'rider'], default: 'customer' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminAgent' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  orderId: { type: String },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
