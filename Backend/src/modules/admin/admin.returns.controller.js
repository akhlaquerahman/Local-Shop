const OrderReturn = require('../../models/Return');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await OrderReturn.find().sort({ createdAt: -1 });
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

    returnReq.status = 'APPROVED';
    returnReq.approvedBy = req.user.id || req.user._id;
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Admin',
      previousStatus: returnReq.status,
      newStatus: 'APPROVED',
      notes: 'Admin override: approved request'
    });

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
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });

    returnReq.status = 'REJECTED';
    returnReq.rejectionReason = reason;
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Admin',
      previousStatus: returnReq.status,
      newStatus: 'REJECTED',
      notes: `Admin override: rejected (${reason})`
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

    returnReq.assignedRider = riderId;
    const prevStatus = returnReq.status;
    returnReq.status = 'PICKUP_ASSIGNED';
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Admin',
      previousStatus: prevStatus,
      newStatus: 'PICKUP_ASSIGNED',
      notes: `Admin assigned rider: ${riderId}`
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

    if (returnReq.refundMethod === 'WALLET') {
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
        // Create wallet if doesn't exist
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
      role: 'Admin',
      previousStatus: prevStatus,
      newStatus: 'REFUND_COMPLETED',
      notes: `Admin processed refund via ${returnReq.refundMethod}`
    });

    await returnReq.save();

    // Update the actual Order's status and paymentStatus
    const Order = require('../../models/Order');
    const order = await Order.findOne({ orderId: returnReq.orderId });
    if (order) {
      order.paymentStatus = 'refunded';
      if (returnReq.requestType === 'RETURN') {
        order.status = 'returned';
      }
      await order.save();
    }

    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.closeReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });

    const prevStatus = returnReq.status;
    returnReq.status = 'CLOSED';
    returnReq.auditLogs.push({
      user: req.user.id || req.user._id,
      role: 'Admin',
      previousStatus: prevStatus,
      newStatus: 'CLOSED',
      notes: 'Admin closed the return request'
    });

    await returnReq.save();
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
