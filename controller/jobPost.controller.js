const { mailSender } = require('../utils/mailSender');
const { jobPostingMailBody } = require('../utils/emailTemplates/jobPostingMailBody.utils');
const User = require('../model/user.model');
const Job = require('../model/job.model');

exports.postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      companyName,
      location,
      jobType,
      applicationLink,
      applicationEmail,
      howToApply,
      applicationDeadline,
      salaryRange,
      requiredSkills
    } = req.body;
    
    const postedBy = req.params.id;
    
    if (!postedBy) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to post a job.",
      });
    }
    
    if (!title || !description || !companyName || !location || !jobType || !applicationLink) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, companyName, location, jobType, applicationLink.",
      });
    }
    
    let skillsToSave = [];
    if (requiredSkills) {
      if (Array.isArray(requiredSkills)) {
        skillsToSave = requiredSkills.filter(skill => typeof skill === 'string' && skill.trim() !== '');
      } else if (typeof requiredSkills === 'string' && requiredSkills.trim() !== '') {
        skillsToSave = [requiredSkills.trim()];
      }
    }
    
    const jobData = {
      postedBy,
      title,
      description,
      companyName,
      location,
      jobType,
      applicationLink,
      requiredSkills: skillsToSave,
      ...(applicationEmail && { applicationEmail }),
      ...(howToApply && { howToApply }),
      ...(applicationDeadline && { applicationDeadline }),
      ...(salaryRange && { salaryRange }),
    };
    
    const job = await Job.create(jobData);
    
      const students = await User.find({
        role: 'student',
        verified: true,
        loginAllowed: true
      });
      
      if (students && students.length > 0) {
      
        const emailBody = jobPostingMailBody(
          title,
          companyName,
          job._id,
          description
        );
        
        const emailPromises = students.map(student => {
          return mailSender(
            student.email,
            `New Job Opportunity: ${title} at ${companyName} - Technical Vidya`,
            emailBody
          );
        });
        
        
        await Promise.all(emailPromises);
        console.log(`Job notification emails sent to ${students.length} students`);
      }
    
    return res.status(201).json({
      success: true,
      message: "Job posted successfully and notifications sent to students.",
      data: job,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + error.message,
        errors: error.errors,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while posting the job.",
      error: error.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const postedBy = req.params.postedBy;

    if (!jobId || !postedBy) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required to delete a job.",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found.",
      });
    }

    if (job.postedBy.toString() !== postedBy) {
      return res.status(403).json({ 
        success: false,
        message: "You do not have permission to delete this job.",
      });
    }

   
   await job.deleteOne({jobId:jobId});

    return res.status(200).json({ 
      success: true,
      message: "Job deleted successfully.",
    });

  } catch (error) {
    console.error("Error deleting job:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting the job.",
      error: error.message, 
    });
  }
};

exports.getJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({ 
        success: false,
        message: "Job ID is required.",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Job retrieved successfully.",
      data: job,
    });

  } catch (error) {
    console.error("Error getting job:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while getting the job.",
      error: error.message, 
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    return res.status(200).json({ 
      success: true,
      message: "Jobs retrieved successfully.",
      data: jobs,
    });

  } catch (error) {
    console.error("Error getting jobs:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while getting jobs.",
      error: error.message, 
    });
  }
};

exports.getRecentJobs = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('postedBy', 'name email');

    return res.status(200).json({ 
      success: true,
      message: "Recent jobs retrieved successfully.",
      data: jobs,
    });

  } catch (error) {
    console.error("Error getting recent jobs:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while getting recent jobs.",
      error: error.message, 
    });
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required.",
      });
    }

    const jobs = await Job.find({ $text: { $search: query } })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    return res.status(200).json({ 
      success: true,
      message: "Jobs retrieved successfully.",
      data: jobs,
    });

  } catch (error) {
    console.error("Error searching jobs:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while searching jobs.",
      error: error.message, 
    });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const status = req.body.status;

    if (!jobId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "Job ID and status are required.",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: "Job not found.",
      });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({ 
      success: true,
      message: "Job status updated successfully.",
    });

  } catch (error) {
    console.error("Error updating job status:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while updating job status.",
      error: error.message, 
    });
  }
};
