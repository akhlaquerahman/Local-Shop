const bannerService = require('./banner.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
