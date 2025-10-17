const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  research: {
    type: [String]
  },
  projects: {
    type: [String]
  },
  engagementActivities: {
    type: [String]
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
