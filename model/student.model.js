const mongoose = require('mongoose'); 

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  academicDetails: {
    type: String
  },
  interests: {
    type: [String]
  },
  careerGoals: {
    type: String
  }
},
{ timestamps: true }
);


module.exports = mongoose.model('Student', studentSchema);