const express = require('express');
const Completion = require('../models/Completion');
const Job = require('../models/Job');
const Escrow = require('../models/Escrow');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { authOnly, clientOnly, freelancerOnly } = require('../middleware/roleAuth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Freelancer: Submit job completion
router.post('/submit', freelancerOnly, async (req, res) => {
    try {
        const { jobId, deliverables, attachments } = req.body;

        const job = await Job.findById(jobId);
        if (!job || job.freelancerId?.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not your job' });
        }
        if (job.status !== 'in-progress') {
            return res.status(400).json({ error: 'Job not in progress' });
        }

        const escrow = await Escrow.findOne({ jobId, status: 'held' });

        const completion = await Completion.create({
            jobId,
            escrowId: escrow?._id,
            freelancerId: req.userId,
            clientId: job.clientId,
            deliverables,
            attachments
        });

        res.status(201).json({ message: 'Completion submitted', completion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Client: Approve completion & release payment
router.post('/:id/approve', clientOnly, async (req, res) => {
    try {
        const completion = await Completion.findById(req.params.id);
        if (!completion || completion.clientId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (completion.status !== 'pending') {
            return res.status(400).json({ error: 'Already processed' });
        }

        completion.status = 'approved';
        completion.resolvedAt = new Date();
        await completion.save();

        // Update job status
        await Job.findByIdAndUpdate(completion.jobId, { status: 'completed' });

        // Release escrow to freelancer wallet
        if (completion.escrowId) {
            const escrow = await Escrow.findById(completion.escrowId);
            if (escrow && escrow.status === 'held') {
                const freelancerAmount = escrow.amount - escrow.platformFee;

                let wallet = await Wallet.findOne({ userId: completion.freelancerId });
                if (!wallet) wallet = new Wallet({ userId: completion.freelancerId });

                wallet.balance += freelancerAmount;
                wallet.totalEarned += freelancerAmount;
                wallet.transactions.push({
                    type: 'earning',
                    amount: freelancerAmount,
                    description: 'Job payment',
                    reference: completion.jobId
                });
                await wallet.save();

                escrow.status = 'released';
                escrow.releasedAt = new Date();
                await escrow.save();

                // Update freelancer stats
                await User.findByIdAndUpdate(completion.freelancerId, {
                    $inc: { 'profile.completedJobs': 1 }
                });

                // Send email
                const freelancer = await User.findById(completion.freelancerId);
                sendEmail(freelancer.email, 'paymentReceived', freelancerAmount, 'completed job');
            }
        }

        res.json({ message: 'Approved and payment released', completion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Client: Request revision
router.post('/:id/revision', clientOnly, async (req, res) => {
    try {
        const { feedback } = req.body;
        const completion = await Completion.findById(req.params.id);
        if (!completion || completion.clientId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        completion.status = 'revision_requested';
        completion.clientFeedback = feedback;
        await completion.save();

        res.json({ message: 'Revision requested', completion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get completions for a job
router.get('/job/:jobId', authOnly, async (req, res) => {
    try {
        const completions = await Completion.find({ jobId: req.params.jobId })
            .sort({ submittedAt: -1 });
        res.json(completions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
