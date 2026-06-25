const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, notificationController.getAll);
router.patch('/read', requireAuth, notificationController.markAllRead);
router.patch('/:id/read', requireAuth, notificationController.markRead);
router.delete('/read', requireAuth, notificationController.clearRead);

module.exports = router;
