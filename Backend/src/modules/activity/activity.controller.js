const ActivityLog = require('../../models/ActivityLog');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    const { category } = req.query;
    
    let query = { userId };
    if (category && category !== 'All') {
      query.category = category;
    }

    let logs = await ActivityLog.find(query).sort({ createdAt: -1 });

    if (logs.length === 0 && (!category || category === 'All')) {
      const seed = [
        { userId, event: 'Login', category: 'Security', description: 'Logged in from new device (Windows PC)' },
        { userId, event: 'Order Placed', category: 'Orders', description: 'Order #ORD-2026-4591 placed successfully' },
        { userId, event: 'Profile Updated', category: 'Profile', description: 'Changed profile avatar' },
        { userId, event: 'Payment Method Added', category: 'Payments', description: 'Added new HDFC Credit Card' }
      ];
      await ActivityLog.insertMany(seed);
      logs = await ActivityLog.find(query).sort({ createdAt: -1 });
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
