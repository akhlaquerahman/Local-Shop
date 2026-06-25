const express = require('express');
const router = express.Router();
const kycController = require('./kyc.controller');
const { requireAuth } = require('../../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.use(requireAuth);

router.post('/upload', upload.fields([{ name: 'frontImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), kycController.uploadDocument);
router.get('/my-documents', kycController.getMyDocuments);
router.put('/reupload/:id', upload.fields([{ name: 'frontImage', maxCount: 1 }, { name: 'backImage', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), kycController.reuploadDocument);

module.exports = router;
