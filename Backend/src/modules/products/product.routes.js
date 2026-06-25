const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/', productController.getAll);
router.get('/deals', productController.getDeals);
router.get('/recommended', productController.getRecommended);

module.exports = router;

