const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');

router.get('/', reviewsController.getAll);
router.delete('/:id', reviewsController.delete);

module.exports = router;
