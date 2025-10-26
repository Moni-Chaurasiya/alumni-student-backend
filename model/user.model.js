const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['alumni', 'student', 'faculty'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDetails: {
    type: {
      documentPath: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      }
    }
  },
  loginAllowed: {
    type: Boolean,
    default: false
  },
  // FOR PUSH NOTIFICATION
  fcmToken: {
    type: String,
    default: null
  },
  
},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);





userSchema.pre('save', function(next) {
  
  if (this.role === 'student') {
    const studentEmailRegex = /^[a-zA-Z0-9._-]+_\d{4}@ltce\.in$/;
    if (studentEmailRegex.test(this.email)) {
      this.collegeEmail = this.email;
      this.verified = true;
      this.loginAllowed = true;
    } else {
      return next(new Error('Invalid student college email format'));
    }
  }

  
  if (this.role === 'faculty') {
    const facultyEmailRegex = /^[a-zA-Z0-9._-]+@ltce\.in$/;
    if (facultyEmailRegex.test(this.email)) {
      this.collegeEmail = this.email;
      this.verified = true;
      this.loginAllowed = true;
    } else {
      return next(new Error('Invalid faculty college email format'));
    }
  }

  
  if (this.role === 'alumni') {
    if (!this.verificationDetails.documentPath) {
      return next(new Error('Verification document is required for alumni'));
    }
    this.loginAllowed = false;
    this.verified = false;
    this.verificationDetails.uploadedAt = new Date();
    this.verificationDetails.verificationStatus = 'pending';
  }
  next();
});


userSchema.methods.verifyAlumni = function(adminId, status) {
  if (this.role !== 'alumni') {
    throw new Error('Verification is only for alumni');
  }

  this.verificationDetails.verificationStatus = status;
  this.verificationDetails.verifiedBy = adminId;
  this.verificationDetails.verifiedAt = new Date();

  if (status === 'approved') {
    this.verified = true;
    this.loginAllowed = true;
  } else {
    this.verified = false;
    this.loginAllowed = false;
  }

  return this.save();
};