const express = require('express');
const router = express.Router();
const disputeController = require('./dispute.controller');

router.get('/', disputeController.getAll);

module.exports = router;
