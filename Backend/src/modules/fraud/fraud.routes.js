const express = require('express');
const router = express.Router();
const fraudController = require('./fraud.controller');

router.get('/', fraudController.getAll);

module.exports = router;
