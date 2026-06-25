const permissionService = require('./permission.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
