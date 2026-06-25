const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/me', requireAuth, profileController.getProfile);
router.patch('/me', requireAuth, profileController.updateProfile);

module.exports = router;
