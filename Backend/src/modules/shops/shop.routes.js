const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');

router.get('/', shopController.getAll);
router.get('/featured', shopController.getFeatured);
router.get('/nearby', shopController.getNearby);
router.get('/search-location', shopController.searchLocation);
router.get('/reverse-geocode', shopController.reverseGeocode);

module.exports = router;

