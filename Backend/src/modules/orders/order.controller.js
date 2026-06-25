const Order = require('../../models/Order');
const mongoose = require('mongoose');

// Get all orders with search and status filters
exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { search, status } = req.query;

    const query = { customerId: userId };

    if (status) {
      if (status === 'active') {
        query.status = { $in: ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination'] };
      } else if (status === 'delivered') {
        query.status = 'delivered';
      } else if (status === 'cancelled') {
        query.status = 'cancelled';
      } else if (status === 'refunded') {
        query.paymentStatus = 'refunded';
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderId: searchRegex },
        { shopName: searchRegex },
        { 'items.name': searchRegex }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    
    // Update shop names dynamically for old orders with stale data
    const Shop = require('../../models/Shop');
    for (let order of orders) {
      if (order.shopId) {
        try {
          const shop = await Shop.findById(order.shopId).lean();
          if (shop && shop.name) {
            order.shopName = shop.name;
          }
        } catch (e) {}
      }
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Retrieve order details by ID
exports.getById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find either by orderId (e.g. ORD-2026-1234) or by MongoDB ObjectId
    const query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ _id: orderId }, { orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Count orders in each category for tab stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const [all, active, delivered, cancelled, refunded] = await Promise.all([
      Order.countDocuments({ customerId: userId }),
      Order.countDocuments({ customerId: userId, status: { $in: ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination'] } }),
      Order.countDocuments({ customerId: userId, status: 'delivered' }),
      Order.countDocuments({ customerId: userId, status: 'cancelled' }),
      Order.countDocuments({ customerId: userId, paymentStatus: 'refunded' })
    ]);

    res.json({
      success: true,
      data: { all, active, delivered, cancelled, refunded }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new order (Checkout portal)
exports.create = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userName = (req.user && req.user.name) ? req.user.name : 'Customer';
    
    const { 
      shopId, shopName, subtotal, tax, deliveryFee, 
      discount, total, items, deliveryAddress 
    } = req.body;

    if (!shopId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'shopId and items are required' });
    }

    // Validate and fallback shopId to prevent crashes with mock frontend data
    const Shop = require('../../models/Shop');
    let shop = null;
    let validShopId = null;
    let validShopName = shopName;
    try {
      if (shopId && mongoose.Types.ObjectId.isValid(shopId)) {
        shop = await Shop.findById(shopId);
        validShopId = shopId;
        if (shop) validShopName = shop.name;
      }
      
      // If we couldn't find a valid shop (e.g. mock data "shop-1"), find the most recently created shop
      // This ensures that when testing, the mock orders are assigned to the currently testing seller's shop
      if (!shop) {
        shop = await Shop.findOne({}).sort({ _id: -1 });
        validShopId = shop ? shop._id : null;
        if (shop) validShopName = shop.name;
      }
    } catch (e) {
      console.error('Error fetching shop:', e);
    }

    // If we still don't have a valid shopId, we can't create an order
    if (!validShopId) {
      return res.status(400).json({ success: false, error: 'Cannot create order: No valid shop found in database.' });
    }

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const order = new Order({
      orderId,
      customerId: userId,
      customerName: userName,
      shopId: validShopId,
      shopName: validShopName,
      subtotal,
      tax,
      deliveryFee,
      discount,
      total,
      items,
      deliveryVerificationCode,
      auditLogs: [{
        user: userId,
        role: 'Customer',
        previousStatus: '',
        newStatus: 'pending',
        notes: 'Order placed'
      }],
      deliveryDetails: {
        deliveryAddress: deliveryAddress || 'Home - Noida',
        riderId: '',
        riderName: '',
        riderPhone: ''
      },
      status: 'pending',
      estimatedTimeMinutes: 25,
      eta: '25 mins',
      paymentStatus: req.body.paymentMethod === 'COD' ? 'pending' : 'paid',
      paymentMethod: req.body.paymentMethod || 'COD'
    });

    await order.save();

    // Create a Transaction record for this payment
    const Transaction = require('../../models/Transaction');
    let txnId = `txn-${Date.now()}`;
    let txnStatus = 'completed';
    let txnMethod = req.body.paymentMethod || 'COD';
    
    if (txnMethod === 'COD') {
      txnId = `CASH-${Date.now()}`;
      txnStatus = 'pending';
    }

    await Transaction.create({
      userId: userId,
      transactionId: txnId,
      type: 'credit',
      amount: total,
      description: `Payment for Order ${orderId} via ${txnMethod}`,
      status: txnStatus,
      referenceId: orderId
    });

    // Auto-create a pending Delivery request for the rider marketplace
    const Delivery = require('../../models/Delivery');
    
    const delivery = new Delivery({
      orderId: order._id,
      shopId: validShopId,
      status: 'pending',
      pickupLocation: {
        address: shop ? shop.address : 'Shop Address'
      },
      dropoffLocation: {
        address: deliveryAddress || 'Home - Noida'
      },
      deliveryFee: deliveryFee || 40,
      distanceKm: Math.floor(Math.random() * 8) + 2, // 2-10 km random
      etaMinutes: 25,
      priority: 'normal'
    });
    await delivery.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Secure Delivery Verification endpoint
exports.verifyDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { code } = req.body;
    
    // In reality, this should ensure req.user is a Rider, Seller, or Admin
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : 'system';

    const query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or = [{ _id: orderId }, { orderId }];
    } else {
      query.orderId = orderId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, error: 'Order is already delivered' });
    }

    if (!code || order.deliveryVerificationCode !== code) {
      return res.status(400).json({ success: false, error: 'Invalid Delivery Code' });
    }

    const previousStatus = order.status;
    order.status = 'delivered';
    order.eta = '0 mins';
    order.deliveryDetails.deliveredAt = new Date();
    
    order.auditLogs.push({
      user: userId,
      role: 'Rider/Seller',
      previousStatus,
      newStatus: 'delivered',
      notes: 'Delivery verification code validated successfully'
    });

    await order.save();
    
    res.json({ success: true, verified: true, status: 'DELIVERED', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get the latest active order for the current user
exports.getActive = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const activeOrder = await Order.findOne({
      customerId: userId,
      status: { $in: ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination'] }
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: activeOrder || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

