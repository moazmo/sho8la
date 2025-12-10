const express = require('express');
const Review = require('../models/Review');
const Job = require('../models/Job');
const User = require('../models/User');
const { authOnly } = require('../middleware/roleAuth');

const router = express.Router();

// Get user reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name verified isStudent')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job reviews
router.get('/job/:jobId', async (req, res) => {
  try {
    const reviews = await Review.find({ jobId: req.params.jobId })
      .populate('reviewerId', 'name')
      .populate('revieweeId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review (only for completed jobs)
router.post('/', authOnly, async (req, res) => {
  try {
    const { jobId, revieweeId, rating, comment } = req.body;

    if (!jobId || !revieweeId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    // Verify job is completed and user was part of it
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed jobs' });
    }

    const isClient = job.clientId.toString() === req.userId;
    const isFreelancer = job.freelancerId?.toString() === req.userId;
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ error: 'Not part of this job' });
    }

    // Check target is the other party
    const validTarget = isClient
      ? revieweeId === job.freelancerId?.toString()
      : revieweeId === job.clientId.toString();
    if (!validTarget) {
      return res.status(400).json({ error: 'Invalid reviewee' });
    }

    const existing = await Review.findOne({ jobId, reviewerId: req.userId });
    if (existing) {
      return res.status(400).json({ error: 'Already reviewed' });
    }

    const review = await Review.create({
      jobId, reviewerId: req.userId, revieweeId, rating, comment
    });

    // Update user's average rating
    const reviewee = await User.findById(revieweeId);
    await reviewee.updateRating(rating);

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
