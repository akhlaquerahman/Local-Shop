const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { requireAuth } = require('../../middleware/auth');

router.post('/product', requireAuth, reviewController.createProductReview);
router.post('/shop', requireAuth, reviewController.createShopReview);
router.post('/rider', requireAuth, reviewController.createRiderReview);
router.get('/customer', requireAuth, reviewController.getCustomerReviews);
router.get('/product/:id', reviewController.getProductReviews);
router.get('/shop/:id', reviewController.getShopReviews);
router.patch('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);

module.exports = router;
