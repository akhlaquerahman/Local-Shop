const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');

router.get('/', reportController.getAll);

module.exports = router;
