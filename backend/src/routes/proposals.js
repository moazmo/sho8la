const express = require('express');
const Proposal = require('../models/Proposal');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get proposals for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const proposals = await Proposal.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name profile.rating')
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
      .populate('jobId', 'title budget')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit proposal (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { jobId, bidAmount, deliveryDays, coverLetter } = req.body;

    if (!jobId || !bidAmount || !deliveryDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const existingProposal = await Proposal.findOne({ jobId, freelancerId: req.userId });
    if (existingProposal) {
      return res.status(400).json({ error: 'You already submitted a proposal for this job' });
    }

    const proposal = new Proposal({
      jobId,
      freelancerId: req.userId,
      bidAmount,
      deliveryDays,
      coverLetter
    });

    await proposal.save();
    res.status(201).json({ message: 'Proposal submitted', proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept proposal (only by job client)
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const job = await Job.findById(proposal.jobId);
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    proposal.status = 'accepted';
    job.freelancerId = proposal.freelancerId;
    job.status = 'in-progress';

    await proposal.save();
    await job.save();
    res.json({ message: 'Proposal accepted', proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject proposal
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

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
