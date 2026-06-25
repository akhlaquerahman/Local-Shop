const express = require('express');
const router = express.Router();
const activityController = require('./activity.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, activityController.getAll);

module.exports = router;
