const Category = require('../../models/Category');
const Shop = require('../../models/Shop');
const Product = require('../../models/Product');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getShopsBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    // Find active shops serving this category (case-insensitive regex match)
    const shops = await Shop.find({
      category: { $regex: new RegExp('^' + category.name + '$', 'i') }
    });
    
    res.json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductsBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    // Find products under this category (case-insensitive regex match)
    const products = await Product.find({
      category: { $regex: new RegExp('^' + category.name + '$', 'i') }
    });
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


