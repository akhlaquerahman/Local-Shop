const disputeService = require('./dispute.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
