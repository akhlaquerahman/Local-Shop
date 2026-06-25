const Banner = require('../../models/Banner');

exports.getAllBanners = async (req, res) => {
  try {
    const { position, status } = req.query;
    
    let query = {};
    if (position) query.position = position;
    if (status === 'ACTIVE') query.isActive = true;
    if (status === 'INACTIVE') query.isActive = false;

    const banners = await Banner.find(query).sort({ position: 1, sortOrder: 1, createdAt: -1 });
    
    // Also return some quick stats
    const stats = {
      total: await Banner.countDocuments(),
      active: await Banner.countDocuments({ isActive: true }),
      hero: await Banner.countDocuments({ position: 'HERO_SLIDER' })
    };

    res.json({
      success: true,
      data: banners,
      stats
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    
    banner.isActive = !banner.isActive;
    await banner.save();
    
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
