const express = require('express');
const router = express.Router();
const paymentsController = require('./payments.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, paymentsController.getAll);
router.post('/', requireAuth, paymentsController.create);
router.delete('/:id', requireAuth, paymentsController.delete);
router.patch('/:id/default', requireAuth, paymentsController.setDefault);

module.exports = router;
