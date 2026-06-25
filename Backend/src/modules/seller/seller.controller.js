const mongoose = require('mongoose');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Shop = require('../../models/Shop');
const ImportHistory = require('../../models/ImportHistory');
const User = require('../../models/User');
const Coupon = require('../../models/Coupon');
const AuditLog = require('../../models/AuditLog');
const Delivery = require('../../models/Delivery');
const DeliveryRequest = require('../../models/DeliveryRequest');

// Helper to get shop ID for a seller
const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

// ========================
// BRANDS
// ========================
exports.getBrands = async (req, res) => {
  try {
    const Brand = require('../../models/Brand');
    const brands = await Brand.find({ status: 'ACTIVE' }).sort({ name: 1 }).lean();
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// PRODUCTS
// ========================

exports.getProducts = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const filter = { shopId: shopId };
    
    // Optional filters
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const products = await Product.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductStats = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shopIdObj = mongoose.Types.ObjectId.isValid(shopId) ? new mongoose.Types.ObjectId(shopId) : shopId;
    
    const stats = await Product.aggregate([
      { $match: { $or: [{ shopId: shopId }, { shopId: shopId.toString() }, { shopId: shopIdObj }] } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } }
      }}
    ]);
    
    res.json({ success: true, data: stats[0] || { total: 0, active: 0, draft: 0, lowStock: 0, outOfStock: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const product = await Product.findOne({ _id: req.params.id, shopId: shopId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Dynamically create category if categoryImage is provided (which implies a new custom category)
    if (req.body.category && req.body.categoryImage) {
      const Category = require('../../models/Category');
      const slug = req.body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existingCategory = await Category.findOne({ slug });
      
      if (!existingCategory) {
        await Category.create({
          name: req.body.category,
          slug: slug,
          description: req.body.categoryDescription || '',
          image: req.body.categoryImage,
          icon: 'tag',
          color: '#3B82F6',
          bg: '#EFF6FF'
        });
      }
    }

    // Dynamically create brand if it doesn't exist
    if (req.body.brand) {
      const Brand = require('../../models/Brand');
      const slug = req.body.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existingBrand = await Brand.findOne({ slug });

      if (!existingBrand) {
        await Brand.create({
          name: req.body.brand,
          slug: slug,
          description: '',
          logo: req.body.brandLogo || null,
          verificationStatus: 'UNVERIFIED',
          status: 'ACTIVE'
        });
      }
    }

    const newProduct = new Product({ ...req.body, shopId: shopId });
    await newProduct.save();
    
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shopId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopId: shopId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// BULK UPLOAD
// ========================

exports.importProducts = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { products, fileName } = req.body;
    
    if (!products || !Array.isArray(products) || !fileName) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    let successCount = 0;
    let failureCount = 0;
    const importErrors = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const prodData = products[i];
        prodData.shopId = shopId;
        const prod = new Product(prodData);
        await prod.save();
        successCount++;
      } catch (err) {
        failureCount++;
        importErrors.push({ row: i + 1, product: products[i].name || 'Unknown', message: err.message });
      }
    }

    const history = new ImportHistory({
      shopId,
      fileName,
      records: products.length,
      successCount,
      failureCount,
      status: failureCount === 0 ? 'COMPLETED' : (successCount === 0 ? 'FAILED' : 'PARTIAL_SUCCESS'),
      importErrors
    });
    await history.save();

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getImportHistory = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const history = await ImportHistory.find({ shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// INVENTORY
// ========================

exports.getInventory = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const products = await Product.find({ shopId: shopId });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { mrp, price, stock, reservedStock, reorderLevel } = req.body;
    
    const update = {};
    if (mrp !== undefined) update.mrp = mrp;
    if (price !== undefined) update.price = price;
    if (stock !== undefined) update.stock = stock;
    if (reservedStock !== undefined) update.reservedStock = reservedStock;
    if (reorderLevel !== undefined) update.reorderLevel = reorderLevel;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: shopId },
      { $set: update },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// ORDERS
// ========================

exports.getOrders = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // usually an order is shop-specific or we filter order items.
    // For simplicity, we find orders where at least one item belongs to this shop.
    const filter = { shopId: shopId.toString() };
    
    if (req.query.search) {
      filter._id = req.query.search; // exact match id for now
    }
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status.toLowerCase();
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    
    // Manually populate user data
    const User = require('../../models/User');
    for (let order of orders) {
      if (order.customerId) {
        const user = await User.findById(order.customerId, 'name email phone').lean();
        if (user) {
          order.user = user;
        } else {
          order.user = { name: order.customerName || 'Guest' };
        }
      } else {
        order.user = { name: order.customerName || 'Guest' };
      }
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shopIdObj = mongoose.Types.ObjectId.isValid(shopId) ? new mongoose.Types.ObjectId(shopId) : shopId;

    const stats = await Order.aggregate([
      { $match: { $or: [{ shopId: shopId }, { shopId: shopId.toString() }, { shopId: shopIdObj }] } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        packed: { $sum: { $cond: [{ $eq: ['$status', 'preparing'] }, 1, 0] } },
        ready: { $sum: { $cond: [{ $eq: ['$status', 'ready_for_pickup'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }}
    ]);
    
    res.json({ success: true, data: stats[0] || { total: 0, pending: 0, accepted: 0, packed: 0, ready: 0, delivered: 0, cancelled: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const status = req.body.status || req.body.orderStatus;
    const verificationCode = req.body.verificationCode;
    
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
    
    // First, find the order to check the verification code if marking as delivered
    const order = await Order.findOne({ _id: req.params.id, shopId: shopId.toString() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status.toLowerCase() === 'delivered') {
      if (!verificationCode || order.deliveryVerificationCode !== verificationCode) {
        return res.status(400).json({ success: false, message: 'Invalid delivery verification code' });
      }
    }

    order.status = status.toLowerCase();
    await order.save();
    
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// DELIVERY REQUESTS
// ========================

exports.getDeliveryRequests = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const orders = await Order.find({ shopId: shopId.toString(), status: { $in: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'delivered', 'cancelled'] } }).sort({ createdAt: -1 }).lean();
    
    // Map status to frontend expected orderStatus
    const mapped = orders.map(order => {
      let mappedStatus = 'PACKED';
      if (['pending', 'accepted', 'preparing'].includes(order.status)) mappedStatus = 'PACKED';
      if (order.status === 'ready_for_pickup') mappedStatus = 'READY_FOR_PICKUP';
      if (order.status === 'picked_up') mappedStatus = 'OUT_FOR_DELIVERY';
      if (order.status === 'delivered') mappedStatus = 'DELIVERED';
      if (order.status === 'cancelled') mappedStatus = 'FAILED_DELIVERY';
      
      return { ...order, orderStatus: mappedStatus };
    });

    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDeliveryRequestStats = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shopIdObj = mongoose.Types.ObjectId.isValid(shopId) ? new mongoose.Types.ObjectId(shopId) : shopId;

    const stats = await Order.aggregate([
      { $match: { 
          $or: [{ shopId: shopId }, { shopId: shopId.toString() }, { shopId: shopIdObj }], 
          status: { $in: ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'delivered', 'cancelled'] } 
        } 
      },
      { $group: {
        _id: null,
        pendingAssignment: { $sum: { $cond: [{ $in: ['$status', ['pending', 'accepted', 'preparing', 'ready_for_pickup']] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'picked_up'] }, 1, 0] } },
        pickedUp: { $sum: { $cond: [{ $eq: ['$status', 'picked_up'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }}
    ]);
    res.json({ success: true, data: stats[0] || { pendingAssignment: 0, assigned: 0, pickedUp: 0, delivered: 0, failed: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDeliveryRequest = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { riderId, orderStatus } = req.body;
    
    const update = {};
    if (orderStatus) {
      if (orderStatus === 'OUT_FOR_DELIVERY') update.status = 'picked_up';
      else if (orderStatus === 'DELIVERED') update.status = 'delivered';
      else if (orderStatus === 'FAILED_DELIVERY') update.status = 'cancelled';
    }
    if (riderId) update['deliveryDetails.riderId'] = riderId;
    
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: shopId.toString() },
      { $set: update },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Request not found' });
    
    // Log audit
    await AuditLog.create({ shopId, userId: req.user.id || req.user._id, action: 'RIDER_ASSIGNED', entityId: order._id, entityType: 'ORDER', details: { riderId } });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getOrderBids = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { id: orderId } = req.params;
    
    // Validate that order belongs to this shop
    const order = await Order.findOne({ _id: orderId, shopId: shopId.toString() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Find the corresponding Delivery document
    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.json({ success: true, data: [] }); // No delivery created yet

    // Fetch DeliveryRequests (bids) for this delivery
    const bids = await DeliveryRequest.find({ deliveryId: delivery._id, status: 'pending' })
      .populate('riderId', 'name phone rating avatarUrl status completedOrders')
      .sort({ createdAt: 1 }); // Oldest first (FIFO)

    res.json({ success: true, data: bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptRiderBid = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { id: orderId } = req.params;
    const { riderId } = req.body;

    // Validate order
    const order = await Order.findOne({ _id: orderId, shopId: shopId.toString() });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Validate delivery
    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

    // Validate rider and bid
    const bid = await DeliveryRequest.findOne({ deliveryId: delivery._id, riderId, status: 'pending' });
    if (!bid) return res.status(404).json({ success: false, message: 'Valid pending bid not found for this rider' });

    // 1. Accept this bid
    bid.status = 'approved';
    await bid.save();

    // 2. Reject all other pending bids for this delivery
    await DeliveryRequest.updateMany(
      { deliveryId: delivery._id, _id: { $ne: bid._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    // 3. Update Delivery document
    delivery.status = 'assigned';
    delivery.riderId = riderId;
    await delivery.save();

    // 4. Update Order document
    const rider = await User.findById(riderId);
    order.status = 'ready_for_pickup'; // automatically move to ready if not already
    order.deliveryDetails = {
      ...order.deliveryDetails,
      riderId: riderId.toString(),
      riderName: rider ? rider.name : 'Delivery Partner',
      riderPhone: rider ? rider.phone : ''
    };
    await order.save();

    // Log audit
    await AuditLog.create({ shopId, userId: req.user.id || req.user._id, action: 'RIDER_ASSIGNED', entityId: order._id, entityType: 'ORDER', details: { riderId } });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========================
// DELIVERY PARTNERS
// ========================

exports.getRiders = async (req, res) => {
  try {
    const riders = await User.find({ role: 'DELIVERY_PARTNER' }).select('-password');
    res.json({ success: true, data: riders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRiderStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'DELIVERY_PARTNER' } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        busy: { $sum: { $cond: [{ $eq: ['$status', 'BUSY'] }, 1, 0] } },
        offline: { $sum: { $cond: [{ $eq: ['$status', 'OFFLINE'] }, 1, 0] } }
      }}
    ]);
    res.json({ success: true, data: stats[0] || { total: 0, available: 0, busy: 0, offline: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// CUSTOMERS
// ========================

exports.getCustomers = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    // Aggregating customers from Orders
    const customers = await Order.aggregate([
      { $match: { shopId: shopId.toString() } },
      { $group: {
        _id: '$customerId',
        customerName: { $first: '$customerName' },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
        lastOrder: { $max: '$createdAt' }
      }},
      { $sort: { lastOrder: -1 } }
    ]);
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomerStats = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const stats = await Order.aggregate([
      { $match: { shopId: shopId.toString() } },
      { $group: {
        _id: '$customerId',
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }},
      { $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        returningCustomers: { $sum: { $cond: [{ $gt: ['$orders', 1] }, 1, 0] } },
        lifetimeRevenue: { $sum: '$revenue' },
        avgOrderValue: { $avg: { $divide: ['$revenue', '$orders'] } }
      }}
    ]);
    res.json({ success: true, data: stats[0] || { totalCustomers: 0, returningCustomers: 0, newCustomers: 0, lifetimeRevenue: 0, avgOrderValue: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// COUPONS
// ========================

exports.getCoupons = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const coupons = await Coupon.find({ shopId: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCouponStats = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const stats = await Coupon.aggregate([
      { $match: { shopId: mongoose.Types.ObjectId(shopId) } },
      { $group: {
        _id: null,
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'SCHEDULED'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] } },
        revenueGenerated: { $sum: '$revenueGenerated' }
      }}
    ]);
    res.json({ success: true, data: stats[0] || { active: 0, scheduled: 0, expired: 0, revenueGenerated: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const coupon = new Coupon({ ...req.body, shopId: shopId });
    await coupon.save();
    
    await AuditLog.create({ shopId, userId: req.user.id || req.user._id, action: 'COUPON_CREATED', entityId: coupon._id, entityType: 'COUPON' });

    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, shopId: shopId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    await AuditLog.create({ shopId, userId: req.user.id || req.user._id, action: 'COUPON_UPDATED', entityId: coupon._id, entityType: 'COUPON' });

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, shopId: shopId });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    await AuditLog.create({ shopId, userId: req.user.id || req.user._id, action: 'COUPON_DELETED', entityId: coupon._id, entityType: 'COUPON' });

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
