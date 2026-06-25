const cmService = require('./cm.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
