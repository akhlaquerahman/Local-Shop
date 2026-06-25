const Coupon = require('../../models/Coupon');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const coupons = await Coupon.find();

    // Auto-seed if empty
    if (coupons.length === 0) {
      const seedCoupons = [
        { code: 'WELCOME50', discountAmount: 50, minOrderAmount: 200, expiryDate: new Date('2026-12-31'), usageConditions: 'Valid on first order only.' },
        { code: 'FRESH10', discountAmount: 10, minOrderAmount: 100, expiryDate: new Date('2026-06-30'), usageConditions: 'Valid on fresh produce.' },
        { code: 'SAVE20', discountAmount: 20, minOrderAmount: 500, expiryDate: new Date('2026-05-01'), isActive: false, usageConditions: 'Valid on orders above ₹500.' }
      ];
      await Coupon.insertMany(seedCoupons);
      const seeded = await Coupon.find();
      return res.json({ success: true, data: seeded });
    }

    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAvailable = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const coupons = await Coupon.find({ 
      isActive: true, 
      expiryDate: { $gte: new Date() },
      usersUsed: { $ne: userId }
    });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsed = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const coupons = await Coupon.find({ usersUsed: userId });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExpired = async (req, res) => {
  try {
    const coupons = await Coupon.find({ expiryDate: { $lt: new Date() } });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
