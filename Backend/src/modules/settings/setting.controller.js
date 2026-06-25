const Setting = require('../../models/Setting');

const seedSettings = async (userId) => {
  let setting = await Setting.findOne({ userId });
  if (!setting) {
    setting = new Setting({ userId });
    await setting.save();
  }
  return setting;
};

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    const setting = await seedSettings(userId);
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    // Use findOneAndUpdate with upsert to create or update
    const setting = await Setting.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
