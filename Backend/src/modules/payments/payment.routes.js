const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

router.get('/', paymentController.getAll);

module.exports = router;
