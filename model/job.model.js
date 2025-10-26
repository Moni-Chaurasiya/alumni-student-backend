const mongoose = required("mongoose");

const jobSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumni",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship", "Contract", "Temporary"],
    required: true,
  },
  applicationLink: {
    type: String,
    trim: true,
    required: true,
  },
  applicationEmail: {
    type: String,
    trim: true,
  },
  howToApply: {
    type: String,
    trim: true,
  },

  applicationDeadline: {
    type: Date,
  },
  salaryRange: {
    type: String,
  },
  requiredSkills: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "Filled"],
    default: "Open",
  },
},{timestamps:true});
jobSchema.index({ title: 'text', description: 'text', companyName: 'text', location: 'text' });
jobSchema.index({ status: 1, jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);