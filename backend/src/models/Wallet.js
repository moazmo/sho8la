const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ['deposit', 'withdrawal', 'payment', 'earning'], required: true },
      amount: { type: Number, required: true },
      description: String,
      reference: mongoose.Schema.Types.ObjectId,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wallet', walletSchema);
