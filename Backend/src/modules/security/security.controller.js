const SecuritySession = require('../../models/SecuritySession');

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    let sessions = await SecuritySession.find({ userId }).sort({ lastActive: -1 });

    if (sessions.length === 0) {
      const seed = [
        { userId, device: 'Windows PC', browser: 'Chrome', location: 'Noida, UP', ipAddress: '192.168.1.5' },
        { userId, device: 'iPhone 13', browser: 'Safari', location: 'Delhi, India', ipAddress: '10.0.0.2', lastActive: new Date(Date.now() - 86400000) }
      ];
      await SecuritySession.insertMany(seed);
      sessions = await SecuritySession.find({ userId }).sort({ lastActive: -1 });
    }

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await SecuritySession.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAllSessions = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    // Keep the current session (simulated by keeping the newest one)
    const latest = await SecuritySession.findOne({ userId }).sort({ lastActive: -1 });
    if (latest) {
      await SecuritySession.deleteMany({ userId, _id: { $ne: latest._id } });
    }
    res.json({ success: true, message: 'All other sessions terminated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const User = require('../../models/User');
const bcrypt = require('bcrypt');

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id || req.user.userId) : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
       return res.status(400).json({ success: false, error: 'Passwords required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
