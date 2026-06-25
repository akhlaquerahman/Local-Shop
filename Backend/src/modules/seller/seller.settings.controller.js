const mongoose = require('mongoose');
const Shop = require('../../models/Shop');
const User = require('../../models/User');

const getSellerShopId = async (reqUser) => {
  if (reqUser.accountType === 'SELLER_STAFF' || reqUser.isStaff) return reqUser.shopId;
  const user = await User.findById(reqUser.id || reqUser._id);
  if (!user || !user.shopId) throw new Error('Seller shop not found');
  return user.shopId;
};

exports.getSettings = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const shopId = await getSellerShopId(req.user);
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
