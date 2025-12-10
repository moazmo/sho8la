const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { validators } = require('../middleware/validate');
const { limiters } = require('../middleware/rateLimit');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Register
router.post('/register', limiters.auth, validators.register, async (req, res, next) => {
  try {
    const { email, password, name, role, university } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ email, password, name, role, university });
    await user.save();

    // Send welcome email
    sendEmail(email, 'welcome', name);

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', limiters.auth, validators.login, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
