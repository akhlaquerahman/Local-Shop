const express = require('express');
const router = express.Router();
const supportController = require('./support.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, supportController.getAll);
router.get('/:id', requireAuth, supportController.getById);
router.post('/', requireAuth, supportController.createTicket);
router.post('/:id/reply', requireAuth, supportController.replyTicket);
router.put('/:id/resolve', requireAuth, supportController.resolveTicket);

router.get('/test-error', async (req, res) => {
  try {
    req.user = { id: '6a2d120e660667315b2b7254', role: 'SUPER_ADMIN' };
    req.body = { category: 'technical', subject: 'Test', message: 'Test msg' };
    await supportController.createTicket(req, res);
  } catch(err) {
    res.json({ err: err.message });
  }
});

module.exports = router;
