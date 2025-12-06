const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name profile.rating')
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

// Create review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { jobId, revieweeId, rating, comment } = req.body;

    if (!jobId || !revieweeId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existingReview = await Review.findOne({ jobId, reviewerId: req.userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this job' });
    }

    const review = new Review({
      jobId,
      reviewerId: req.userId,
      revieweeId,
      rating,
      comment
    });

    await review.save();

    // Update user rating
    const reviews = await Review.find({ revieweeId });
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    await User.findByIdAndUpdate(revieweeId, { 'profile.rating': avgRating });

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
