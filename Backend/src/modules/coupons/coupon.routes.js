const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller');

router.get('/', couponController.getAll);

module.exports = router;
