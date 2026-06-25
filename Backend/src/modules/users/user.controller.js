const userService = require('./user.service');
exports.getAll = async (req, res) => {
  res.json({ success: true, data: [] });
};
