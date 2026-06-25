const express = require('express');
const router = express.Router();
const couponsController = require('./coupons.controller');

router.get('/', couponsController.getAll);
router.get('/available', couponsController.getAvailable);
router.get('/used', couponsController.getUsed);
router.get('/expired', couponsController.getExpired);

module.exports = router;
