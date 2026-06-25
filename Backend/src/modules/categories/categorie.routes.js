const express = require('express');
const router = express.Router();
const categorieController = require('./categorie.controller');

router.get('/', categorieController.getAll);
router.get('/:slug', categorieController.getBySlug);
router.get('/:slug/shops', categorieController.getShopsBySlug);
router.get('/:slug/products', categorieController.getProductsBySlug);

module.exports = router;

