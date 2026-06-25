const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, orderController.getAll);
router.post('/', requireAuth, orderController.create);
router.get('/stats', requireAuth, orderController.getStats);
router.get('/active', requireAuth, orderController.getActive);
router.get('/test-db-query/:id', async (req, res) => {
  try {
    const Order = require('../../models/Order');
    const mongoose = require('mongoose');
    const { id } = req.params;
    const query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { orderId: id }];
    } else {
      query.orderId = id;
    }
    const order = await Order.findOne(query);
    const allOrders = await Order.find({});
    res.json({
      success: true,
      id,
      query,
      foundOrder: order,
      allOrders: allOrders.map(o => ({ _id: o._id, orderId: o.orderId }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:orderId', requireAuth, orderController.getById);
router.post('/:orderId/verify-delivery', requireAuth, orderController.verifyDelivery);

module.exports = router;
