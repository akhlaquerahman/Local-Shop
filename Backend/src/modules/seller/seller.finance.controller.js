const mongoose = require('mongoose');
const Order = require('../../models/Order');
const Payout = require('../../models/Payout');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

// ========================
// REVENUE
// ========================

exports.getRevenueOverview = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    const stats = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid' } },
      { $group: {
        _id: null,
        grossRevenue: { $sum: '$total' },
        refunds: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, '$total', 0] } }
      }}
    ]);

    const data = stats[0] || { grossRevenue: 0, refunds: 0 };
    const commissionRate = 0.05; // 5% marketplace commission
    const commissionDeducted = data.grossRevenue * commissionRate;
    const taxes = data.grossRevenue * 0.18; // 18% tax example
    const netRevenue = data.grossRevenue - commissionDeducted - data.refunds - taxes;

    res.json({ 
      success: true, 
      data: {
        grossRevenue: data.grossRevenue,
        netRevenue: netRevenue,
        commissionDeducted: commissionDeducted,
        refundAmount: data.refunds,
        taxes: taxes,
        pendingSettlement: netRevenue * 0.2 // Mock pending portion
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await Order.aggregate([
      { $match: { shopId: shopId.toString(), paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: trend.map(t => ({ date: t._id, revenue: t.revenue, orders: t.orders })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const transactions = await Order.find({ shopId: shopId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('orderId customerName total status paymentStatus createdAt paymentMethod');
    
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// PAYOUTS
// ========================

exports.getPayouts = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const payouts = await Payout.find({ shopId: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: payouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayoutSummary = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Aggregate payouts
    const stats = await Payout.aggregate([
      { $match: { shopId: mongoose.Types.ObjectId(shopId) } },
      { $group: {
        _id: '$status',
        total: { $sum: '$amount' }
      }}
    ]);

    let settled = 0;
    let pending = 0;
    stats.forEach(s => {
      if (s._id === 'SETTLED') settled += s.total;
      if (s._id === 'PENDING' || s._id === 'PROCESSING') pending += s.total;
    });

    res.json({ 
      success: true, 
      data: {
        availableBalance: 12500, // Example calculation logic would go here based on un-payout'd orders
        pendingBalance: pending,
        settledAmount: settled,
        nextPayoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestPayout = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user.id || req.user._id);
    const payout = new Payout({
      shopId: shopId,
      amount: req.body.amount,
      bankAccount: req.body.bankAccount,
      status: 'PENDING'
    });
    await payout.save();
    res.status(201).json({ success: true, data: payout });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
