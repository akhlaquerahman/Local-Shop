const express = require('express');
const router = express.Router();
const payoutController = require('./payout.controller');

router.get('/', payoutController.getAll);

module.exports = router;
