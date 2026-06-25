const couponService = require('./coupon.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
