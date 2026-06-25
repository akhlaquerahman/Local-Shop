const Cart = require('../../models/Cart');
const Coupon = require('../../models/Coupon');

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = { userId, items: [], shopId: null, shopName: null };
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add item to cart (with hyperlocal checks)
exports.addItem = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { shopId, shopName, item } = req.body;
    
    if (!shopId || !item || !item.productId) {
      return res.status(400).json({ success: false, error: 'shopId, shopName and item with productId are required' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        shopId,
        shopName,
        items: [item]
      });
    } else {
      // Hyperlocal check: if shopId is different, clear previous items and start fresh
      if (cart.shopId && cart.shopId !== shopId) {
        cart.shopId = shopId;
        cart.shopName = shopName;
        cart.items = [item];
      } else {
        // Same shop or first shop: check if item already exists
        const existingIndex = cart.items.findIndex(i => i.productId === item.productId);
        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += item.quantity || 1;
        } else {
          cart.items.push(item);
        }
        cart.shopId = shopId;
        cart.shopName = shopName;
      }
    }
    
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update quantity of a specific item
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'productId and quantity are required' });
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      const itemIndex = cart.items.findIndex(i => i.productId === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        return res.status(404).json({ success: false, error: 'Item not found in cart' });
      }
    }
    
    // If cart is empty, clear shop info
    if (cart.items.length === 0) {
      cart.shopId = null;
      cart.shopName = null;
    }
    
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove a specific product from cart
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(i => i.productId !== productId);
    
    if (cart.items.length === 0) {
      cart.shopId = null;
      cart.shopName = null;
    }
    
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear all items in cart
exports.clear = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    let cart = await Cart.findOne({ userId });
    
    if (cart) {
      cart.items = [];
      cart.shopId = null;
      cart.shopName = null;
      await cart.save();
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply Coupon validation
exports.applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(400).json({ success: false, error: 'Invalid or expired coupon code' });
    }
    
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({ success: false, error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` });
    }
    
    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        description: coupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
