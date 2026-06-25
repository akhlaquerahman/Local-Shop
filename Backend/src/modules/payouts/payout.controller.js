const payoutService = require('./payout.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
