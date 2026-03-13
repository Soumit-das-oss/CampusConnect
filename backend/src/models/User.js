'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
    },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'], trim: true },
    skills: { type: [String], default: [] },
    projects: { type: [projectSchema], default: [] },
    resumeUrl: { type: String, default: null },
    resumeData: {
      summary:    { type: String, default: null },
      skills:     { type: [String], default: [] },
      education:  [{ institution: String, degree: String, year: String }],
      experience: [{ company: String, role: String, duration: String }],
      extractedAt: { type: Date, default: null },
    },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ['student', 'admin', 'committee'], default: 'student' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Corrected: Removed duplicate email index
userSchema.index({ collegeId: 1 });
userSchema.index({ skills: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);