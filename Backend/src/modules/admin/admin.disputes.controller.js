const Dispute = require('../../models/Dispute');
const DisputeMessage = require('../../models/DisputeMessage');

exports.getDisputeDashboard = async (req, res) => {
  try {
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'OPEN' });
    const inReviewDisputes = await Dispute.countDocuments({ status: 'IN_REVIEW' });
    const escalatedDisputes = await Dispute.countDocuments({ status: 'ESCALATED' });
    const resolvedDisputes = await Dispute.countDocuments({ status: { $in: ['RESOLVED', 'DISMISSED'] } });
    
    // Simple mock average resolution time for now
    const avgResolutionTimeDays = 2.4; 

    res.json({
      success: true,
      data: {
        kpis: {
          totalDisputes,
          openDisputes,
          inReviewDisputes,
          escalatedDisputes,
          resolvedDisputes,
          avgResolutionTimeDays
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dispute dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDisputes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.targetType) query.targetType = req.query.targetType;
    if (req.query.search) {
      query.$or = [
        { disputeId: { $regex: req.query.search, $options: 'i' } },
        { reason: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const disputes = await Dispute.find(query)
      .populate('customer', 'firstName lastName email profileImage')
      .populate('targetId')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Dispute.countDocuments(query);

    res.json({
      success: true,
      data: disputes,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDisputeDetails = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('orderId')
      .populate('targetId');
      
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    const messages = await DisputeMessage.find({ dispute: dispute._id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        dispute,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching dispute details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    
    res.json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { winner, resolutionNotes } = req.body;
    
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    dispute.status = winner === 'MERCHANT' ? 'DISMISSED' : 'RESOLVED';
    dispute.resolutionWinner = winner;
    dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    
    await dispute.save();

    // Log the resolution as an internal message
    await DisputeMessage.create({
      dispute: dispute._id,
      sender: req.user._id,
      senderRole: 'ADMIN',
      message: `Dispute resolved in favor of ${winner}. Notes: ${resolutionNotes}`,
      isInternal: true
    });

    res.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addDisputeMessage = async (req, res) => {
  try {
    const { message, isInternal } = req.body;
    const newMessage = await DisputeMessage.create({
      dispute: req.params.id,
      sender: req.user._id,
      senderRole: 'ADMIN',
      message,
      isInternal
    });
    res.json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
