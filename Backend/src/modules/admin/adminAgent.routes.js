const express = require('express');
const router = express.Router();
const agentController = require('./adminAgent.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

router.use(requireAuth);
// Optional: router.use(requireRole(['SUPER_ADMIN'])); // Adjust based on your needs

router.get('/', agentController.getAgents);
router.post('/', agentController.createAgent);
router.put('/:id', agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

router.get('/roles', agentController.getRoles);
router.post('/roles', agentController.createRole);
router.put('/roles/:id', agentController.updateRole);
router.delete('/roles/:id', agentController.deleteRole);

module.exports = router;
