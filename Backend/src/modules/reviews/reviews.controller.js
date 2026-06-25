const Review = require('../../models/Review');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : '6a2d9dc24434dbc5c36eb603';
    let reviews = await Review.find({ userId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      const seed = [
        { userId, productId: 'p1', rating: 5, title: 'Excellent Quality', comment: 'The basmati rice is authentic and smells great.', targetName: 'Premium Basmati Rice', targetImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100' },
        { userId, shopId: 's1', rating: 4, title: 'Good Service', comment: 'Fast delivery from this shop.', targetName: 'Fresh Grocer - Sector 62' }
      ];
      await Review.insertMany(seed);
      reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    }

    const stats = {
      total: reviews.length,
      average: reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0,
      products: reviews.filter(r => r.productId).length,
      shops: reviews.filter(r => r.shopId).length
    };

    res.json({ success: true, data: reviews, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
