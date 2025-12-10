const express = require('express');
const Job = require('../models/Job');
const { authOnly, clientOnly } = require('../middleware/roleAuth');

const router = express.Router();

// Get all jobs (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(query).populate('clientId', 'name profile.rating').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('clientId', 'name email profile');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job (requires auth + sufficient funds)
router.post('/', clientOnly, async (req, res) => {
  try {
    const { title, description, budget, category, skills } = req.body;

    if (!title || !description || !budget || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check wallet balance
    const Wallet = require('../models/Wallet');
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }

    if (wallet.balance < budget) {
      return res.status(400).json({
        error: `Insufficient funds. You have ${wallet.balance} EGP but need ${budget} EGP. Please add funds to your wallet first.`
      });
    }

    const job = new Job({
      title,
      description,
      budget,
      category,
      skills: skills || [],
      clientId: req.userId
    });

    await job.save();
    res.status(201).json({ message: 'Job created', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job (only by client)
router.put('/:id', clientOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(job, req.body);
    job.updatedAt = Date.now();
    await job.save();
    res.json({ message: 'Job updated', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job (only by client)
router.delete('/:id', clientOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.clientId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
