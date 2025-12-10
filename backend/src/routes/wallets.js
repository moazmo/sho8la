const express = require('express');
const Wallet = require('../models/Wallet');
const { authOnly } = require('../middleware/roleAuth');

const router = express.Router();

// Get current user's wallet
router.get('/me', authOnly, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw from current user's wallet
router.post('/me/withdraw', authOnly, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: 'Withdrawal request'
    });
    await wallet.save();

    res.json({ message: 'Withdrawal processed', wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit to current user's wallet
router.post('/me/deposit', authOnly, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'deposit',
      amount,
      description: 'Funds added to wallet'
    });
    await wallet.save();

    res.json({ message: 'Deposit successful', wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet balance by userId (legacy)
router.get('/:userId', async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.params.userId });
      await wallet.save();
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet transactions
router.get('/:userId/transactions', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const { limit = 50, skip = 0 } = req.query;
    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.json({ transactions, total: wallet.transactions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add deposit (withdraw to bank)
router.post('/:userId/deposit', authOnly, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { amount, method } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.params.userId });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'deposit',
      amount,
      description: `Deposit via ${method || 'card'}`
    });
    await wallet.save();

    res.json({ message: 'Deposit added', wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw funds
router.post('/:userId/withdraw', authOnly, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { amount, bankAccount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      description: `Withdrawal to bank account ending in ${bankAccount ? bankAccount.slice(-4) : 'XXXX'}`
    });
    await wallet.save();

    res.json({ message: 'Withdrawal processed', wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
