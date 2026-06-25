const analyticService = require('./analytic.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
