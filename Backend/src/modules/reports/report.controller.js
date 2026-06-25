const reportService = require('./report.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
