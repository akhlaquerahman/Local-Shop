const mongoose = require('mongoose');
const Promotion = require('../../models/Promotion');
const Order = require('../../models/Order');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

// ========================
// PROMOTIONS
// ========================

exports.getPromotions = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const promotions = await Promotion.find({ shopId: shopId }).sort({ createdAt: -1 });
    res.json({ success: true, data: promotions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const promotion = new Promotion({ ...req.body, shopId: shopId });
    await promotion.save();
    res.status(201).json({ success: true, data: promotion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const promotion = await Promotion.findOneAndUpdate(
      { _id: req.params.id, shopId: shopId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.json({ success: true, data: promotion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const promotion = await Promotion.findOneAndDelete({ _id: req.params.id, shopId: shopId });
    if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// MARKETING
// ========================

exports.getMarketingOverview = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    const stats = await Promotion.aggregate([
      { $match: { shopId: mongoose.Types.ObjectId(shopId) } },
      { $group: {
        _id: null,
        activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        scheduledCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'SCHEDULED'] }, 1, 0] } },
        revenueGenerated: { $sum: '$revenueGenerated' },
        totalReach: { $sum: '$reach' }
      }}
    ]);

    const data = stats[0] || { activeCampaigns: 0, scheduledCampaigns: 0, revenueGenerated: 0, totalReach: 0 };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMarketingActivity = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    
    // Fetch recently created/updated promotions as activity logs
    const activities = await Promotion.find({ shopId: shopId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('name status updatedAt type');

    const logs = activities.map(a => ({
      id: a._id,
      title: `Campaign ${a.status.toLowerCase()}`,
      description: `${a.name} (${a.type}) was marked as ${a.status}`,
      timestamp: a.updatedAt
    }));

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
