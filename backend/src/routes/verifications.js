const express = require('express');
const Verification = require('../models/Verification');
const User = require('../models/User');
const { authOnly, adminOnly } = require('../middleware/roleAuth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// ===== ADMIN ENDPOINTS (must be before /:id routes) =====

// Admin: Get all pending verifications
router.get('/admin/pending', adminOnly, async (req, res) => {
  try {
    const verifications = await Verification.find({ status: 'pending' })
      .populate('userId', 'name email role')
      .sort({ submittedAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve verification
router.put('/:id/approve', adminOnly, async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    if (!verification) return res.status(404).json({ error: 'Not found' });

    verification.status = 'verified';
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.userId;
    await verification.save();

    // Update user - set verified = true
    const updateData = { verified: true, verifiedAt: new Date() };
    if (verification.verificationType === 'student_id') {
      updateData.isStudent = true;
      updateData.university = verification.university;
    }
    const user = await User.findByIdAndUpdate(verification.userId, updateData, { new: true });

    console.log('User verified:', user?.email, 'verified:', user?.verified); // Debug log

    sendEmail(user.email, 'verificationApproved', user.name);

    res.json({ message: 'Verification approved', verification, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Reject verification
router.put('/:id/reject', adminOnly, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason },
      { new: true }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });

    res.json({ message: 'Verification rejected', verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER ENDPOINTS =====

// Get verification status
router.get('/:userId', async (req, res) => {
  try {
    const verification = await Verification.findOne({ userId: req.params.userId });
    res.json(verification || { status: 'none' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit verification
router.post('/', authOnly, async (req, res) => {
  try {
    const { verificationType, university, studentId, nationalId, fullName, documentUrl } = req.body;

    if (!verificationType) {
      return res.status(400).json({ error: 'Verification type required' });
    }

    if (verificationType === 'student_id' && (!university || !studentId)) {
      return res.status(400).json({ error: 'University and student ID required' });
    }
    if (verificationType === 'national_id' && !nationalId) {
      return res.status(400).json({ error: 'National ID required' });
    }

    const existing = await Verification.findOne({ userId: req.userId });
    if (existing) {
      return res.status(400).json({ error: 'Verification already submitted' });
    }

    const verification = await Verification.create({
      userId: req.userId,
      verificationType,
      university,
      studentId,
      nationalId,
      fullName,
      documentUrl
    });

    res.status(201).json({ message: 'Verification submitted', verification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
