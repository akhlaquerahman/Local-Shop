const express = require('express');
const router = express.Router();
const returnsController = require('./returns.controller');
const { requireAuth } = require('../../middleware/auth');

router.post('/', requireAuth, returnsController.createReturn);
router.post('/cancellations', requireAuth, returnsController.createCancellation);
router.get('/my', requireAuth, returnsController.getReturns);
router.get('/:id', requireAuth, returnsController.getReturnById);

module.exports = router;
