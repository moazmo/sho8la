const express = require('express');
const Paymob = require('../config/paymob');
const Escrow = require('../models/Escrow');
const Wallet = require('../models/Wallet');
const Job = require('../models/Job');
const { clientOnly, authOnly } = require('../middleware/roleAuth');

const router = express.Router();
const PLATFORM_FEE = 0.1; // 10%

// Initiate payment (client deposits to escrow)
router.post('/initiate', clientOnly, async (req, res) => {
    try {
        const { jobId, freelancerId, amount, method } = req.body;
        if (!jobId || !freelancerId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const job = await Job.findById(jobId);
        if (!job || job.clientId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Create escrow record
        const escrow = new Escrow({
            jobId,
            clientId: req.userId,
            freelancerId,
            amount,
            platformFee: amount * PLATFORM_FEE,
            status: 'pending'
        });
        await escrow.save();

        // Get Paymob payment URL
        const user = { name: req.userName || 'Client', email: req.userEmail || 'client@sho8la.com' };
        const payment = await Paymob.initiatePayment(amount, escrow._id.toString(), user, method);

        escrow.paymobOrderId = payment.orderId;
        await escrow.save();

        res.json({
            escrowId: escrow._id,
            paymentUrl: payment.iframeUrl,
            paymentKey: payment.paymentKey
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initiate wallet deposit (simple top-up)
router.post('/deposit', authOnly, async (req, res) => {
    try {
        const { amount, method } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const payment = await Paymob.initiateDeposit(amount, req.userId, method || 'card');

        // Store pending deposit
        let wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) wallet = new Wallet({ userId: req.userId });

        wallet.transactions.push({
            type: 'deposit',
            amount,
            description: `Pending ${method || 'card'} deposit (Order: ${payment.orderId})`
        });
        await wallet.save();

        res.json({
            orderId: payment.orderId,
            paymentUrl: payment.iframeUrl,
            paymentKey: payment.paymentKey,
            method: payment.method
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Manual confirm deposit (for local testing when webhook can't reach localhost)
router.post('/deposit/confirm', authOnly, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        let wallet = await Wallet.findOne({ userId: req.userId });
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        // Add balance and record transaction
        wallet.balance += amount;
        wallet.transactions.push({
            type: 'deposit',
            amount,
            description: 'Deposit confirmed'
        });
        await wallet.save();

        res.json({ message: 'Deposit confirmed', balance: wallet.balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Paymob webhook callback
router.post('/webhook', async (req, res) => {
    try {
        const { obj, hmac } = req.body;

        // Verify HMAC in production
        if (process.env.NODE_ENV === 'production' && !Paymob.verifyHmac(obj, hmac)) {
            return res.status(401).json({ error: 'Invalid HMAC' });
        }

        if (obj.success) {
            const merchantOrderId = obj.order?.merchant_order_id || '';

            // Handle wallet deposit
            if (merchantOrderId.startsWith('deposit_')) {
                const userId = merchantOrderId.split('_')[1];
                const amountEgp = obj.amount_cents / 100;

                let wallet = await Wallet.findOne({ userId });
                if (wallet) {
                    wallet.balance += amountEgp;
                    // Update pending transaction to confirmed
                    const txIndex = wallet.transactions.findIndex(t =>
                        t.reference === obj.order.id.toString() || t.description?.includes(obj.order.id)
                    );
                    if (txIndex >= 0) {
                        wallet.transactions[txIndex].description = `Deposit confirmed (${obj.source_data?.sub_type || 'card'})`;
                    }
                    await wallet.save();
                }
                console.log(`✅ Deposit ${amountEgp} EGP to user ${userId}`);
            }
            // Handle escrow payment
            else {
                const escrow = await Escrow.findOne({ paymobOrderId: obj.order.id });
                if (escrow && escrow.status === 'pending') {
                    escrow.status = 'held';
                    escrow.paymobTransactionId = obj.id;
                    await escrow.save();
                    await Job.findByIdAndUpdate(escrow.jobId, { status: 'in-progress' });
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Release escrow (when job is completed)
router.post('/release/:escrowId', clientOnly, async (req, res) => {
    try {
        const escrow = await Escrow.findById(req.params.escrowId);
        if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
        if (escrow.clientId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        if (escrow.status !== 'held') {
            return res.status(400).json({ error: 'Escrow not in held status' });
        }

        // Release to freelancer wallet
        const freelancerAmount = escrow.amount - escrow.platformFee;
        let wallet = await Wallet.findOne({ userId: escrow.freelancerId });
        if (!wallet) wallet = new Wallet({ userId: escrow.freelancerId });

        wallet.balance += freelancerAmount;
        wallet.totalEarned += freelancerAmount;
        wallet.transactions.push({
            type: 'earning',
            amount: freelancerAmount,
            description: 'Payment for completed job',
            reference: escrow.jobId
        });
        await wallet.save();

        escrow.status = 'released';
        escrow.releasedAt = new Date();
        await escrow.save();

        // Update job status
        await Job.findByIdAndUpdate(escrow.jobId, { status: 'completed' });

        res.json({ message: 'Payment released to freelancer', escrow });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get escrow status
router.get('/:escrowId', authOnly, async (req, res) => {
    try {
        const escrow = await Escrow.findById(req.params.escrowId)
            .populate('jobId', 'title')
            .populate('freelancerId', 'name');
        if (!escrow) return res.status(404).json({ error: 'Escrow not found' });
        res.json(escrow);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get escrows for a job
router.get('/job/:jobId', authOnly, async (req, res) => {
    try {
        const escrows = await Escrow.find({ jobId: req.params.jobId });
        res.json(escrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
