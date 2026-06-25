const OrderReturn = require('../../models/Return');
const Order = require('../../models/Order');

exports.createReturn = async (req, res, next) => {
  try {
    const { orderId, orderItemId, requestType, reason, description, evidenceImages, refundMethod } = req.body;
    const customerId = req.user.id || req.user._id;

    if (!['RETURN', 'REPLACEMENT'].includes(requestType)) {
      return res.status(400).json({ success: false, message: 'Invalid request type for this endpoint' });
    }

    const mongoose = require('mongoose');
    const query = [{ orderId }];
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.push({ _id: orderId });
    }
    const order = await Order.findOne({ $or: query });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned/replaced' });
    }

    // Check return window (e.g. 7 days)
    if (order.deliveryDetails && order.deliveryDetails.deliveredAt) {
      const deliveredDate = new Date(order.deliveryDetails.deliveredAt);
      const daysSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > 7) {
        return res.status(400).json({ success: false, message: 'Return window of 7 days has expired' });
      }
    }

    const existingReturn = await OrderReturn.findOne({ orderId: order.orderId, requestType });
    if (existingReturn && requestType === 'RETURN') {
      return res.status(400).json({ success: false, message: 'Return request already exists for this order' });
    }

    const newReturn = new OrderReturn({
      orderId: order.orderId || order.id || order._id,
      orderItemId,
      customerId,
      sellerId: order.shopId || 'unknown_seller',
      requestType,
      reason,
      description,
      evidenceImages: evidenceImages || [],
      status: 'REQUESTED',
      refundAmount: requestType === 'RETURN' ? order.total : 0,
      refundMethod: refundMethod || 'WALLET',
      auditLogs: [{
        user: customerId,
        role: 'Customer',
        newStatus: 'REQUESTED',
        notes: `${requestType} requested created`
      }]
    });

    await newReturn.save();
    res.status(201).json({ success: true, data: newReturn });
  } catch (err) {
    next(err);
  }
};

exports.createCancellation = async (req, res) => {
  try {
    const { orderId, reason, description, refundMethod } = req.body;
    const customerId = req.user.id || req.user._id;

    const mongoose = require('mongoose');
    const query = [{ orderId }];
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.push({ _id: orderId });
    }
    const order = await Order.findOne({ $or: query });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const cancellableStatuses = ['pending', 'accepted', 'preparing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order in status: ${order.status}` });
    }

    const existingCancellation = await OrderReturn.findOne({ orderId: order.orderId, requestType: 'CANCELLATION' });
    if (existingCancellation) {
      return res.status(400).json({ success: false, message: 'Cancellation request already exists' });
    }

    // Process direct cancellation
    const newCancellation = new OrderReturn({
      orderId: order.orderId || order.id || order._id,
      customerId,
      sellerId: order.shopId || 'unknown_seller',
      requestType: 'CANCELLATION',
      reason,
      description,
      status: 'APPROVED', // Cancellations in valid state are auto-approved
      refundAmount: order.total,
      refundMethod: refundMethod || 'WALLET',
      auditLogs: [{
        user: customerId,
        role: 'Customer',
        newStatus: 'APPROVED',
        notes: 'Order cancelled by customer'
      }]
    });

    await newCancellation.save();

    // Update order status
    order.status = 'cancelled';
    order.auditLogs.push({
      user: customerId,
      role: 'Customer',
      previousStatus: order.status,
      newStatus: 'cancelled',
      notes: 'Customer cancelled order'
    });
    await order.save();

    res.status(201).json({ success: true, data: newCancellation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;
    const returns = await OrderReturn.find({ customerId }).sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const returnReq = await OrderReturn.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    // ensure belongs to customer
    const customerId = req.user.id || req.user._id;
    if (returnReq.customerId !== customerId.toString()) {
       return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    res.json({ success: true, data: returnReq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
