const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');

// Optional auth helper to check token but not fail if missing
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    } catch (err) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

router.get('/', optionalAuth, cartController.getCart);
router.post('/', optionalAuth, cartController.addItem);
router.put('/quantity', optionalAuth, cartController.updateQuantity);
router.post('/apply-coupon', optionalAuth, cartController.applyCoupon);
router.delete('/clear', optionalAuth, cartController.clear);
router.delete('/:productId', optionalAuth, cartController.removeItem);

module.exports = router;
