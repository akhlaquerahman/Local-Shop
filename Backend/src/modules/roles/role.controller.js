const roleService = require('./role.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
