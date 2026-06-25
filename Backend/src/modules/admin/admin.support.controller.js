const SupportTicket = require('../../models/SupportTicket');
const AdminAgent = require('../../models/AdminAgent');

// Get all support tickets across the platform
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tickets = await SupportTicket.find(filter)
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single ticket details
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('assignedTo', 'fullName email');
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign ticket to an agent
exports.assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    
    // Verify agent exists
    const agent = await AdminAgent.findById(agentId);
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    ticket.assignedTo = agentId;
    ticket.status = ticket.status === 'Open' ? 'Pending' : ticket.status; // Update status to reflect someone is looking
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reply to a ticket
exports.replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    ticket.messages.push({
      sender: 'support',
      message
    });
    
    ticket.status = 'In Progress';
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Resolve a ticket
exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    ticket.status = 'Resolved';
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
