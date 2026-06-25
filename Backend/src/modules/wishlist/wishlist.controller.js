const Wishlist = require('../../models/Wishlist');
const Product = require('../../models/Product');

// Get all wishlist items populated with product details
exports.getAll = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const wishlistItems = await Wishlist.find({ userId });
    
    // Fetch product details for each favorited product
    const productIds = wishlistItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add product to wishlist
exports.add = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    
    // Use upsert to avoid duplicate keys error
    await Wishlist.findOneAndUpdate(
      { userId, productId },
      { createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove a specific product from wishlist
exports.remove = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    
    await Wishlist.deleteOne({ userId, productId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear all items in wishlist
exports.clear = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    await Wishlist.deleteMany({ userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
