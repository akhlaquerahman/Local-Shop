const express = require('express');
const router = express.Router();
const cmController = require('./cm.controller');

router.get('/', cmController.getAll);

module.exports = router;
