const fraudService = require('./fraud.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
