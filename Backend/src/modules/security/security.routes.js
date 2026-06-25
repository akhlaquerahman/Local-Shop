const express = require('express');
const router = express.Router();
const securityController = require('./security.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/sessions', requireAuth, securityController.getSessions);
router.delete('/sessions/:id', requireAuth, securityController.deleteSession);
router.delete('/sessions', requireAuth, securityController.deleteAllSessions);
router.post('/change-password', requireAuth, securityController.changePassword);

module.exports = router;
