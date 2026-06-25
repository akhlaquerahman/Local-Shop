const Shop = require('../../models/Shop');

function isShopOpen(shop) {
  if (!shop.operatingHours) return true;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const [openH, openM] = shop.operatingHours.open.split(':').map(Number);
  const [closeH, closeM] = shop.operatingHours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;
  
  const dayOpen = shop.operatingHours.daysOpen.includes(now.getDay());
  return dayOpen && currentTime >= openTime && currentTime <= closeTime;
}

exports.getAll = async (req, res) => {
  try {
    const { category, minRating, openOnly } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp('^' + category + '$', 'i') };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    let shops = await Shop.find(query);

    if (openOnly === 'true') {
      shops = shops.filter(s => isShopOpen(s));
    }

    res.json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getFeatured = async (req, res) => {
  try {
    const shops = await Shop.find({ isFeatured: true, status: 'active' });
    res.json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    let query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      },
      status: 'active'
    };

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp('^' + category + '$', 'i') };
    }

    const shops = await Shop.find(query);
    res.json({ success: true, data: shops });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchLocation = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
      headers: { 'User-Agent': 'LocalShopMarketplace/1.0' }
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Lat and Lng are required' });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'User-Agent': 'LocalShopMarketplace/1.0' }
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

