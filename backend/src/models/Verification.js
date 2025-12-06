const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  university: { type: String, required: true },
  studentId: { type: String, required: true },
  documentUrl: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rejectionReason: String,
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date
});

module.exports = mongoose.model('Verification', verificationSchema);
