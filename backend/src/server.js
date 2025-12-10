require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { limiters } = require('./middleware/rateLimit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(limiters.api); // Global rate limit

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/paymob', require('./routes/paymob'));
app.use('/api/completion', require('./routes/completion'));
app.use('/api/wallets', require('./routes/wallets'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running ✅', time: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
