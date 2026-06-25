const OrderReturn = require('../../models/Return');

exports.getReturns = async (req, res) => {
  try {
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (!user || !user.shopId) return res.status(403).json({ success: false, message: 'Shop ID required' });
      shopId = user.shopId;
    }
    
    const returns = await OrderReturn.find({ sellerId: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const returnReq = await OrderReturn.findById(id);
    
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.shopId) shopId = user.shopId;
    }
    if (returnReq.sellerId !== shopId?.toString() && returnReq.sellerId !== shopId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (returnReq.status !== 'REQUESTED' && returnReq.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ success: false, message: 'Cannot approve from current status' });
    }

    returnReq.status = 'APPROVED';
    returnReq.approvedBy = req.user.id || req.user._id;

    const Order = require('../../models/Order');
    const originalOrder = await Order.findOne({ orderId: returnReq.orderId });
    if (originalOrder && originalOrder.deliveryDetails && originalOrder.deliveryDetails.riderId) {
      returnReq.assignedRider = originalOrder.deliveryDetails.riderId;
      returnReq.status = 'PICKUP_ASSIGNED';
      returnReq.auditLogs.push({
        user: req.user.id || req.user._id,
        role: 'Seller',
        previousStatus: 'APPROVED',
        newStatus: 'PICKUP_ASSIGNED',
        notes: 'System auto-assigned original delivery rider for pickup'
      });
    } else {
      returnReq.auditLogs.push({
        user: req.user.id || req.user._id,
        role: 'Seller',
        previousStatus: returnReq.status,
        newStatus: 'APPROVED',
        notes: 'Seller approved the request. Waiting for admin to assign rider.'
      });
    }

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.shopId) shopId = user.shopId;
    }
    if (returnReq.sellerId !== shopId?.toString() && returnReq.sellerId !== shopId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    returnReq.status = 'REJECTED';
    returnReq.rejectionReason = reason;
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Seller',
      previousStatus: returnReq.status,
      newStatus: 'REJECTED',
      notes: `Rejected: ${reason}`
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });
    
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.shopId) shopId = user.shopId;
    }
    if (returnReq.sellerId !== shopId?.toString() && returnReq.sellerId !== shopId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    returnReq.assignedRider = riderId;
    const prevStatus = returnReq.status;
    returnReq.status = 'PICKUP_ASSIGNED';
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Seller',
      previousStatus: prevStatus,
      newStatus: 'PICKUP_ASSIGNED',
      notes: `Seller manually assigned rider: ${riderId}`
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });
    
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.shopId) shopId = user.shopId;
    }
    if (returnReq.sellerId !== shopId?.toString() && returnReq.sellerId !== shopId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const prevStatus = returnReq.status;
    returnReq.status = 'ITEM_RECEIVED';
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Seller',
      previousStatus: prevStatus,
      newStatus: 'ITEM_RECEIVED',
      notes: `Seller manually marked item as received (Self-Return)`
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });
    
    let shopId = req.user.shopId;
    if (!shopId) {
      const User = require('../../models/User');
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.shopId) shopId = user.shopId;
    }
    if (returnReq.sellerId !== shopId?.toString() && returnReq.sellerId !== shopId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    if (returnReq.status !== 'ITEM_RECEIVED') {
      return res.status(400).json({ success: false, message: 'Item must be received before processing refund' });
    }

    if (returnReq.refundMethod === 'WALLET') {
      const Wallet = require('../../models/Wallet');
      const Transaction = require('../../models/Transaction');
      
      const wallet = await Wallet.findOne({ userId: returnReq.customerId });
      if (wallet) {
        wallet.balance += returnReq.refundAmount;
        await wallet.save();

        await Transaction.create({
          userId: returnReq.customerId,
          transactionId: `TXN-${Date.now()}`,
          type: 'refund',
          amount: returnReq.refundAmount,
          description: `Refund for Order ${returnReq.orderId}`,
          status: 'completed',
          referenceId: returnReq.orderId
        });
      } else {
        await Wallet.create({
          userId: returnReq.customerId,
          balance: returnReq.refundAmount
        });
        await Transaction.create({
          userId: returnReq.customerId,
          transactionId: `TXN-${Date.now()}`,
          type: 'refund',
          amount: returnReq.refundAmount,
          description: `Refund for Order ${returnReq.orderId}`,
          status: 'completed',
          referenceId: returnReq.orderId
        });
      }
    }

    const prevStatus = returnReq.status;
    returnReq.status = 'REFUND_COMPLETED';
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Seller',
      previousStatus: prevStatus,
      newStatus: 'REFUND_COMPLETED',
      notes: `Seller processed refund via ${returnReq.refundMethod}`
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
