const SearchHistory = require('../../models/SearchHistory');
const Product = require('../../models/Product');
const Shop = require('../../models/Shop');
const Category = require('../../models/Category');

exports.getSuggestions = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json({ success: true, data: { products: [], shops: [], categories: [] } });
    }

    const [products, shops, categories] = await Promise.all([
      Product.find({ name: { $regex: q, $options: 'i' } }).limit(5),
      Shop.find({ name: { $regex: q, $options: 'i' } }).limit(5),
      Category.find({ name: { $regex: q, $options: 'i' } }).limit(5)
    ]);

    res.json({
      success: true,
      data: { products, shops, categories }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const histories = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6);
    
    const terms = histories.map(h => h.term);
    res.json({ success: true, data: terms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addRecent = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { term } = req.body;
    if (!term || !term.trim()) {
      return res.status(400).json({ success: false, error: 'Term is required' });
    }

    await SearchHistory.findOneAndUpdate(
      { userId, term: term.trim() },
      { createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRecent = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { term } = req.query;
    if (!term) {
      return res.status(400).json({ success: false, error: 'Term is required' });
    }

    await SearchHistory.deleteOne({ userId, term });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    // Return seeded list of popular / trending searches
    const trending = [
      'Organic Tomato',
      'Buffalo Milk',
      'Premium Basmati Rice',
      'Chocolate Sourdough Croissant',
      'Groceries',
      'Bakery'
    ];
    res.json({ success: true, data: trending });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    
    // Save to search history if there is a query term
    if (q.trim()) {
      await SearchHistory.findOneAndUpdate(
        { userId, term: q.trim() },
        { createdAt: new Date() },
        { upsert: true }
      ).catch(err => console.error('Error saving search history:', err.message));
    }

    const [products, shops, categories] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }),
      Shop.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }),
      Category.find({
        $or: [
          { name: { $regex: q, $options: 'i' } }
        ]
      })
    ]);

    res.json({
      success: true,
      data: { products, shops, categories }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
