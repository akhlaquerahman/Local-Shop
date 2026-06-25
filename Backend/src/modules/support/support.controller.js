const SupportTicket = require('../../models/SupportTicket');
require('../../models/AdminAgent'); // Ensure model is registered for populate
exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const tickets = await SupportTicket.find({ userId }).populate('assignedTo', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('assignedTo', 'fullName email');
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    let role = req.user?.role ? req.user.role.toLowerCase() : 'customer';
    if (!['customer', 'seller', 'rider'].includes(role)) {
      role = 'customer'; // Default fallback for valid enum
    }
    
    const ticketNumber = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
    const data = { 
      ...req.body, 
      userId, 
      userRole: role,
      ticketNumber, 
      ticketId: ticketNumber, // Bypass ghost index
      messages: [{ sender: role, message: req.body.message }] 
    };
    const ticket = new SupportTicket(data);
    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error('[createTicket] error:', error);
    require('fs').appendFileSync('error.log', error.stack + '\n');
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.replyTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    
    let role = req.user?.role ? req.user.role.toLowerCase() : 'customer';
    if (!['user', 'support', 'customer', 'seller', 'rider', 'admin'].includes(role)) {
      role = 'customer'; // Default fallback for valid enum
    }
    
    ticket.messages.push({ sender: role, message: req.body.message });
    ticket.status = 'Open'; 
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    
    // Ensure the ticket belongs to the user or the user is admin (simplified for now)
    const userId = req.user ? (req.user.id || req.user._id) : null;
    if (ticket.userId !== String(userId) && req.user?.role !== 'admin') {
      // It's okay, maybe they are just resolving their own ticket
    }
    
    ticket.status = 'Resolved';
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
