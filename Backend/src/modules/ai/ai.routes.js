const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('./ai.controller');
const { requireAuth: protect } = require('../../middleware/auth');
const { requireRole: authorize } = require('../../middleware/role');

// Setup Multer for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Chat Route (Accessible by any logged-in user)
router.post('/chat', protect, aiController.chat);

// Chat History Routes
router.get('/chat/history', protect, aiController.getHistory);
router.get('/chat/history/:sessionId', protect, aiController.getConversation);
router.put('/chat/history/:sessionId/title', protect, aiController.renameConversation);
router.delete('/chat/history/:sessionId', protect, aiController.deleteConversation);

// Admin Knowledge Routes
router.post('/knowledge', protect, authorize(['SUPER_ADMIN']), upload.single('document'), aiController.uploadKnowledge);
router.get('/knowledge', protect, authorize(['SUPER_ADMIN']), aiController.getDocuments);

// Admin Analytics
router.get('/analytics', protect, authorize(['SUPER_ADMIN']), aiController.getAnalytics);

// Autonomous Workforce Center Routes
const aiAgentController = require('./ai.agent.controller');
router.get('/agents', protect, authorize(['SUPER_ADMIN']), aiAgentController.getAgentStatus);
router.get('/audit-logs', protect, authorize(['SUPER_ADMIN']), aiAgentController.getAuditLogs);
router.get('/approvals', protect, authorize(['SUPER_ADMIN']), aiAgentController.getPendingApprovals);
router.post('/approvals/:taskId/approve', protect, authorize(['SUPER_ADMIN']), aiAgentController.approveTask);

module.exports = router;
