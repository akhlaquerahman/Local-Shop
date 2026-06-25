const express = require('express');
const router = express.Router();
const controller = require('./database-explorer.controller');
const { requireAuth } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// Security: Only SUPER_ADMIN should access these endpoints
router.use(requireAuth);
// router.use(requireRole('SUPER_ADMIN')); // Ensure to enable in production

router.get('/collections', controller.getCollections);
router.get('/collection/:name', controller.getCollectionDocuments);
router.get('/document/:name/:id', controller.getDocument);
router.put('/document/:name/:id', controller.updateDocument);
router.delete('/document/:name/:id', controller.deleteDocument);
router.post('/restore/:name/:id', controller.restoreDocument);

router.get('/schema/:name', controller.getSchema);
router.get('/relationships', controller.getRelationships);
router.get('/global-search', controller.globalSearch);
router.get('/health', controller.getHealthChecks);

module.exports = router;
