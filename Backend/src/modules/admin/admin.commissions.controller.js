const GlobalCommissionRule = require('../../models/GlobalCommissionRule');
const CategoryCommission = require('../../models/CategoryCommission');
const SellerCommissionOverride = require('../../models/SellerCommissionOverride');
const PromotionalCommissionRule = require('../../models/PromotionalCommissionRule');
const DeliveryCommissionRule = require('../../models/DeliveryCommissionRule');
const CommissionHistory = require('../../models/CommissionHistory');
const CommissionAuditLog = require('../../models/CommissionAuditLog');
const CommissionEngineService = require('../../services/CommissionEngineService');
const Order = require('../../models/Order');

// Helper for logging
const logCommissionChange = async (adminId, ruleType, action, oldValue, newValue, reason) => {
  try {
    await CommissionHistory.create({
      ruleName: ruleType,
      oldValue,
      newValue,
      changedBy: adminId,
      reason
    });

    await CommissionAuditLog.create({
      adminId,
      action,
      oldValue,
      newValue,
      reason
    });
  } catch (err) {
    console.error('Failed to log commission change', err);
  }
};

// 1. DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    // Dummy KPIs for now
    const kpis = {
      totalCommissionEarned: 1250000,
      todayCommission: 45200,
      averageCommissionRate: 12.4,
      activeCommissionRules: await CategoryCommission.countDocuments({ status: 'ACTIVE' }),
      sellerSpecificOverrides: await SellerCommissionOverride.countDocuments({ status: 'ACTIVE' }),
      categoryRules: await CategoryCommission.countDocuments(),
      commissionDisputes: 4,
      revenueForecast: 1500000
    };

    res.json({ success: true, kpis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GLOBAL RULES
exports.getGlobalRule = async (req, res) => {
  try {
    let rule = await GlobalCommissionRule.findOne();
    if (!rule) rule = await GlobalCommissionRule.create({});
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateGlobalRule = async (req, res) => {
  try {
    let rule = await GlobalCommissionRule.findOne();
    const oldValue = rule ? rule.toObject() : null;
    
    if (!rule) {
      rule = await GlobalCommissionRule.create(req.body);
    } else {
      Object.assign(rule, req.body);
      await rule.save();
    }

    await logCommissionChange(req.user._id, 'GlobalCommissionRule', 'UPDATE_GLOBAL_RULE', oldValue, rule.toObject(), req.body.reason || 'Admin Update');
    
    res.json({ success: true, data: rule, message: 'Global rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. CATEGORY RULES
exports.getCategoryRules = async (req, res) => {
  try {
    const rules = await CategoryCommission.find().populate('categoryId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategoryRule = async (req, res) => {
  try {
    const rule = await CategoryCommission.create(req.body);
    await logCommissionChange(req.user._id, 'CategoryCommission', 'CREATE_CATEGORY_RULE', null, rule.toObject(), req.body.reason || 'New Rule');
    res.status(201).json({ success: true, data: rule, message: 'Category rule created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategoryRule = async (req, res) => {
  try {
    const rule = await CategoryCommission.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Not found' });

    const oldValue = rule.toObject();
    Object.assign(rule, req.body);
    await rule.save();

    await logCommissionChange(req.user._id, 'CategoryCommission', 'UPDATE_CATEGORY_RULE', oldValue, rule.toObject(), req.body.reason || 'Admin Update');
    res.json({ success: true, data: rule, message: 'Category rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategoryRule = async (req, res) => {
  try {
    const rule = await CategoryCommission.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Not found' });

    await logCommissionChange(req.user._id, 'CategoryCommission', 'DELETE_CATEGORY_RULE', rule.toObject(), null, 'Deleted by admin');
    res.json({ success: true, message: 'Category rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. SELLER OVERRIDES
exports.getSellerOverrides = async (req, res) => {
  try {
    const overrides = await SellerCommissionOverride.find()
      .populate('sellerId', 'name email shopName')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: overrides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSellerOverride = async (req, res) => {
  try {
    const override = await SellerCommissionOverride.create(req.body);
    await logCommissionChange(req.user._id, 'SellerCommissionOverride', 'CREATE_SELLER_OVERRIDE', null, override.toObject(), req.body.reason || 'New Override');
    res.status(201).json({ success: true, data: override, message: 'Seller override created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSellerOverride = async (req, res) => {
  try {
    const override = await SellerCommissionOverride.findById(req.params.id);
    if (!override) return res.status(404).json({ success: false, message: 'Not found' });

    const oldValue = override.toObject();
    Object.assign(override, req.body);
    await override.save();

    await logCommissionChange(req.user._id, 'SellerCommissionOverride', 'UPDATE_SELLER_OVERRIDE', oldValue, override.toObject(), req.body.reason || 'Admin Update');
    res.json({ success: true, data: override, message: 'Seller override updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSellerOverride = async (req, res) => {
  try {
    const override = await SellerCommissionOverride.findByIdAndDelete(req.params.id);
    if (!override) return res.status(404).json({ success: false, message: 'Not found' });

    await logCommissionChange(req.user._id, 'SellerCommissionOverride', 'DELETE_SELLER_OVERRIDE', override.toObject(), null, 'Deleted by admin');
    res.json({ success: true, message: 'Seller override deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. DELIVERY RULES
exports.getDeliveryRule = async (req, res) => {
  try {
    let rule = await DeliveryCommissionRule.findOne();
    if (!rule) rule = await DeliveryCommissionRule.create({});
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDeliveryRule = async (req, res) => {
  try {
    let rule = await DeliveryCommissionRule.findOne();
    const oldValue = rule ? rule.toObject() : null;
    
    if (!rule) {
      rule = await DeliveryCommissionRule.create(req.body);
    } else {
      Object.assign(rule, req.body);
      await rule.save();
    }

    await logCommissionChange(req.user._id, 'DeliveryCommissionRule', 'UPDATE_DELIVERY_RULE', oldValue, rule.toObject(), req.body.reason || 'Admin Update');
    res.json({ success: true, data: rule, message: 'Delivery rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. PROMOTIONAL RULES
exports.getPromotionalRules = async (req, res) => {
  try {
    const rules = await PromotionalCommissionRule.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPromotionalRule = async (req, res) => {
  try {
    const rule = await PromotionalCommissionRule.create(req.body);
    await logCommissionChange(req.user._id, 'PromotionalCommissionRule', 'CREATE_PROMOTIONAL_RULE', null, rule.toObject(), req.body.reason || 'New Promotion');
    res.status(201).json({ success: true, data: rule, message: 'Promotional rule created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePromotionalRule = async (req, res) => {
  try {
    const rule = await PromotionalCommissionRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Not found' });

    const oldValue = rule.toObject();
    Object.assign(rule, req.body);
    await rule.save();

    await logCommissionChange(req.user._id, 'PromotionalCommissionRule', 'UPDATE_PROMOTIONAL_RULE', oldValue, rule.toObject(), req.body.reason || 'Admin Update');
    res.json({ success: true, data: rule, message: 'Promotional rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePromotionalRule = async (req, res) => {
  try {
    const rule = await PromotionalCommissionRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Not found' });

    await logCommissionChange(req.user._id, 'PromotionalCommissionRule', 'DELETE_PROMOTIONAL_RULE', rule.toObject(), null, 'Deleted by admin');
    res.json({ success: true, message: 'Promotional rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. SIMULATOR
exports.simulateCommission = async (req, res) => {
  try {
    const { productPrice, categoryId, sellerId, shopId, deliveryFee } = req.body;
    
    const breakdown = await CommissionEngineService.calculateItemCommission(
      Number(productPrice) || 0,
      categoryId,
      sellerId,
      shopId
    );

    const deliveryBreakdown = await CommissionEngineService.calculateDeliverySplit(Number(deliveryFee) || 0);

    res.json({
      success: true,
      data: {
        item: breakdown,
        delivery: deliveryBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. HISTORY & AUDIT
exports.getHistory = async (req, res) => {
  try {
    const history = await CommissionHistory.find().populate('changedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await CommissionAuditLog.find().populate('adminId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
