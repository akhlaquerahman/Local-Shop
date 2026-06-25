const Notification = require('../../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearRead = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    await Notification.deleteMany({ userId, isRead: true });
    res.json({ success: true, message: 'Read notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
