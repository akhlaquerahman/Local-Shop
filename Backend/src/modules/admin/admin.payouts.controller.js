const mongoose = require('mongoose');
const User = require('../../models/User');
const Shop = require('../../models/Shop');
const Order = require('../../models/Order');
const Payout = require('../../models/Payout');
const SettlementLedger = require('../../models/SettlementLedger');
const PayoutBatch = require('../../models/PayoutBatch');
const AccountSuspension = require('../../models/AccountSuspension');
const FinancialAdjustment = require('../../models/FinancialAdjustment');
const AuditLog = require('../../models/AuditLog');
// Utility for parsing pagination and search
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  return { page, limit, skip, search };
};
// Helper to log audit events
const logAudit = async (userId, action, description, changes = {}) => {
  try {
    await AuditLog.create({
      user: userId,
      role: 'SUPER_ADMIN',
      action,
      description,
      details: changes
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// 1. GET /v1/admin/payouts
// Fetches a paginated list of Sellers and Riders aggregated with their financial data.
exports.getAll = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req);
    const { accountType, kycStatus, bankStatus, accountStatus } = req.query;

    const query = { role: { $in: ['SELLER', 'DELIVERY_PARTNER'] } };
    
    if (accountType) {
      query.role = accountType === 'SELLER' ? 'SELLER' : 'DELIVERY_PARTNER';
    }
    if (kycStatus) query.kycStatus = kycStatus;
    if (bankStatus) query.bankStatus = bankStatus;
    if (accountStatus) query.status = accountStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await User.countDocuments(query);

    // Fetch aggregates for these users
    const userIds = users.map(u => u._id);
    
    // We can aggregate from the SettlementLedger
    const ledgers = await SettlementLedger.aggregate([
      { $match: { accountId: { $in: userIds } } },
      { $group: {
        _id: '$accountId',
        totalRevenue: { 
          $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_REVENUE'] }, '$amount', 0] } 
        },
        platformCommission: { 
          $sum: { $cond: [{ $in: ['$transactionType', ['DEBIT_COMMISSION', 'DEBIT_PENALTY']] }, '$amount', 0] } 
        },
        totalPayouts: { 
          $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_PAYOUT'] }, '$amount', 0] } 
        }
      }}
    ]);

    const ledgerMap = ledgers.reduce((acc, l) => {
      acc[l._id.toString()] = l;
      return acc;
    }, {});

    const enrichedUsers = users.map(user => {
      const ledger = ledgerMap[user._id.toString()] || { totalRevenue: 0, platformCommission: 0, totalPayouts: 0 };
      const netEarnings = ledger.totalRevenue - ledger.platformCommission;
      const pendingPayout = netEarnings - ledger.totalPayouts;
      
      return {
        id: user._id,
        accountType: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        shopName: user.shopName || 'N/A',
        vehicle: user.vehicleType || 'N/A',
        totalRevenue: ledger.totalRevenue,
        platformCommission: ledger.platformCommission,
        netEarnings,
        pendingPayout,
        lastPayoutDate: user.updatedAt, // Mocked for now, should come from Payout collection
        kycStatus: user.kycStatus || 'PENDING',
        bankStatus: user.bankStatus || 'PENDING',
        accountStatus: user.status
      };
    });

    // Compute KPIs
    const allUsers = await User.find({ role: { $in: ['SELLER', 'DELIVERY_PARTNER'] } }).lean();
    const allUserIds = allUsers.map(u => u._id);
    
    const allLedgers = await SettlementLedger.aggregate([
      { $group: {
        _id: '$accountId',
        totalRevenue: { $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_REVENUE'] }, '$amount', 0] } },
        platformCommission: { $sum: { $cond: [{ $in: ['$transactionType', ['DEBIT_COMMISSION', 'DEBIT_PENALTY']] }, '$amount', 0] } },
        totalPayouts: { $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_PAYOUT'] }, '$amount', 0] } }
      }}
    ]);

    let totalPending = 0;
    let sellerPending = 0;
    let riderPending = 0;

    const userRoleMap = allUsers.reduce((acc, u) => {
      acc[u._id.toString()] = u.role;
      return acc;
    }, {});

    allLedgers.forEach(l => {
      const role = userRoleMap[l._id.toString()];
      const pending = (l.totalRevenue - l.platformCommission) - l.totalPayouts;
      if (pending > 0) {
        totalPending += pending;
        if (role === 'SELLER') sellerPending += pending;
        else if (role === 'DELIVERY_PARTNER') riderPending += pending;
      }
    });

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const paidThisMonth = await SettlementLedger.aggregate([
      { $match: { transactionType: 'CREDIT_PAYOUT', timestamp: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const suspendedAccounts = await User.countDocuments({ status: 'SUSPENDED' });
    const pendingKyc = await User.countDocuments({ role: { $in: ['SELLER', 'DELIVERY_PARTNER'] }, kycStatus: 'PENDING' });

    res.json({
      success: true,
      data: enrichedUsers,
      kpis: {
        totalPendingPayouts: totalPending,
        sellerPendingPayouts: sellerPending,
        riderPendingPayouts: riderPending,
        totalPaidThisMonth: paidThisMonth[0]?.total || 0,
        suspendedAccounts,
        pendingKycVerification: pendingKyc,
        failedSettlements: 0,
        averageSettlementTime: 2.5
      },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GET /v1/admin/payouts/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    const ledgers = await SettlementLedger.aggregate([
      { $match: { accountId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_REVENUE'] }, '$amount', 0] } },
        platformCommission: { $sum: { $cond: [{ $in: ['$transactionType', ['DEBIT_COMMISSION', 'DEBIT_PENALTY']] }, '$amount', 0] } },
        totalPayouts: { $sum: { $cond: [{ $eq: ['$transactionType', 'CREDIT_PAYOUT'] }, '$amount', 0] } }
      }}
    ]);

    const l = ledgers[0] || { totalRevenue: 0, platformCommission: 0, totalPayouts: 0 };
    const netEarnings = l.totalRevenue - l.platformCommission;
    const pendingPayout = netEarnings - l.totalPayouts;

    const totalOrders = await Order.countDocuments({ shopId: user.shopId });
    const refunds = 0; // Mock

    res.json({
      success: true,
      data: {
        ...user,
        financials: {
          totalRevenue: l.totalRevenue,
          platformCommission: l.platformCommission,
          netEarnings,
          pendingPayout,
          paidSettlement: l.totalPayouts,
          totalOrders,
          refundDeductions: refunds
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. GET /v1/admin/payouts/ledger/:id
exports.getLedger = async (req, res) => {
  try {
    const ledger = await SettlementLedger.find({ accountId: req.params.id }).sort({ timestamp: -1 });
    res.json({ success: true, data: ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. POST /v1/admin/payouts/suspend
exports.suspendAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description, suspendedUntil } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    user.status = 'SUSPENDED';
    await user.save();

    if (user.role === 'SELLER' && user.shopId) {
      await Shop.findByIdAndUpdate(user.shopId, { status: 'Inactive', isActive: false });
    }

    await AccountSuspension.create({
      accountId: user._id,
      reason,
      description,
      suspendedUntil,
      suspendedBy: req.user?._id
    });

    await logAudit(req.user?._id, 'ACCOUNT_SUSPENDED', `Suspended ${user.role} ${user._id}`, { reason });

    res.json({ success: true, message: 'Account Suspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. POST /v1/admin/payouts/activate
exports.activateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    user.status = 'ACTIVE';
    await user.save();

    if (user.role === 'SELLER' && user.shopId) {
      await Shop.findByIdAndUpdate(user.shopId, { status: 'Active', isActive: true });
    }

    await AccountSuspension.updateMany({ accountId: user._id, status: 'ACTIVE' }, { status: 'LIFTED' });

    await logAudit(req.user?._id, 'ACCOUNT_ACTIVATED', `Activated ${user.role} ${user._id}`);

    res.json({ success: true, message: 'Account Activated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. POST /v1/admin/payouts/approve
exports.approvePayout = async (req, res) => {
  try {
    const { id, amount } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Deduct pending balance by adding a CREDIT_PAYOUT to SettlementLedger
    await SettlementLedger.create({
      accountId: user._id,
      accountType: user.role,
      transactionType: 'CREDIT_PAYOUT',
      amount: amount,
      description: 'Manual Payout Approval',
      referenceId: `PAYOUT-${Date.now()}`
    });

    await logAudit(req.user?._id, 'PAYOUT_APPROVED', `Approved payout of ₹${amount} for ${user._id}`);
    res.json({ success: true, message: 'Payout Approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. POST /v1/admin/payouts/run-batch
exports.runBatch = async (req, res) => {
  try {
    // Dummy batch run logic for now
    const batchId = `BATCH-${Date.now()}`;
    await PayoutBatch.create({
      batchId,
      totalAmount: 0,
      totalAccounts: 0,
      status: 'GENERATED',
      processedBy: req.user?._id
    });
    
    await logAudit(req.user?._id, 'BATCH_PAYOUT_RUN', `Generated Batch ${batchId}`);
    res.json({ success: true, message: 'Batch Generated', batchId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
