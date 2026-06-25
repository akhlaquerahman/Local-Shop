const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const { requireAuth } = require('../../middleware/auth');

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

router.get('/', optionalAuth, searchController.search);
router.get('/suggestions', searchController.getSuggestions);
router.get('/recent', optionalAuth, searchController.getRecent);
router.post('/recent', optionalAuth, searchController.addRecent);
router.delete('/recent', optionalAuth, searchController.deleteRecent);
router.get('/trending', searchController.getTrending);

module.exports = router;
