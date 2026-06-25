const express = require('express');
const router = express.Router();
const analyticController = require('./analytic.controller');

router.get('/', analyticController.getAll);

module.exports = router;
