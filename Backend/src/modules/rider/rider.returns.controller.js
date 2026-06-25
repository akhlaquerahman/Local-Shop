const OrderReturn = require('../../models/Return');

exports.getReturnPickups = async (req, res) => {
  try {
    const riderId = req.user.id || req.user._id;
    const pickups = await OrderReturn.find({ assignedRider: riderId }).sort({ createdAt: -1 });
    res.json({ success: true, data: pickups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.startPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user.id || req.user._id;
    const returnReq = await OrderReturn.findOne({ _id: id, assignedRider: riderId });
    if (!returnReq) return res.status(404).json({ success: false, message: 'Pickup not found' });

    if (returnReq.status !== 'PICKUP_ASSIGNED' && returnReq.status !== 'APPROVED' && returnReq.status !== 'REQUESTED') {
      return res.status(400).json({ success: false, message: 'Invalid status to start pickup' });
    }

    const prevStatus = returnReq.status;
    returnReq.status = 'PICKUP_IN_PROGRESS';
    returnReq.auditLogs.push({
      user: riderId,
      role: 'Rider',
      previousStatus: prevStatus,
      newStatus: 'PICKUP_IN_PROGRESS',
      notes: 'Rider is arriving for pickup'
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { packagePhoto } = req.body;
    const riderId = req.user.id || req.user._id;
    
    const returnReq = await OrderReturn.findOne({ _id: id, assignedRider: riderId });
    if (!returnReq) return res.status(404).json({ success: false, message: 'Pickup not found' });

    if (returnReq.status !== 'PICKUP_IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Invalid status to complete pickup' });
    }

    returnReq.status = 'ITEM_RECEIVED';
    returnReq.auditLogs.push({
      user: riderId,
      role: 'Rider',
      previousStatus: 'PICKUP_IN_PROGRESS',
      newStatus: 'ITEM_RECEIVED',
      notes: `Item picked up.`
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
