const User = require('../../models/User');
const Shop = require('../../models/Shop');
const Order = require('../../models/Order');
const Delivery = require('../../models/Delivery');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const Brand = require('../../models/Brand');

// Utility for parsing pagination and search
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  return { page, limit, skip, search };
};

exports.getSellers = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessCategory: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const shops = await Shop.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerData' } },
      { $unwind: { path: '$ownerData', preserveNullAndEmptyArrays: true } },
      // Optional: add order count/revenue lookup here if needed, but keeping it simple for performance
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Shop.countDocuments(matchStage);

    res.json({
      success: true,
      data: shops.map(shop => ({
        id: shop._id,
        ownerId: shop.ownerData?._id,
        ownerStatus: shop.ownerData?.status || 'ACTIVE',
        name: shop.name,
        owner: shop.ownerData?.name || 'Unknown',
        email: shop.ownerData?.email || 'N/A',
        phone: shop.ownerData?.phone || 'N/A',
        city: shop.address?.city || 'N/A',
        category: shop.businessCategory || 'General',
        orders: shop.metrics?.totalOrders || 0,
        revenue: shop.metrics?.totalRevenue || 0,
        verification: shop.isVerified ? 'VERIFIED' : 'PENDING',
        status: shop.isActive ? 'ACTIVE' : 'INACTIVE',
        rating: shop.rating || shop.metrics?.rating || 0,
        createdAt: shop.createdAt
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = { role: 'CUSTOMER' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments(query);
    const Address = require('../../models/Address');

    const customersData = await Promise.all(customers.map(async (c) => {
      const address = await Address.findOne({ userId: c._id, isDefault: true }).lean() || await Address.findOne({ userId: c._id }).lean();
      
      const orders = await Order.find({ $or: [{ customerId: c._id }, { customerId: c._id.toString() }] }).lean();
      const validOrders = orders.filter(o => o.status !== 'cancelled' && o.paymentStatus !== 'refunded');
      const ordersCount = validOrders.length;
      const lifetimeSpend = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        id: c._id,
        name: c.name,
        profilePic: c.avatarUrl || null,
        email: c.email,
        phone: c.phone || 'N/A',
        city: address?.city || 'N/A',
        orders: ordersCount,
        lifetimeSpend: lifetimeSpend,
        walletBalance: c.walletBalance || 0,
        lastOrder: c.lastActiveAt || c.updatedAt,
        status: c.status || 'ACTIVE'
      };
    }));

    res.json({
      success: true,
      data: customersData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suspendCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.status = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await user.save();
    
    res.json({ success: true, message: `Customer ${user.status === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let data = { ...user };
    
    if (user.role === 'DELIVERY_PARTNER') {
      const Delivery = require('../../models/Delivery');
      const deliveries = await Delivery.find({ riderId: user._id }).lean();
      const activeStatuses = ['assigned', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_dropoff'];
      data.activeDeliveries = deliveries.filter(d => activeStatuses.includes(d.status)).length;
      data.completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      
      const KycDocument = require('../../models/KycDocument');
      const kycDocs = await KycDocument.find({ userId: user._id }).lean();
      data.kycDocuments = kycDocs;
    } else if (user.role === 'SELLER') {
      const Shop = require('../../models/Shop');
      const Order = require('../../models/Order');
      const shop = await Shop.findOne({ owner: user._id }).lean();
      if (shop) {
        data.shop = shop;
        const orders = await Order.find({ shopId: shop._id.toString() }).lean();
        data.ordersCount = orders.length;
        const completed = orders.filter(o => o.status === 'delivered');
        data.revenue = completed.reduce((sum, o) => sum + (o.total || 0), 0);
      }
      
      const KycDocument = require('../../models/KycDocument');
      data.kycDocuments = await KycDocument.find({ userId: user._id }).lean();
    } else if (user.role === 'CUSTOMER') {
      const Order = require('../../models/Order');
      const orders = await Order.find({ $or: [{ customerId: user._id }, { customerId: user._id.toString() }] }).lean();
      data.ordersCount = orders.length;
      
      const Address = require('../../models/Address');
      data.address = await Address.findOne({ userId: user._id, isDefault: true }).lean() || await Address.findOne({ userId: user._id }).lean();
    }
    
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const KycDocument = require('../../models/KycDocument');
    await KycDocument.updateMany({ userId: req.params.id }, { $set: { status: status } });
    
    const user = await User.findById(req.params.id);
    if (status === 'APPROVED') {
      user.kycStatus = 'VERIFIED';
    } else if (status === 'REJECTED') {
      user.kycStatus = 'REJECTED';
    }
    await user.save();
    
    res.json({ success: true, message: 'KYC status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRiders = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = { role: 'DELIVERY_PARTNER' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const riders = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments(query);

    const Delivery = require('../../models/Delivery');

    const ridersData = await Promise.all(riders.map(async (r) => {
      const deliveries = await Delivery.find({ riderId: r._id }).lean();
      
      const activeStatuses = ['assigned', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_dropoff'];
      const activeDeliveriesCount = deliveries.filter(d => activeStatuses.includes(d.status)).length;
      const completedDeliveriesList = deliveries.filter(d => d.status === 'delivered');
      const completedDeliveriesCount = completedDeliveriesList.length;

      const deliveriesWithRating = completedDeliveriesList.filter(d => typeof d.rating === 'number');
      let realRating = r.rating || 4.8;
      if (deliveriesWithRating.length > 0) {
        const totalRating = deliveriesWithRating.reduce((sum, d) => sum + d.rating, 0);
        realRating = (totalRating / deliveriesWithRating.length).toFixed(1);
      }

      return {
        id: r._id,
        name: r.name,
        profilePic: r.avatarUrl || null,
        phone: r.phone || 'N/A',
        city: r.serviceAreas?.[0]?.city || 'N/A',
        vehicle: r.vehicleType || 'Bike',
        rating: realRating,
        activeDeliveries: activeDeliveriesCount,
        completedDeliveries: completedDeliveriesCount,
        dutyStatus: r.status || 'OFFLINE',
        kycStatus: r.isKycVerified ? 'VERIFIED' : 'PENDING',
        status: r.status
      };
    }));

    res.json({
      success: true,
      data: ridersData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const matchStage = {};
    if (search) {
      matchStage['address.city'] = { $regex: search, $options: 'i' };
    }

    const Shop = require('../../models/Shop');
    const Order = require('../../models/Order');
    const Address = require('../../models/Address');
    const User = require('../../models/User');

    const citiesAggregate = await Shop.aggregate([
      { $match: matchStage },
      { $group: {
        _id: { city: '$address.city', state: '$address.state' },
        shopIds: { $push: '$_id' },
        stores: { $sum: 1 },
      }},
      { $match: { '_id.city': { $ne: null } } },
      { $sort: { '_id.city': 1 } }
    ]);

    const total = citiesAggregate.length;
    const paginated = citiesAggregate.slice(skip, skip + limit);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const realData = await Promise.all(paginated.map(async (c, i) => {
      const cityStr = c._id.city;
      
      const cityAddresses = await Address.find({ city: { $regex: new RegExp(`^${cityStr}$`, 'i') } }).lean();
      const userIds = cityAddresses.map(a => a.userId);
      const customersCount = await User.countDocuments({ _id: { $in: userIds }, role: 'CUSTOMER' });

      const ridersCount = await User.countDocuments({ role: 'DELIVERY_PARTNER', 'serviceAreas.city': { $regex: new RegExp(`^${cityStr}$`, 'i') } });

      const stringShopIds = c.shopIds.map(id => id.toString());
      const ordersTodayCount = await Order.countDocuments({ 
        $or: [{ shopId: { $in: c.shopIds } }, { shopId: { $in: stringShopIds } }],
        createdAt: { $gte: startOfToday } 
      });

      return {
        id: cityStr + '-' + i,
        city: cityStr || 'Unknown',
        state: c._id.state || 'Unknown',
        zones: 1, 
        stores: c.stores,
        customers: customersCount,
        riders: ridersCount,
        ordersToday: ordersTodayCount,
        status: 'ACTIVE'
      };
    }));

    res.json({
      success: true,
      data: realData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getZones = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const matchStage = {};
    if (search) {
      matchStage['address.city'] = { $regex: search, $options: 'i' };
    }

    const Shop = require('../../models/Shop');
    const Order = require('../../models/Order');
    const Address = require('../../models/Address');
    const User = require('../../models/User');

    const zonesAggregate = await Shop.aggregate([
      { $match: matchStage },
      { $group: {
        _id: { city: '$address.city' },
        shopIds: { $push: '$_id' },
        stores: { $sum: 1 },
      }},
      { $match: { '_id.city': { $ne: null } } },
      { $sort: { '_id.city': 1 } }
    ]);

    const total = zonesAggregate.length;
    const paginated = zonesAggregate.slice(skip, skip + limit);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const realData = await Promise.all(paginated.map(async (z, i) => {
      const cityStr = z._id.city;
      
      const cityAddresses = await Address.find({ city: { $regex: new RegExp(`^${cityStr}$`, 'i') } }).lean();
      const userIds = cityAddresses.map(a => a.userId);
      const customersCount = await User.countDocuments({ _id: { $in: userIds }, role: 'CUSTOMER' });

      const ridersCount = await User.countDocuments({ role: 'DELIVERY_PARTNER', 'serviceAreas.city': { $regex: new RegExp(`^${cityStr}$`, 'i') } });

      const stringShopIds = z.shopIds.map(id => id.toString());
      const ordersToday = await Order.find({ 
        $or: [{ shopId: { $in: z.shopIds } }, { shopId: { $in: stringShopIds } }],
        createdAt: { $gte: startOfToday } 
      }).lean();
      
      const ordersTodayCount = ordersToday.length;
      const revenue = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);

      const oldestShop = await Shop.findOne({ _id: { $in: z.shopIds } }).sort({ createdAt: 1 }).lean();

      return {
        id: `zone-${i}`,
        zoneName: `${cityStr || 'Unknown'} Central`,
        city: cityStr || 'Unknown',
        stores: z.stores,
        customers: customersCount,
        riders: ridersCount,
        ordersToday: ordersTodayCount,
        revenue: revenue,
        status: 'ACTIVE',
        createdAt: oldestShop ? oldestShop.createdAt : new Date().toISOString()
      };
    }));

    res.json({
      success: true,
      data: realData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query).sort({ level: 1, name: 1 }).skip(skip).limit(limit).lean();
    
    const categoriesWithCounts = await Promise.all(categories.map(async (c) => {
      const productsCount = await Product.countDocuments({ category: c.name });
      const distinctShops = await Product.distinct('shopId', { category: c.name });
      
      return {
        id: c._id,
        category: c.name,
        description: c.description || '',
        icon: c.icon || '',
        image: c.image || '',
        color: c.color || '',
        bg: c.bg || '',
        parentCategory: c.parentId ? 'Parent Category' : 'None',
        level: c.level || 0,
        subcategories: c.subCategories?.length || 0,
        products: productsCount,
        stores: distinctShops.length,
        status: c.isActive === false ? 'INACTIVE' : 'ACTIVE'
      };
    }));

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categoriesWithCounts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, color, bg } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });

    const newCategory = await Category.create({ name, slug, description, image, icon, color, bg });
    res.json({ success: true, data: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, icon, color, bg, isActive } = req.body;
    
    const updateData = { description, image, icon, color, bg };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const brands = await Brand.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean();
    
    const brandsWithStats = await Promise.all(brands.map(async (b) => {
      const productsCount = await Product.countDocuments({ brand: b.name });
      const distinctShops = await Product.distinct('shopId', { brand: b.name });
      
      return {
        id: b._id,
        brand: b.name,
        description: b.description || '',
        logo: b.logo || null,
        products: productsCount,
        sellers: distinctShops.length,
        revenue: productsCount * 1500, // mock revenue
        verificationStatus: b.verificationStatus || 'UNVERIFIED',
        status: b.status || 'ACTIVE',
        createdAt: b.createdAt
      };
    }));

    const total = await Brand.countDocuments(query);

    res.json({
      success: true,
      data: brandsWithStats,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, description, logo, verificationStatus, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Brand.findOne({ slug });
    if (existing) return res.status(400).json({ success: false, message: 'Brand already exists' });

    const newBrand = await Brand.create({ name, slug, description, logo, verificationStatus, status });
    res.json({ success: true, data: newBrand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo, verificationStatus, status } = req.body;
    
    const updateData = { description, logo };
    if (verificationStatus !== undefined) updateData.verificationStatus = verificationStatus;
    if (status !== undefined) updateData.status = status;
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const updated = await Brand.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Brand not found' });
    
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Brand not found' });
    
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('shopId', 'name address.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products.map(p => ({
        id: p._id,
        image: p.images?.[0]?.url || p.images?.[0] || p.imageUrl || null,
        productName: p.name,
        sku: p.sku || 'N/A',
        brand: p.brand || 'Unbranded',
        category: p.category || 'General',
        seller: p.shopId?.name || 'Unknown',
        city: p.shopId?.address?.city || 'N/A',
        stock: p.stock || 0,
        sales: p.salesCount || 0,
        revenue: (p.salesCount || 0) * (p.price || 0),
        approvalStatus: p.isApproved ? 'APPROVED' : 'PENDING',
        createdAt: p.createdAt
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Transaction = require('../../models/Transaction');

exports.getInventory = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const inventory = await Product.find(query)
      .populate('shopId', 'name address.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Dynamic KPIs
    const kpis = await Product.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        totalSkus: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', '$reorderLevel'] }] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } }
      }}
    ]);

    res.json({
      success: true,
      data: inventory.map(p => ({
        id: p._id,
        product: p.name,
        sku: p.sku || 'N/A',
        brand: p.brand || 'Unbranded',
        category: p.category || 'General',
        seller: p.shopId?.name || 'Unknown',
        city: p.shopId?.address?.city || 'N/A',
        currentStock: p.stock || 0,
        reservedStock: p.reservedStock || 0,
        threshold: p.reorderLevel || 10,
        status: (p.stock || 0) <= 0 ? 'OUT_OF_STOCK' : (p.stock || 0) < (p.reorderLevel || 10) ? 'LOW_STOCK' : 'IN_STOCK',
        lastUpdated: p.updatedAt
      })),
      kpis: kpis[0] || { totalSkus: 0, totalValue: 0, lowStock: 0, outOfStock: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.orderId = { $regex: search, $options: 'i' }; // Search by string orderId
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    // KPIs
    const today = new Date();
    today.setHours(0,0,0,0);
    const kpis = await Order.aggregate([
      { $group: {
        _id: null,
        todaysOrders: { $sum: { $cond: [{ $gte: ['$createdAt', today] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $in: ['$status', ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up']] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        revenue: { $sum: '$totalAmount' }
      }}
    ]);
    const shopIds = [...new Set(orders.map(o => o.shopId).filter(Boolean))];
    const shops = await Shop.find({ _id: { $in: shopIds } }).select('address.city').lean();
    const shopCityMap = shops.reduce((acc, s) => {
      if (s.address?.city) acc[s._id.toString()] = s.address.city;
      return acc;
    }, {});

    res.json({
      success: true,
      data: orders.map(o => ({
        id: o._id,
        orderId: o.orderId || o._id.toString().substring(0,8).toUpperCase(),
        customer: o.customerName || 'Guest',
        store: o.shopName || 'Unknown',
        seller: o.shopName || 'Unknown',
        city: shopCityMap[o.shopId?.toString()] || 'N/A',
        items: o.items?.length || 0,
        amount: o.total || o.totalAmount || 0,
        paymentStatus: o.paymentStatus || 'PENDING',
        deliveryStatus: o.status || 'NEW',
        createdAt: o.createdAt
      })),
      kpis: kpis[0] || { todaysOrders: 0, inProgress: 0, delivered: 0, cancelled: 0, revenue: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    console.log('[Admin] Fetching order ID:', req.params.id);
    let order = null;
    
    // First try standard findById (handles ObjectId)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id).lean();
    }
    
    // If not found, try searching by string _id (in case of manual seed) or orderId
    if (!order) {
      order = await Order.findOne({ 
        $or: [
          { _id: req.params.id },
          { orderId: req.params.id }
        ]
      }).lean();
    }

    if (!order) {
      console.log('[Admin] Order not found for ID:', req.params.id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Attempt to fetch shop city
    let city = 'N/A';
    if (order.shopId) {
      const shop = await Shop.findById(order.shopId).select('address.city').lean();
      if (shop && shop.address?.city) {
        city = shop.address.city;
      }
    }
    
    console.log('[Admin] Successfully fetched order:', req.params.id);
    res.json({
      success: true,
      data: {
        ...order,
        city
      }
    });
  } catch (err) {
    console.error('[Admin] Error fetching order:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = { type: { $ne: 'refund' } }; // all non-refunds
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Transaction.countDocuments(query);

    const kpis = await Transaction.aggregate([
      { $match: { type: { $ne: 'refund' } } },
      { $group: {
        _id: null,
        totalVolume: { $sum: '$amount' },
        successful: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }}
    ]);

    res.json({
      success: true,
      data: payments.map(p => {
        let method = 'UPI';
        let gateway = 'Razorpay';
        
        if (p.description?.includes('COD') || p.description?.includes('Cash')) {
          method = 'CASH';
          gateway = 'N/A';
        } else if (p.description?.includes('CARD')) {
          method = 'CARD';
        } else if (p.description?.includes('WALLET')) {
          method = 'WALLET';
          gateway = 'Internal';
        }

        return {
          id: p._id,
          transactionId: method === 'CASH' ? 'Cash' : p.transactionId,
          orderId: p.referenceId || 'N/A',
          customer: p.userId || 'Unknown',
          gateway,
          paymentMethod: method,
          amount: p.amount || 0,
          gatewayReference: method === 'CASH' ? 'N/A' : p._id.toString().substring(0,10),
          settlementStatus: p.status === 'completed' ? 'SETTLED' : 'PENDING',
          createdAt: p.createdAt,
          status: p.status
        };
      }),
      kpis: kpis[0] || { totalVolume: 0, successful: 0, failed: 0, pending: 0, disputes: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).lean();
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    
    const User = require('../../models/User');
    const Order = require('../../models/Order');

    let method = 'UPI';
    let gateway = 'Razorpay';
    if (transaction.description?.includes('COD') || transaction.description?.includes('Cash')) {
      method = 'CASH';
      gateway = 'N/A';
    } else if (transaction.description?.includes('CARD')) {
      method = 'CARD';
    } else if (transaction.description?.includes('WALLET')) {
      method = 'WALLET';
      gateway = 'Internal';
    }

    const data = {
      id: transaction._id,
      transactionId: method === 'CASH' ? 'Cash' : transaction.transactionId,
      orderId: transaction.referenceId || 'N/A',
      customer: transaction.userId || 'Unknown',
      gateway,
      paymentMethod: method,
      amount: transaction.amount || 0,
      settlementStatus: transaction.status === 'completed' ? 'SETTLED' : 'PENDING',
      createdAt: transaction.createdAt,
      type: transaction.type,
      description: transaction.description
    };

    if (transaction.userId) {
      try {
        if (transaction.userId.length === 24) {
          const user = await User.findById(transaction.userId).lean();
          if (user) data.customerName = user.name;
        }
      } catch (e) {
        // Ignore cast errors
      }
    }

    if (transaction.referenceId && transaction.referenceId !== 'N/A') {
      try {
        let order = null;
        if (transaction.referenceId.length === 24) {
          order = await Order.findById(transaction.referenceId).lean();
        }
        if (!order) {
          order = await Order.findOne({ orderId: transaction.referenceId }).lean();
        }
        if (order) {
          data.orderTotal = order.total;
          data.orderStatus = order.status;
        }
      } catch (e) {
        // Ignore cast errors
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = { type: 'refund' };
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }

    const refunds = await Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Transaction.countDocuments(query);

    const kpis = await Transaction.aggregate([
      { $match: { type: 'refund' } },
      { $group: {
        _id: null,
        totalRefundAmount: { $sum: '$amount' },
        pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }}
    ]);

    const mongoose = require('mongoose');
    const User = require('../../models/User');
    const userIds = refunds.map(r => r.userId).filter(id => id && mongoose.Types.ObjectId.isValid(id));
    const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u.name || u.email || 'Unknown';
      return acc;
    }, {});

    res.json({
      success: true,
      data: refunds.map(r => ({
        id: r._id,
        refundId: r.transactionId,
        orderId: r.referenceId || 'N/A',
        customer: r.userId ? (userMap[r.userId.toString()] || r.userId) : 'Unknown',
        reason: r.description || 'Customer Request',
        amount: r.amount || 0,
        evidence: 'Attached',
        createdAt: r.createdAt,
        status: r.status === 'completed' ? 'APPROVED' : r.status === 'failed' ? 'REJECTED' : 'PENDING'
      })),
      kpis: kpis[0] || { totalRefundAmount: 0, pendingReview: 0, approved: 0, rejected: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Wallet = require('../../models/Wallet');
const Review = require('../../models/Review');
const Dispute = require('../../models/Dispute');
const SupportTicket = require('../../models/SupportTicket');

exports.getCommissions = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    // Simulate commission rules as no native schema exists yet
    const simulatedRules = [
      { id: 'com-1', name: 'Global Standard', scope: 'Global', commissionPercent: 5.0, status: 'ACTIVE', modified: new Date() },
      { id: 'com-2', name: 'Electronics Category', scope: 'Category', commissionPercent: 8.5, status: 'ACTIVE', modified: new Date() },
      { id: 'com-3', name: 'Premium Sellers', scope: 'Seller', commissionPercent: 3.0, status: 'ACTIVE', modified: new Date() },
      { id: 'com-4', name: 'Grocery Category', scope: 'Category', commissionPercent: 2.5, status: 'DISABLED', modified: new Date() }
    ];

    const filtered = simulatedRules.filter(r => search ? r.name.toLowerCase().includes(search.toLowerCase()) : true);
    const paginated = filtered.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginated,
      kpis: { globalCommission: '5%', activeRules: 3, categoryOverrides: 2, sellerOverrides: 1 },
      meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWallets = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.$or = [{ userId: { $regex: search, $options: 'i' } }];
    }

    const wallets = await Wallet.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Wallet.countDocuments(query);

    const kpis = await Wallet.aggregate([
      { $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
        credits: { $sum: { $cond: [{ $gt: ['$balance', 0] }, '$balance', 0] } },
        debits: { $sum: 0 }, // Simplified
        frozenBalance: { $sum: 0 } // Simplified
      }}
    ]);

    res.json({
      success: true,
      data: wallets.map(w => ({
        id: w._id,
        transactionId: w._id.toString().substring(0, 10),
        user: w.userId || 'Unknown',
        walletType: w.userType || 'CUSTOMER',
        type: 'CREDIT',
        amount: w.balance || 0,
        balanceAfter: w.balance || 0,
        source: 'Order Checkout',
        reference: w._id.toString().substring(10, 18),
        date: w.updatedAt
      })),
      kpis: kpis[0] || { totalBalance: 0, credits: 0, debits: 0, frozenBalance: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Review.countDocuments(query);

    const kpis = await Review.aggregate([
      { $group: {
        _id: null,
        pendingReviews: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        reportedReviews: { $sum: { $cond: [{ $gt: ['$reportCount', 0] }, 1, 0] } },
        hiddenReviews: { $sum: { $cond: [{ $eq: ['$status', 'hidden'] }, 1, 0] } },
        approvedReviews: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
      }}
    ]);

    res.json({
      success: true,
      data: reviews.map(r => ({
        id: r._id,
        reviewId: r._id.toString().substring(0, 10),
        customer: r.userId || 'Unknown',
        product: r.productId || 'Unknown',
        seller: r.shopId || 'Unknown',
        rating: r.rating || 0,
        reviewText: r.comment || '',
        reportedCount: r.reportCount || 0,
        status: (r.status || 'APPROVED').toUpperCase(),
        date: r.createdAt
      })),
      kpis: kpis[0] || { pendingReviews: 0, reportedReviews: 0, hiddenReviews: 0, approvedReviews: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const update = await Review.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getRatings = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const fiveStar = await Review.countDocuments({ rating: 5 });
    
    const chartData = [
      { name: '1 Star', count: await Review.countDocuments({ rating: 1 }) },
      { name: '2 Star', count: await Review.countDocuments({ rating: 2 }) },
      { name: '3 Star', count: await Review.countDocuments({ rating: 3 }) },
      { name: '4 Star', count: await Review.countDocuments({ rating: 4 }) },
      { name: '5 Star', count: fiveStar }
    ];

    res.json({
      success: true,
      kpis: { averageRating: 4.2, totalReviews, fiveStarReviews: fiveStar, reportedReviews: 0 },
      charts: { distribution: chartData }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDisputes = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.reason = { $regex: search, $options: 'i' };
    }

    const disputes = await Dispute.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Dispute.countDocuments(query);

    const kpis = await Dispute.aggregate([
      { $group: {
        _id: null,
        openCases: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        escalated: { $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }}
    ]);

    res.json({
      success: true,
      data: disputes.map(d => ({
        id: d._id,
        disputeId: d._id.toString().substring(0, 10),
        orderId: d.orderId || 'N/A',
        customer: d.userId || 'Unknown',
        against: d.targetId || 'Platform',
        priority: 'HIGH',
        status: (d.status || 'OPEN').toUpperCase(),
        createdAt: d.createdAt,
        assignedAdmin: 'Unassigned'
      })),
      kpis: kpis[0] || { openCases: 0, inReview: 0, escalated: 0, resolved: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const update = await Dispute.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSupportTickets = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    
    const query = {};
    if (search) {
      query.subject = { $regex: search, $options: 'i' };
    }

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await SupportTicket.countDocuments(query);

    const kpis = await SupportTicket.aggregate([
      { $group: {
        _id: null,
        openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        pendingResponse: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        slaBreaches: { $sum: 0 }
      }}
    ]);

    res.json({
      success: true,
      data: tickets.map(t => ({
        id: t._id,
        ticketId: t.ticketId || t._id.toString().substring(0, 10),
        customer: t.userId || 'Unknown',
        channel: 'App',
        subject: t.subject || 'Support Request',
        priority: (t.priority || 'NORMAL').toUpperCase(),
        assignedAgent: 'Unassigned',
        status: (t.status || 'OPEN').toUpperCase(),
        createdAt: t.createdAt
      })),
      kpis: kpis[0] || { openTickets: 0, pendingResponse: 0, resolved: 0, slaBreaches: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Notification = require('../../models/Notification');
const Banner = require('../../models/Banner');
const Coupon = require('../../models/Coupon');
const Promotion = require('../../models/Promotion');
const Announcement = require('../../models/Announcement');
const Advertisement = require('../../models/Advertisement');

exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Notification.countDocuments(query);
    const kpis = await Notification.aggregate([
      { $group: {
        _id: null,
        totalBroadcasts: { $sum: 1 },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: notifications.map(n => ({
        id: n._id,
        campaignName: n.title || 'Untitled',
        audience: n.type === 'shop' ? 'Sellers' : n.type === 'delivery' ? 'Riders' : 'All',
        channel: 'In-App',
        status: (n.status || 'DELIVERED').toUpperCase(),
        scheduledDate: n.createdAt,
        deliveredCount: n.read ? 1 : 0,
        ctr: '12%'
      })),
      kpis: kpis[0] || { totalBroadcasts: 0, scheduled: 0, delivered: 0, failed: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const newNotif = new Notification({ title, message, type, status: 'delivered', read: false });
    await newNotif.save();
    res.json({ success: true, data: newNotif });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const announcements = await Announcement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Announcement.countDocuments(query);
    const kpis = await Announcement.aggregate([
      { $group: {
        _id: null,
        active: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: announcements.map(a => ({
        id: a._id,
        title: a.title,
        audience: a.targetAudience,
        priority: 'Normal', // Add priority to schema if needed later
        status: a.status,
        start: a.createdAt,
        end: a.validUntil || new Date(Date.now() + 86400000)
      })),
      kpis: { ...(kpis[0] || { active: 0, draft: 0 }), scheduled: 0, expired: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, validUntil } = req.body;
    const newAnn = new Announcement({ title, content, targetAudience, validUntil, createdBy: req.user.id || req.user._id });
    await newAnn.save();
    res.json({ success: true, data: newAnn });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getBanners = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const banners = await Banner.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Banner.countDocuments(query);
    const kpis = await Banner.aggregate([
      { $group: {
        _id: null,
        activeBanners: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        homepageSlots: { $sum: { $cond: [{ $eq: ['$position', 'home_main'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: banners.map(b => ({
        id: b._id,
        preview: b.imageUrl,
        placement: b.position || 'Homepage',
        priority: b.sortOrder || 0,
        clicks: b.clickCount || 0,
        ctr: '5.2%',
        status: b.isActive ? 'ACTIVE' : 'INACTIVE'
      })),
      kpis: { ...(kpis[0] || { activeBanners: 0, homepageSlots: 0 }), ctr: '5.2%', scheduled: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createBanner = async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    await newBanner.save();
    res.json({ success: true, data: newBanner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdvertisements = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const ads = await Advertisement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Advertisement.countDocuments(query);
    const kpis = await Advertisement.aggregate([
      { $group: {
        _id: null,
        campaigns: { $sum: 1 },
        impressions: { $sum: '$metrics.impressions' },
        clicks: { $sum: '$metrics.clicks' }
      }}
    ]);
    res.json({
      success: true,
      data: ads.map(a => ({
        id: a._id,
        campaign: a.title,
        advertiser: a.sellerId || 'Platform',
        budget: '₹0', // Map to a real budget field if added
        spend: '₹0',
        ctr: a.metrics?.impressions ? `${((a.metrics.clicks / a.metrics.impressions) * 100).toFixed(1)}%` : '0%',
        status: a.status
      })),
      kpis: { ...(kpis[0] || { campaigns: 0, impressions: 0, clicks: 0 }), revenue: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createAdvertisement = async (req, res) => {
  try {
    const newAd = new Advertisement(req.body);
    await newAd.save();
    res.json({ success: true, data: newAd });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Advertisement.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getCoupons = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.code = { $regex: search, $options: 'i' };
    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Coupon.countDocuments(query);
    const kpis = await Coupon.aggregate([
      { $group: {
        _id: null,
        activeCoupons: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        redemptions: { $sum: '$usageCount' }
      }}
    ]);
    res.json({
      success: true,
      data: coupons.map(c => ({
        id: c._id,
        code: c.code || 'UNKNOWN',
        type: c.discountType || 'percentage',
        discount: c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`,
        usageCount: c.usageCount || 0,
        usageLimit: c.usageLimit || '∞',
        status: c.isActive ? 'ACTIVE' : 'INACTIVE',
        expiryDate: c.validUntil
      })),
      kpis: { ...(kpis[0] || { activeCoupons: 0, redemptions: 0 }), discountValue: '₹45,000', expired: 12 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPages = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const pagesList = await Page.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Page.countDocuments(query);
    const kpis = await Page.aggregate([
      { $group: {
        _id: null,
        published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: pagesList.map(p => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        author: 'System', // Could add author to schema if needed
        status: p.status,
        updated: p.updatedAt
      })),
      kpis: { ...(kpis[0] || { published: 0, draft: 0 }), scheduled: 0, archived: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPage = async (req, res) => {
  try {
    const newPage = new Page(req.body);
    await newPage.save();
    res.json({ success: true, data: newPage });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Page.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const Page = require('../../models/Page');
const Blog = require('../../models/Blog');
const FAQ = require('../../models/FAQ');
const EmailTemplate = require('../../models/EmailTemplate');
const SmsTemplate = require('../../models/SmsTemplate');
const PushTemplate = require('../../models/PushTemplate');
const SystemLog = require('../../models/SystemLog');
const FraudCase = require('../../models/FraudCase');
const AuditLog = require('../../models/AuditLog');

exports.getBlogs = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const blogsList = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Blog.countDocuments(query);
    const kpis = await Blog.aggregate([
      { $group: {
        _id: null,
        published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
        drafts: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
        views: { $sum: '$views' }
      }}
    ]);
    res.json({
      success: true,
      data: blogsList.map(b => ({
        id: b._id,
        title: b.title,
        category: b.tags?.length ? b.tags[0] : 'General',
        author: b.author,
        views: b.views || 0,
        status: b.status,
        publishedDate: b.createdAt
      })),
      kpis: { ...(kpis[0] || { published: 0, drafts: 0, views: 0 }), totalPosts: total },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createBlog = async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.json({ success: true, data: newBlog });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFaqs = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.question = { $regex: search, $options: 'i' };
    const faqList = await FAQ.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await FAQ.countDocuments(query);
    const kpis = await FAQ.aggregate([
      { $group: {
        _id: null,
        published: { $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] } },
        drafts: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: faqList.map(f => ({
        id: f._id,
        question: f.question,
        category: f.category,
        status: f.status,
        order: f.sortOrder,
        updated: f.updatedAt
      })),
      kpis: { ...(kpis[0] || { published: 0, drafts: 0 }), categories: 3, questions: total }, // categories mocked since requires distinct
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createFaq = async (req, res) => {
  try {
    const newFaq = new FAQ(req.body);
    await newFaq.save();
    res.json({ success: true, data: newFaq });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getEmailTemplates = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const templates = await EmailTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await EmailTemplate.countDocuments(query);
    const kpis = await EmailTemplate.aggregate([
      { $group: {
        _id: null,
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: templates.map(t => ({
        id: t._id,
        template: t.name,
        type: 'Transactional', // mock for now
        variables: t.variables?.join(', ') || '',
        status: t.status,
        updated: t.updatedAt
      })),
      kpis: { ...(kpis[0] || { active: 0 }), templates: total, transactional: total, marketing: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createEmailTemplate = async (req, res) => {
  try {
    const newTemplate = new EmailTemplate(req.body);
    await newTemplate.save();
    res.json({ success: true, data: newTemplate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await EmailTemplate.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSmsTemplates = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const templates = await SmsTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await SmsTemplate.countDocuments(query);
    const kpis = await SmsTemplate.aggregate([
      { $group: {
        _id: null,
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: templates.map(t => ({
        id: t._id,
        template: t.name,
        characters: t.body?.length || 0,
        provider: 'Twilio',
        status: t.status,
        updated: t.updatedAt
      })),
      kpis: { ...(kpis[0] || { active: 0 }), templates: total, delivered: '0', failed: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createSmsTemplate = async (req, res) => {
  try {
    const newTemplate = new SmsTemplate(req.body);
    await newTemplate.save();
    res.json({ success: true, data: newTemplate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateSmsTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await SmsTemplate.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPushTemplates = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const templates = await PushTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await PushTemplate.countDocuments(query);
    const kpis = await PushTemplate.aggregate([
      { $group: {
        _id: null,
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: templates.map(t => ({
        id: t._id,
        template: t.name,
        audience: 'All Users',
        clicks: 0,
        ctr: '0%',
        status: t.status
      })),
      kpis: { ...(kpis[0] || { active: 0 }), templates: total, sent: '0', ctr: '0%' },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPushTemplate = async (req, res) => {
  try {
    const newTemplate = new PushTemplate(req.body);
    await newTemplate.save();
    res.json({ success: true, data: newTemplate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updatePushTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await PushTemplate.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getRoles = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const roles = await Role.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Role.countDocuments(query);
    const kpis = await Role.aggregate([
      { $group: {
        _id: null,
        roles: { $sum: 1 },
        systemRoles: { $sum: { $cond: [{ $in: ['$name', ['SUPER_ADMIN', 'ADMIN', 'MANAGER']] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: roles.map(r => ({
        id: r._id,
        role: r.name || 'Unknown',
        users: 5, // Mocked as User.countDocuments({ role: r._id }) would be expensive
        permissions: r.permissions?.length || 0,
        createdBy: 'System',
        updated: r.updatedAt
      })),
      kpis: { ...(kpis[0] || { roles: 0, systemRoles: 0 }), usersAssigned: 145, customRoles: Math.max(0, (kpis[0]?.roles || 0) - (kpis[0]?.systemRoles || 0)) },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createRole = async (req, res) => {
  try {
    const newRole = new Role(req.body);
    await newRole.save();
    res.json({ success: true, data: newRole });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Role.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPermissions = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.resource = { $regex: search, $options: 'i' };
    const perms = await Permission.find(query).sort({ resource: 1 }).skip(skip).limit(limit).lean();
    const total = await Permission.countDocuments(query);
    res.json({
      success: true,
      data: perms.map(p => ({
        id: p._id,
        resource: p.resource || 'Unknown',
        action: p.action || 'Unknown',
        description: p.description || 'N/A'
      })),
      kpis: { permissions: total, modules: 24, roles: 6, restricted: 4 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPermission = async (req, res) => {
  try {
    const newPerm = new Permission(req.body);
    await newPerm.save();
    res.json({ success: true, data: newPerm });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Permission.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.action = { $regex: search, $options: 'i' };
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
    const total = await AuditLog.countDocuments(query);
    const kpis = await AuditLog.aggregate([
      { $group: {
        _id: null,
        failedActions: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: logs.map(l => ({
        id: l._id,
        timestamp: l.timestamp || l.createdAt,
        user: l.userId || 'System',
        action: l.action,
        module: l.entity || 'Unknown',
        ip: l.ipAddress || '0.0.0.0',
        result: l.status || 'SUCCESS'
      })),
      kpis: { ...(kpis[0] || { failedActions: 0 }), totalEvents: total, criticalEvents: 0, impersonationEvents: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.message = { $regex: search, $options: 'i' };
    const logs = await SystemLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await SystemLog.countDocuments(query);
    const kpis = await SystemLog.aggregate([
      { $group: {
        _id: null,
        criticalErrors: { $sum: { $cond: [{ $eq: ['$level', 'CRITICAL'] }, 1, 0] } },
        warnings: { $sum: { $cond: [{ $eq: ['$level', 'WARNING'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: logs.map(l => ({
        id: l._id,
        timestamp: l.createdAt,
        service: l.source,
        severity: l.level,
        message: l.message,
        status: 'UNRESOLVED'
      })),
      kpis: { ...(kpis[0] || { criticalErrors: 0, warnings: 0 }), errorsToday: total, resolved: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createSystemLog = async (req, res) => {
  try {
    const newLog = new SystemLog(req.body);
    await newLog.save();
    res.json({ success: true, data: newLog });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFraudCases = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const query = {};
    if (search) query.reason = { $regex: search, $options: 'i' };
    const cases = await FraudCase.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await FraudCase.countDocuments(query);
    const kpis = await FraudCase.aggregate([
      { $group: {
        _id: null,
        openCases: { $sum: { $cond: [{ $eq: ['$status', 'OPEN'] }, 1, 0] } },
        highRisk: { $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] } }
      }}
    ]);
    res.json({
      success: true,
      data: cases.map(c => ({
        id: c._id,
        caseId: c._id,
        user: c.userId || 'Unknown User',
        fraudType: c.reason,
        riskScore: c.severity === 'HIGH' || c.severity === 'CRITICAL' ? 90 : 50,
        status: c.status,
        investigator: 'Unassigned'
      })),
      kpis: { ...(kpis[0] || { openCases: 0, highRisk: 0 }), blockedAccounts: 0, resolvedCases: 0 },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createFraudCase = async (req, res) => {
  try {
    const data = { ...req.body };
    const mongoose = require('mongoose');

    if (data.userId && !mongoose.Types.ObjectId.isValid(data.userId)) {
      data.userId = new mongoose.Types.ObjectId();
    }
    if (data.orderId && !mongoose.Types.ObjectId.isValid(data.orderId)) {
      data.orderId = new mongoose.Types.ObjectId();
    }
    if (!data.reason) {
      data.reason = data.fraudType || 'Suspicious Activity';
    }

    const newCase = new FraudCase(data);
    await newCase.save();
    res.json({ success: true, data: newCase });
  } catch (err) { 
    console.error('Fraud Case creation error:', err);
    res.status(500).json({ success: false, message: err.message }); 
  }
};

exports.updateFraudCase = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await FraudCase.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: update });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPlatformHealth = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        services: [
          { name: 'MongoDB Cluster', status: 'Healthy', latency: '12ms', uptime: '99.99%' },
          { name: 'Redis Cache', status: 'Healthy', latency: '2ms', uptime: '100%' },
          { name: 'Stripe Gateway', status: 'Degraded', latency: '450ms', uptime: '98.5%' }
        ]
      },
      kpis: { uptime: '99.98%', latency: '45ms', errorRate: '0.01%', queueHealth: 'Optimal' },
      charts: {
        latencyTrend: [ { time: '10:00', value: 40 }, { time: '10:05', value: 42 }, { time: '10:10', value: 450 }, { time: '10:15', value: 45 } ]
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        general: { siteName: 'Local Shop Marketplace', timezone: 'Asia/Kolkata' },
        security: { require2FA: true, sessionTimeout: 30 },
        marketplace: { autoApproveSellers: false, globalCommission: 5 }
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getIntegrations = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const simulatedIntegrations = [
      { id: 'int-1', provider: 'Stripe', category: 'Payments', status: 'CONNECTED', environment: 'Production', lastSync: new Date() },
      { id: 'int-2', provider: 'Twilio', category: 'SMS', status: 'CONNECTED', environment: 'Production', lastSync: new Date() },
      { id: 'int-3', provider: 'Google Maps', category: 'Location', status: 'ERROR', environment: 'Production', lastSync: new Date(Date.now() - 86400000) }
    ];
    const filtered = simulatedIntegrations.filter(i => search ? i.provider.toLowerCase().includes(search.toLowerCase()) : true);
    const paginated = filtered.slice(skip, skip + limit);
    res.json({
      success: true,
      data: paginated,
      meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.generateReport = async (req, res) => {
  try {
    const { reportType, format } = req.body;
    
    let data = [];
    if (reportType === 'Orders') {
      const Order = require('../../models/Order');
      const orders = await Order.find().lean();
      data = orders.map(o => ({ OrderId: o.orderId || o._id, Status: o.status, Total: o.total || o.totalAmount || 0, Customer: o.customerName || 'Guest' }));
    } else if (reportType === 'Customers') {
      const User = require('../../models/User');
      const users = await User.find({ role: 'CUSTOMER' }).lean();
      data = users.map(u => ({ ID: u._id, Name: u.name, Email: u.email, Phone: u.phone || 'N/A', Status: u.status }));
    } else if (reportType === 'Fraud') {
      const FraudCase = require('../../models/FraudCase');
      const cases = await FraudCase.find().lean();
      data = cases.map(c => ({ ID: c._id, UserID: c.userId, Reason: c.reason, Severity: c.severity, Status: c.status }));
    } else if (reportType === 'Revenue') {
      const Order = require('../../models/Order');
      const orders = await Order.find({ status: 'delivered' }).lean();
      data = orders.map(o => ({ OrderId: o.orderId || o._id, Date: o.createdAt, Revenue: o.total || o.totalAmount || 0, Commission: (o.total || o.totalAmount || 0) * 0.1 }));
    } else if (reportType === 'Payouts') {
      const Payout = require('../../models/Payout');
      const payouts = await Payout.find().lean();
      data = payouts.map(p => ({ ID: p._id, ShopID: p.shopId, Amount: p.amount, Status: p.status, Date: p.createdAt }));
    }

    if (data.length === 0) {
      data = [{ Message: 'No data found for this report' }];
    }

    const fields = Object.keys(data[0]);
    const csv = [
      fields.join(','),
      ...data.map(row => fields.map(field => `"${(row[field] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}.csv`);
    return res.send(csv);

  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const sellers = await Shop.countDocuments({ isActive: true }) || await Shop.countDocuments();
    const customers = await User.countDocuments({ role: 'CUSTOMER' });
    const orders = await Order.countDocuments();
    
    // Sum GMV
    const completedOrders = await Order.find({ status: { $in: ['delivered', 'completed'] } }).select('total');
    let gmvValue = 0;
    completedOrders.forEach(o => {
      gmvValue += (o.total || 0);
    });

    const formatCurrency = (val) => {
      if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + 'Cr';
      if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + 'L';
      if (val >= 1000) return '₹' + (val / 1000).toFixed(1) + 'K';
      return '₹' + val.toFixed(0);
    };

    res.json({
      success: true,
      kpis: { 
        gmv: formatCurrency(gmvValue), 
        revenue: formatCurrency(gmvValue * 0.1), 
        orders, 
        customers, 
        sellers 
      },
      charts: {
        revenueTrend: [
          { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 }, { name: 'Wed', revenue: 5000 },
          { name: 'Thu', revenue: 2780 }, { name: 'Fri', revenue: 1890 }, { name: 'Sat', revenue: 2390 }, { name: 'Sun', revenue: 3490 }
        ]
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Fallbacks for profile if missing fields
    res.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.name?.split(' ')[0] || 'Admin',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role,
        status: user.status || 'Active',
        lastLogin: user.lastLogin || new Date(),
        designation: user.designation || 'Administrator',
        department: user.department || 'Operations',
        timezone: user.timezone || 'Asia/Kolkata',
        language: user.language || 'en-US',
        country: user.country || 'India',
        bio: user.bio || '',
        securityScore: user.twoFactorEnabled ? 95 : 60,
        passwordStrength: 'Strong',
        twoFactorEnabled: user.twoFactorEnabled || false,
        emailVerified: user.isVerified || false,
        sessionsProtected: true
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, designation, department } = req.body;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone, designation, department } },
      { new: true }
    );
    
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const bcrypt = require('bcrypt');

exports.updateAdminSecurity = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid current password' });
      
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Handle 2FA toggle
    if (typeof req.body.twoFactorEnabled === 'boolean') {
      user.twoFactorEnabled = req.body.twoFactorEnabled;
    }
    
    await user.save();
    res.json({ success: true, message: 'Security settings updated successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdminSessions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 'sess-1', device: 'MacBook Pro', browser: 'Chrome', ip: '192.168.1.100', location: 'New Delhi, India', lastActivity: new Date(), status: 'Active', current: true },
        { id: 'sess-2', device: 'iPhone 13', browser: 'Safari', ip: '117.234.12.9', location: 'Mumbai, India', lastActivity: new Date(Date.now() - 86400000), status: 'Active', current: false }
      ]
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteAdminSession = async (req, res) => {
  try {
    res.json({ success: true, message: `Session ${req.params.id} revoked successfully` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAdminActivity = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req);
    const mockActivity = [
      { id: 'act-1', date: new Date(), action: 'Profile Updated', module: 'Admin Profile', ip: '192.168.1.100', status: 'Success' },
      { id: 'act-2', date: new Date(Date.now() - 3600000), action: 'Login Success', module: 'Authentication', ip: '192.168.1.100', status: 'Success' },
      { id: 'act-3', date: new Date(Date.now() - 86400000 * 2), action: 'Password Changed', module: 'Security', ip: '192.168.1.100', status: 'Success' }
    ];
    res.json({
      success: true,
      data: mockActivity,
      meta: { total: 3, page, limit, totalPages: 1 }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAdminPreferences = async (req, res) => {
  try {
    res.json({ success: true, message: 'Preferences updated successfully', data: req.body });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
