const express = require('express');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { authOnly, adminOnly } = require('../middleware/roleAuth');

const router = express.Router();

// Get current user (must be before /:id)
router.get('/me', authOnly, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ENDPOINTS (must be before /:id) =====

// Get all users
router.get('/admin/all', adminOnly, async (req, res) => {
  try {
    const { role, verified } = req.query;
    const query = {};
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/admin/stats', adminOnly, async (req, res) => {
  try {
    const [totalUsers, clients, freelancers, students, verified, pendingVerifications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ verified: true }),
      Verification.countDocuments({ status: 'pending' })
    ]);
    res.json({ totalUsers, clients, freelancers, students, verified, pendingVerifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending verifications
router.get('/admin/verifications', adminOnly, async (req, res) => {
  try {
    const verifications = await Verification.find({ status: 'pending' })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin)
router.delete('/admin/:id', adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER ENDPOINTS =====

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', authOnly, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { name, bio, skills, university } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, university, 'profile.bio': bio, 'profile.skills': skills },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
