const express = require('express');
const router = express.Router();
const referralsController = require('./referrals.controller');

router.get('/', referralsController.getAll);
router.get('/stats', referralsController.getStats);

module.exports = router;
