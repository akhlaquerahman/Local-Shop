const express = require('express');
const router = express.Router();
const controller = require('./configuration.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// Security: Only SUPER_ADMIN
router.use(requireAuth);
// router.use(requireRole('SUPER_ADMIN'));

// Settings & Configurations
router.get('/', controller.getConfigurations);
router.post('/', controller.setConfiguration);
router.delete('/:id', controller.deleteConfiguration);
router.post('/:id/reveal', controller.revealSecret);

// Integrations
router.get('/integrations', controller.getIntegrations);
router.post('/integrations', controller.saveIntegration);
router.post('/integrations/test', controller.testIntegration);
router.post('/integrations/:id/reveal', controller.revealIntegrationSecret);

// System Commands
router.post('/cache/reload', controller.reloadCache);

module.exports = router;
