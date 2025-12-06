const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'client', 'freelancer'], required: true },
  university: { type: String },
  verified: { type: Boolean, default: false },
  profile: {
    bio: String,
    skills: [String],
    rating: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
