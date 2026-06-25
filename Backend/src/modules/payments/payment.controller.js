const paymentService = require('./payment.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
