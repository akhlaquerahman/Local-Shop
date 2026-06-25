const User = require('../../models/User');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized: No user ID found in token' });
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found in database' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
