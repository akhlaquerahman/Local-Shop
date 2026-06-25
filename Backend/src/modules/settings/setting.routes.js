const express = require('express');
const router = express.Router();
const settingController = require('./setting.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, settingController.getAll);
router.patch('/', requireAuth, settingController.update);

module.exports = router;
