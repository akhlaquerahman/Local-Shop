const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');

router.get('/', permissionController.getAll);

module.exports = router;
