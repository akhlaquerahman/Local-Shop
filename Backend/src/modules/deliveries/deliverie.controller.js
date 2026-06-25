const deliverieService = require('./deliverie.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
