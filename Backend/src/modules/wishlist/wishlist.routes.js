const express = require('express');
const router = express.Router();
const wishlistController = require('./wishlist.controller');

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

router.get('/', optionalAuth, wishlistController.getAll);
router.post('/', optionalAuth, wishlistController.add);
router.delete('/', optionalAuth, wishlistController.remove);
router.delete('/clear', optionalAuth, wishlistController.clear);

module.exports = router;
