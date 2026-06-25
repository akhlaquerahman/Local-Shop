const mongoose = require('mongoose');
const Review = require('../../models/Review');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

exports.getReviews = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const filter = { shopId: shopId };
    
    if (req.query.rating) filter.rating = Number(req.query.rating);
    if (req.query.replyStatus) filter.replyStatus = req.query.replyStatus;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    // Calculate Stats
    const stats = await Review.aggregate([
      { $match: { shopId: String(shopId) } },
      { $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        pendingReplies: { $sum: { $cond: [{ $eq: ['$replyStatus', 'pending'] }, 1, 0] } },
        negativeReviews: { $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] } }
      }}
    ]);

    const dataStats = stats[0] || { averageRating: 0, totalReviews: 0, pendingReplies: 0, negativeReviews: 0 };

    res.json({ success: true, data: { reviews, stats: dataStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const { reviewId, reply } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, shopId: shopId },
      { $set: { sellerReply: reply, replyStatus: 'replied' } },
      { new: true }
    );

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
