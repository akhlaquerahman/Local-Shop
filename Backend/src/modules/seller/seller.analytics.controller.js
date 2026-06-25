const mongoose = require('mongoose');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

// ========================
// SELLER ANALYTICS DASHBOARD
// ========================

exports.getOverview = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Aggregate overall metrics
    const stats = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid' } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        orders: { $sum: 1 },
        customers: { $addToSet: '$customerId' },
        refunds: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }}
    ]);

    const data = stats[0] || { totalRevenue: 0, orders: 0, customers: [], refunds: 0 };
    const customerCount = data.customers ? data.customers.length : 0;
    const aov = data.orders > 0 ? (data.totalRevenue / data.orders) : 0;
    const refundRate = data.orders > 0 ? ((data.refunds / data.orders) * 100).toFixed(2) : 0;

    res.json({ 
      success: true, 
      data: { 
        totalRevenue: data.totalRevenue, 
        orders: data.orders, 
        customers: customerCount, 
        averageOrderValue: aov, 
        conversionRate: 2.4, // Mocked overall conversion since total views aren't aggregated site-wide easily
        refundRate: parseFloat(refundRate)
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Aggregate by day for last 7 days (simplified for now, ideally parameterized)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: '$total' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: trend.map(t => ({ date: t._id, revenue: t.revenue })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrdersTrend = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await Order.aggregate([
      { $match: { shopId: shopId.toString(), createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: trend.map(t => ({ date: t._id, orders: t.orders })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// PRODUCT ANALYTICS
// ========================

exports.getProductAnalytics = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Get product stats
    const products = await Product.find({ shopId: shopId });
    
    // We also need orders per product. This requires unwinding Order items
    const productSales = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.productId',
        orders: { $sum: 1 },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }}
    ]);

    const salesMap = {};
    productSales.forEach(ps => salesMap[ps._id] = ps);

    let totalViews = 0;
    let totalCarts = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    const tableData = products.map(p => {
      const sales = salesMap[p._id.toString()] || { orders: 0, revenue: 0 };
      const views = p.views || 0;
      const cartAdds = p.cartAdds || 0;
      
      totalViews += views;
      totalCarts += cartAdds;
      totalOrders += sales.orders;
      totalRevenue += sales.revenue;

      return {
        id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        views: views,
        cartAdds: cartAdds,
        orders: sales.orders,
        revenue: sales.revenue,
        conversionRate: views > 0 ? ((sales.orders / views) * 100).toFixed(2) : 0
      };
    });

    const kpi = {
      views: totalViews,
      cartAdds: totalCarts,
      orders: totalOrders,
      revenue: totalRevenue,
      conversionRate: totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : 0
    };

    res.json({ success: true, data: { kpi, table: tableData.sort((a,b) => b.revenue - a.revenue) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// CUSTOMER ANALYTICS
// ========================

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    const customersAgg = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid' } },
      { $group: {
        _id: '$customerId',
        customerName: { $first: '$customerName' },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
        lastOrderDate: { $max: '$createdAt' }
      }},
      { $sort: { revenue: -1 } }
    ]);

    let returning = 0;
    let newCust = 0;
    let lifetimeRev = 0;

    const tableData = customersAgg.map(c => {
      if (c.orders > 1) returning++;
      else newCust++;
      lifetimeRev += c.revenue;

      return {
        customerId: c._id,
        name: c.customerName,
        orders: c.orders,
        revenue: c.revenue,
        lastOrderDate: c.lastOrderDate,
        status: c.orders > 1 ? 'Returning' : 'New'
      };
    });

    const totalCustomers = returning + newCust;
    const clv = totalCustomers > 0 ? (lifetimeRev / totalCustomers).toFixed(2) : 0;
    const repeatRate = totalCustomers > 0 ? ((returning / totalCustomers) * 100).toFixed(2) : 0;

    const kpi = {
      totalCustomers,
      newCustomers: newCust,
      returningCustomers: returning,
      customerLifetimeValue: clv,
      repeatPurchaseRate: repeatRate
    };

    res.json({ success: true, data: { kpi, table: tableData } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
