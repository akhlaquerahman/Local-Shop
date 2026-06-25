const express = require('express');
const router = express.Router();
const addressesController = require('./addresses.controller');
const { requireAuth } = require('../../middleware/auth');

router.use(requireAuth);

router.get('/', addressesController.getAddresses);
router.post('/', addressesController.createAddress);
router.put('/:id', addressesController.updateAddress);
router.delete('/:id', addressesController.deleteAddress);
router.patch('/:id/default', addressesController.setDefaultAddress);

module.exports = router;
