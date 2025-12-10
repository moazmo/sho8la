const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  verificationType: { type: String, enum: ['student_id', 'national_id'], required: true },
  // For student verification
  university: String,
  studentId: String,
  // For national ID verification
  nationalId: String,
  fullName: String,
  // Common
  documentUrl: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  rejectionReason: String,
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Verification', verificationSchema);
