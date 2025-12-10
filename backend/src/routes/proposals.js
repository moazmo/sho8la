const express = require('express');
const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const Escrow = require('../models/Escrow');
const User = require('../models/User');
const { authOnly, freelancerOnly, clientOnly } = require('../middleware/roleAuth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Get current user's proposals (must be before /job/:jobId)
router.get('/my', authOnly, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.userId })
      .populate('jobId', 'title budget status clientId')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proposals for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const proposals = await Proposal.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name email profile.rating verified isStudent')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's proposals
router.get('/user/:userId', async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancerId: req.params.userId })
      .populate('jobId', 'title budget status')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit proposal
router.post('/', freelancerOnly, async (req, res) => {
  try {
    const { jobId, bidAmount, deliveryDays, coverLetter } = req.body;
    if (!jobId || !bidAmount || !deliveryDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.findById(jobId).populate('clientId', 'email name');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const existing = await Proposal.findOne({ jobId, freelancerId: req.userId });
    if (existing) return res.status(400).json({ error: 'Already submitted' });

    const user = await User.findById(req.userId);
    const proposal = await Proposal.create({
      jobId, freelancerId: req.userId, bidAmount, deliveryDays, coverLetter
    });

    // Notify client
    sendEmail(job.clientId.email, 'proposalReceived', job.title, user.name);

    res.status(201).json({ message: 'Proposal submitted', proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept proposal - creates escrow, deducts from wallet, starts job
router.put('/:id/accept', clientOnly, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('freelancerId', 'name email');
    if (!proposal) return res.status(404).json({ error: 'Not found' });

    const job = await Job.findById(proposal.jobId);
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check client has enough funds
    const Wallet = require('../models/Wallet');
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet || wallet.balance < proposal.bidAmount) {
      return res.status(400).json({
        error: `Insufficient funds. Add ${proposal.bidAmount} EGP to your wallet first.`
      });
    }

    // Deduct from client wallet and hold in escrow
    wallet.balance -= proposal.bidAmount;
    wallet.totalSpent += proposal.bidAmount;
    wallet.transactions.push({
      type: 'payment',
      amount: proposal.bidAmount,
      description: `Escrow for: ${job.title}`,
      reference: job._id
    });
    await wallet.save();

    // Update proposal and job
    proposal.status = 'accepted';
    job.freelancerId = proposal.freelancerId._id;
    job.status = 'in-progress';
    await Promise.all([proposal.save(), job.save()]);

    // Reject other proposals
    await Proposal.updateMany(
      { jobId: job._id, _id: { $ne: proposal._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Create escrow with funds held
    await Escrow.create({
      jobId: job._id,
      clientId: req.userId,
      freelancerId: proposal.freelancerId._id,
      amount: proposal.bidAmount,
      platformFee: proposal.bidAmount * 0.1,
      status: 'held'
    });

    // Create conversation for client-freelancer chat
    const Message = require('../models/Message');
    const conversationId = `job_${job._id}`;
    await Message.create({
      conversationId,
      senderId: req.userId,
      receiverId: proposal.freelancerId._id,
      text: `Hi! I've accepted your proposal for "${job.title}". Let's discuss the project details.`
    });

    // Notify freelancer
    const client = await User.findById(req.userId);
    sendEmail(proposal.freelancerId.email, 'proposalAccepted', job.title, client.name);

    res.json({ message: 'Proposal accepted, funds held in escrow', proposal, conversationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject proposal
router.put('/:id/reject', clientOnly, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Not found' });

    const job = await Job.findById(proposal.jobId);
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    proposal.status = 'rejected';
    await proposal.save();
    res.json({ message: 'Proposal rejected', proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
