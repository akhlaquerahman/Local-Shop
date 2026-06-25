const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller');

router.get('/', walletController.getWallet);
router.get('/stats', walletController.getStats);
router.get('/transactions', walletController.getTransactions);
router.post('/topup', walletController.topup);

module.exports = router;
