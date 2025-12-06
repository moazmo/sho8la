const express = require('express');
const Verification = require('../models/Verification');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get verification status
router.get('/:userId', async (req, res) => {
  try {
    const verification = await Verification.findOne({ userId: req.params.userId });
    if (!verification) {
      return res.status(404).json({ error: 'No verification found' });
    }
    res.json(verification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit verification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { university, studentId, documentUrl } = req.body;

    if (!university || !studentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let verification = await Verification.findOne({ userId: req.userId });
    if (verification) {
      return res.status(400).json({ error: 'Verification already submitted' });
    }

    verification = new Verification({
      userId: req.userId,
      university,
      studentId,
      documentUrl
    });

    await verification.save();
    res.status(201).json({ message: 'Verification submitted for review', verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve verification
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', verifiedAt: Date.now() },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Update user verified status
    await User.findByIdAndUpdate(verification.userId, { verified: true });

    res.json({ message: 'Verification approved', verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Reject verification
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    res.json({ message: 'Verification rejected', verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
