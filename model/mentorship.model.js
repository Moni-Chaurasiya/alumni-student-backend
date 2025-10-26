const mongoose=required('mongoose');

const mentorshipSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  goals: {
    type: String
  },
  meetingFrequency: {
    type: String
  },
  nextMeeting: {
    type: Date
  },
  notes: [
    {
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);