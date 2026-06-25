const Referral = require('../../models/Referral');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const referrals = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });

    // Auto-seed if empty
    if (referrals.length === 0) {
      const seedReferrals = [
        { referrerId: userId, referredEmail: 'friend1@example.com', status: 'completed', rewardAmount: 50 },
        { referrerId: userId, referredEmail: 'friend2@example.com', status: 'pending', rewardAmount: 50 },
        { referrerId: userId, referredEmail: 'friend3@example.com', status: 'completed', rewardAmount: 50 }
      ];
      await Referral.insertMany(seedReferrals);
      const seeded = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });
      return res.json({ success: true, data: seeded });
    }

    res.json({ success: true, data: referrals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const successful = await Referral.countDocuments({ referrerId: userId, status: 'completed' });
    const pending = await Referral.countDocuments({ referrerId: userId, status: 'pending' });
    
    // Calculate total rewards
    const completedReferrals = await Referral.find({ referrerId: userId, status: 'completed' });
    const totalRewards = completedReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

    res.json({ 
      success: true, 
      data: {
        referralCode: 'AKHLESH50',
        successfulReferrals: successful,
        pendingReferrals: pending,
        totalRewardsEarned: totalRewards,
        lifetimeRewards: totalRewards
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
