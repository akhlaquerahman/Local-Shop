const express = require('express');
const router = express.Router();
const bannerController = require('./banner.controller');

router.get('/', bannerController.getAll);

module.exports = router;
