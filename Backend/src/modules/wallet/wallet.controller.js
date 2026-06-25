const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    let wallet = await Wallet.findOne({ userId });
    
    // Auto-create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 438, lifetimeCashback: 1250 });
      await wallet.save();
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const wallet = await Wallet.findOne({ userId });
    const balance = wallet ? wallet.balance : 0;
    const lifetimeCashback = wallet ? wallet.lifetimeCashback : 0;
    
    // Count transactions
    const totalTransactions = await Transaction.countDocuments({ userId });
    
    res.json({ success: true, data: { balance, lifetimeCashback, pendingCashback: 0, totalTransactions } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { type } = req.query;
    
    const query = { userId };
    if (type && type !== 'all') {
      query.type = type;
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    
    // Auto-seed some transactions if empty
    if (transactions.length === 0 && (!type || type === 'all')) {
      const seedTxns = [
        { userId, transactionId: 'txn-1', type: 'credit', amount: 500, description: 'Added via UPI', status: 'completed' },
        { userId, transactionId: 'txn-2', type: 'debit', amount: 232, description: 'Order #ORD-2026-4591', status: 'completed', referenceId: 'ORD-2026-4591' },
        { userId, transactionId: 'txn-3', type: 'refund', amount: 120, description: 'Refund for Order #ORD-2026-4210', status: 'completed', referenceId: 'ORD-2026-4210' },
        { userId, transactionId: 'txn-4', type: 'credit', amount: 50, description: 'Cashback - Super Saver Promo', status: 'completed' }
      ];
      await Transaction.insertMany(seedTxns);
      const seeded = await Transaction.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, data: seeded });
    }

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.topup = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : 'user-cust-1';
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }
    
    wallet.balance += amount;
    await wallet.save();

    const txn = new Transaction({
      userId,
      transactionId: `txn-${Date.now()}`,
      type: 'credit',
      amount,
      description: 'Wallet Top-up',
      status: 'completed'
    });
    await txn.save();

    res.json({ success: true, data: { wallet, transaction: txn } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
