const express = require('express');
const router = express.Router();
const adminKycController = require('./admin.kyc.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// Apply protect and authorize middleware for all admin routes
router.use(requireAuth);
router.use(requireRole(['SUPER_ADMIN', 'ADMIN']));

router.get('/', adminKycController.getAllKyc);
router.get('/:id', adminKycController.getKycById);
router.put('/approve/:id', adminKycController.approveKyc);
router.put('/reject/:id', adminKycController.rejectKyc);
router.put('/reupload/:id', adminKycController.requestReupload);

module.exports = router;
