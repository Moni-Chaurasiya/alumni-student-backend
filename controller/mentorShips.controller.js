const Mentorship=require('../model/mentorship.model')
const User=require('../model/user.model')
const Student=required('../model/student.model')
const Alumni =required('../model/alumni.model')

exports.requestMentorship = async (req, res) => {
  try {
    const { studentId, alumniId } = req.body;
    
    const existingRequest = await Mentorship.findOne({ studentId, alumniId }).exec();
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Mentorship request already exists.",
      });
    }
    
    const studentUser = await User.findById(studentId).exec();
    const alumniUser = await User.findById(alumniId).exec();
    
    if (!studentUser || !alumniUser) {
      return res.status(404).json({
        success: false,
        message: "Student or alumni user not found",
      });
    }
    
    const studentProfile = await Student.findOne({ userId: studentId }).exec();
    const alumniProfile = await Alumni.findOne({ userId: alumniId }).exec();
    
    if (!studentProfile || !alumniProfile) {
      return res.status(404).json({
        success: false,
        message: "Student or alumni profile not found",
      });
    }
    
    const mentorship = await Mentorship.create({
      studentId,
      alumniId,
      status: 'pending'
    });
  
    const studentName = studentProfile.name;
    const alumniName = alumniProfile.name;
    
    const emailBody = mentorshipRequestMailBody(studentName, alumniName, mentorship._id);
    console.log("Attempting to send email to:", alumniUser.email);
    await mailSender(
      alumniUser.email,
      "New Mentorship Request - Technical Vidya",
      emailBody
    );
    console.log("email sended successfully")
    return res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully.",
      data: mentorship,
    });
  } catch (error) {
    console.error("Error requesting mentorship:", error);
    return res.status(500).json({
      success: false,
      message: "Error requesting mentorship",
      error: error.message,
    });
  }
};

exports.updateMentorshipStatus = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const status = req.query.status || req.body.status;
    const goals = req.body?.goals;
    const meetingFrequency = req.body?.meetingFrequency;
    
    const isEmailClick = req.method === 'GET' && req.query.status;
    
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'accepted', 'rejected', or 'completed'.",
      });
    }
    
    const updateData = { status };
    
    if (status === 'accepted') {
      updateData.startDate = new Date();
      if (goals) updateData.goals = goals;
      if (meetingFrequency) updateData.meetingFrequency = meetingFrequency;
    }
    
    if (status === 'completed') {
      updateData.endDate = new Date();
    }
    
    const mentorshipBefore = await Mentorship.findById(mentorshipId)
      .populate('studentId')
      .populate('alumniId')
      .exec();
      
    if (!mentorshipBefore) {
      return res.status(404).json({
        success: false,
        message: "Mentorship request not found.",
      });
    }
    
    const mentorship = await Mentorship.findByIdAndUpdate(
      mentorshipId,
      updateData,
      { new: true }
    )
    .populate('studentId', 'name academicDetails interests')
    .populate('alumniId', 'name jobDetails skills')
    .exec();
    
    const studentUser = await User.findById(mentorshipBefore.studentId).exec();
    const studentProfile = await Student.findOne({ userId: mentorshipBefore.studentId }).exec();
    const alumniProfile = await Alumni.findOne({ userId: mentorshipBefore.alumniId }).exec();
    
    if (studentUser && studentProfile && alumniProfile) {
    
      const studentName = studentProfile.name;
      const alumniName = alumniProfile.name;
      
      const studentEmailBody = mentorshipStatusNotification(studentName, alumniName, status);
      await mailSender(
        studentUser.email,
        `Mentorship Request ${status === 'accepted' ? 'Accepted' : 'Declined'} - Technical Vidya`,
        studentEmailBody
      );
      console.log(`Notification email sent to student ${studentName}`);
    }
    
    if (isEmailClick) {
      //return res.redirect(`${process.env.FRONTEND_URL}/mentorship-response?status=${status}`);
      return res.redirect(`${process.env.FRONTEND_URL}/`);
    }
    
    // Otherwise return JSON response for API calls
    return res.status(200).json({
      success: true,
      message: `Mentorship ${status === 'accepted' ? 'started' : status === 'completed' ? 'completed' : 'updated'} successfully.`,
      data: mentorship,
    });
  } catch (error) {
    console.error("Error updating mentorship status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating mentorship status",
      error: error.message,
    });
  }
};

exports.getStudentMentorships = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const mentorships = await Mentorship.find({ 
      studentId,
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('alumniId', 'name jobDetails skills industry location')
    .sort({ createdAt: -1 })
    .exec();
    
    return res.status(200).json({
      success: true,
      message: "Student mentorships retrieved successfully.",
      data: mentorships,
    });
  } catch (error) {
    console.error("Error retrieving student mentorships:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving student mentorships",
      error: error.message,
    });
  }
};

exports.getAlumniMentorships = async (req, res) => {
  try {
    const { alumniId } = req.params;
    
    const mentorships = await Mentorship.find({ 
      alumniId,
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('studentId', 'name academicDetails interests careerGoals')
    .sort({ createdAt: -1 })
    .exec();
    
    return res.status(200).json({
      success: true,
      message: "Alumni mentorships retrieved successfully.",
      data: mentorships,
    });
  } catch (error) {
    console.error("Error retrieving alumni mentorships:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving alumni mentorships",
      error: error.message,
    });
  }
};

exports.addMentorshipNotes = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { content, userId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Note content is required.",
      });
    }
    
    const mentorship = await Mentorship.findByIdAndUpdate(
      mentorshipId,
      { 
        $push: { 
          notes: { 
            content, 
            createdBy: userId 
          } 
        } 
      },
      { new: true }
    ).exec();
    
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentorship not found.",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Note added successfully.",
      data: mentorship,
    });
  } catch (error) {
    console.error("Error adding mentorship note:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding mentorship note",
      error: error.message,
    });
  }
};

exports.scheduleNextMeeting = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { nextMeeting } = req.body;
    
    if (!nextMeeting) {
      return res.status(400).json({
        success: false,
        message: "Next meeting date is required.",
      });
    }
    
    const mentorship = await Mentorship.findByIdAndUpdate(
      mentorshipId,
      { nextMeeting: new Date(nextMeeting) },
      { new: true }
    ).exec();
    
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: "Mentorship not found.",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Next meeting scheduled successfully.",
      data: mentorship,
    });
  } catch (error) {
    console.error("Error scheduling next meeting:", error);
    return res.status(500).json({
      success: false,
      message: "Error scheduling next meeting",
      error: error.message,
    });
  }
};

