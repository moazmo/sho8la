const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  isStudent: { type: Boolean, default: false },
  university: String,
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  profile: {
    bio: String,
    skills: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Update rating when new review added
userSchema.methods.updateRating = async function (newRating) {
  const total = this.profile.rating * this.profile.reviewCount + newRating;
  this.profile.reviewCount += 1;
  this.profile.rating = Math.round((total / this.profile.reviewCount) * 10) / 10;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
