const Product = require('../../models/Product');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.find({}).populate('shopId', 'name');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDeals = async (req, res) => {
  try {
    const deals = await Product.find({ isDeal: true }).populate('shopId', 'name');
    res.json({ success: true, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommended = async (req, res) => {
  try {
    // Recommendations that are not deals to prevent duplication
    let recommended = await Product.find({ isRecommended: true, isDeal: false }).populate('shopId', 'name');
    
    // Fallback if empty: products that are not deals
    if (recommended.length === 0) {
      recommended = await Product.find({ isDeal: false }).limit(4).populate('shopId', 'name');
    }
    
    res.json({ success: true, data: recommended });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

