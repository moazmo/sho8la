const express = require('express');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const PLATFORM_FEE_PERCENT = 0.1; // 10%

// Get user payments
router.get('/user/:userId', async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ clientId: req.params.userId }, { freelancerId: req.params.userId }]
    })
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment details
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('jobId', 'title')
      .populate('clientId', 'name')
      .populate('freelancerId', 'name');
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment (client initiates payment)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { jobId, freelancerId, amount, method } = req.body;

    if (!jobId || !freelancerId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const platformFee = amount * PLATFORM_FEE_PERCENT;

    const payment = new Payment({
      jobId,
      clientId: req.userId,
      freelancerId,
      amount,
      platformFee,
      method: method || 'card',
      transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    });

    await payment.save();
    res.status(201).json({ message: 'Payment initiated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete payment (webhook from payment gateway)
router.put('/:id/complete', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'completed';
    payment.completedAt = Date.now();
    await payment.save();

    // Add to freelancer wallet
    let freelancerWallet = await Wallet.findOne({ userId: payment.freelancerId });
    if (!freelancerWallet) {
      freelancerWallet = new Wallet({ userId: payment.freelancerId });
    }

    const freelancerAmount = payment.amount - payment.platformFee;
    freelancerWallet.balance += freelancerAmount;
    freelancerWallet.totalEarned += freelancerAmount;
    freelancerWallet.transactions.push({
      type: 'earning',
      amount: freelancerAmount,
      description: `Payment for job completion`,
      reference: payment.jobId
    });
    await freelancerWallet.save();

    // Deduct from client wallet
    let clientWallet = await Wallet.findOne({ userId: payment.clientId });
    if (!clientWallet) {
      clientWallet = new Wallet({ userId: payment.clientId });
    }

    clientWallet.balance -= payment.amount;
    clientWallet.totalSpent += payment.amount;
    clientWallet.transactions.push({
      type: 'payment',
      amount: payment.amount,
      description: `Payment for job completion`,
      reference: payment.jobId
    });
    await clientWallet.save();

    res.json({ message: 'Payment completed', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refund payment
router.put('/:id/refund', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    payment.status = 'refunded';
    await payment.save();

    // Reverse transactions
    let freelancerWallet = await Wallet.findOne({ userId: payment.freelancerId });
    const freelancerAmount = payment.amount - payment.platformFee;
    freelancerWallet.balance -= freelancerAmount;
    freelancerWallet.totalEarned -= freelancerAmount;
    freelancerWallet.transactions.push({
      type: 'withdrawal',
      amount: -freelancerAmount,
      description: `Refund for job`,
      reference: payment.jobId
    });
    await freelancerWallet.save();

    let clientWallet = await Wallet.findOne({ userId: payment.clientId });
    clientWallet.balance += payment.amount;
    clientWallet.totalSpent -= payment.amount;
    clientWallet.transactions.push({
      type: 'deposit',
      amount: payment.amount,
      description: `Refund for job`,
      reference: payment.jobId
    });
    await clientWallet.save();

    res.json({ message: 'Payment refunded', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
