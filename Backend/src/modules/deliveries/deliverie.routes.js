const express = require('express');
const router = express.Router();
const deliverieController = require('./deliverie.controller');

router.get('/', deliverieController.getAll);

module.exports = router;
