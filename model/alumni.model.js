const mongoose = require('mongoose'); 

const alumniSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  batchYear: {
    type: Number,
    required: true
  },
  jobDetails: {
    type: String
  },
  skills: {
    type: [String]
  },
  contactPreferences: {
    type: String
  },
  verificationProof: {
    type: String
  },
  industry: {
    type: String
  },
  location: {
    type: String
  }
},
{ timestamps: true }
);


module.exports = mongoose.model('Alumni', alumniSchema);