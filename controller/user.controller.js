const bcrypt = required('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const Alumni = require('../model/alumni.model');
const Student = require('../model/student.model');
const Faculty = require('../model/faculty.model');
const Admin = require('../model/admin.model');
const mongoose  = require('mongoose');

exports.signup = async (req, res) => {
  try {
    const { email, password, role, name, degree, batchYear } = req.body;
    const verificationProof = req.files?.verificationProof; 


    let emailRegex;
    if (role === 'student') {
      emailRegex = /^[a-zA-Z0-9._-]+_\d{4}@ltce\.in$/; 
    } else if (role === 'faculty') {
      emailRegex = /^[a-zA-Z0-9._-]+@ltce\.in$/; 
    } else {
      emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: `Invalid email format for ${role} role. Please use a valid email address.`,
      });
    }

    let userObj = {
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      loginAllowed: false,
      verified: false,
    };

    let verificationDocumentUrl = null;

    if (role === 'alumni') {

      if (!verificationProof) {
        return res.status(400).json({
          success: false,
          message: 'Verification proof is required for alumni signup.',
        });
      }

      try {
        const cloudinaryResponse = await uploadFileOnCloudinary(verificationProof, 'verificationProofs'); 
        if (!cloudinaryResponse) {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload verification proof to Cloudinary.',
          });
        }
        verificationDocumentUrl = cloudinaryResponse.secure_url; 
        userObj.verificationDetails = {
          documentPath: verificationDocumentUrl, 
          uploadedAt: new Date(),
          verificationStatus: 'pending',
        };
      } catch (cloudinaryError) {
        console.error('Error uploading to Cloudinary:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading verification proof to Cloudinary',
          error: cloudinaryError.message,
        });
      }
    } else if (role === 'student' || role === 'faculty') {
      userObj.loginAllowed = true;
      userObj.verified = true;
    }


    const user = await User.create(userObj);

    let userData;
    if (role === 'alumni') {
      userData = await Alumni.create({
        userId: user._id,
        name,
        degree,
        batchYear,
        verificationProof: verificationDocumentUrl,
      });
    } else if (role === 'student') {
      userData = await Student.create({
        userId: user._id,
        name,
      });
    } else if (role === 'faculty') {
      userData = await Faculty.create({
        userId: user._id,
        name,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User created',
      user,
      userData,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during signup',
      error: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const passwordIsValid = bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    if (!user.loginAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please contact administrator.',
      });
    }

    const payload = {
      email: user.email,
      id: user._id,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '10d', 
    });

    user.token = token;
    await user.save();
    user.password = undefined;
    
    const options = {
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    const userData = {
      id: user._id,
      role: user.role,
      email: user.email,
      verified: user.verified,
      loginAllowed: user.loginAllowed,
      fcmToken:user.fcmToken
    };

    if (user.role === 'alumni') {
      const alumniData = await Alumni.findOne({ userId: user._id }).exec();
      userData.name = alumniData.name;
      userData.degree = alumniData.degree;
      userData.batchYear = alumniData.batchYear;
      userData.verificationProof = alumniData.verificationProof;
    }

    return res.cookie('token', token, options).json({
      success: true,
      token,
      user:userData,
    });
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during signin',
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ successs: true, message: 'Logout successsful' });
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userData = {
      id: user._id,
      role: user.role,
      email: user.email,
      verified: user.verified,
      loginAllowed: user.loginAllowed,
    };

    if (user.role === 'alumni') {
      const alumniData = await Alumni.findOne({ userId: user._id }).exec();
      userData.name = alumniData.name;
      userData.degree = alumniData.degree;
      userData.batchYear = alumniData.batchYear;
      userData.verificationProof = alumniData.verificationProof;
    } else if (user.role === 'student') {
      const studentData = await Student.findOne({ userId: user._id }).exec();
      userData.name = studentData.name;
    } else if (user.role === 'faculty') {
      const facultyData = await Faculty.findOne({ userId: user._id }).exec();
      userData.name = facultyData.name;
    }

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().exec();
    const usersData = [];

    for (const user of users) {
      const userData = {
        id: user._id,
        role: user.role,
        email: user.email,
        verified: user.verified,
        loginAllowed: user.loginAllowed,
      };

      if (user.role === 'alumni') {
        const alumniData = await Alumni.findOne({ userId: user._id }).exec();
        userData.name = alumniData.name;
        userData.degree = alumniData.degree;
        userData.batchYear = alumniData.batchYear;
        userData.verificationProof = alumniData.verificationProof;
      } else if (user.role === 'student') {
        const studentData = await Student.findOne({ userId: user._id }).exec();
        userData.name = studentData.name;
      } else if (user.role === 'faculty') {
        const facultyData = await Faculty.findOne({ userId: user._id }).exec();
        userData.name = facultyData.name;
      }

      usersData.push(userData);
    }
    return res.status(200).json({
      success: true,
      user: usersData,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params.id;

    
    const user = await User.findById(userId);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    
    switch (user.role) {
      case 'alumni':
        await Alumni.deleteOne({ userId: userId }).session(session);
        break;
      case 'student':
        await Student.deleteOne({ userId: userId }).session(session);
        break;
      case 'faculty':
        await Faculty.deleteOne({ userId: userId }).session(session);
        break;
      default:
        throw new Error(`Unknown user role: ${user.role}`);
    }

    
    await User.findByIdAndDelete(userId).session(session);

    
    await session.commitTransaction();

  
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    
    await session.abortTransaction();
    session.endSession();

    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).exec();
    const studentsData = [];

    for (const studentUser of students) {
      const studentDetails = await Student.findOne({ userId: studentUser._id }).exec();

      if (!studentDetails) {
        continue; 
      }
      const userData = {
        id: studentUser._id,
        role: studentUser.role,
        email: studentUser.email,
        verified: studentUser.verified,
        loginAllowed: studentUser.loginAllowed,
        name: studentDetails.name,
        academicDetails: studentDetails.academicDetails,
        interests: studentDetails.interests,
        careerGoals: studentDetails.careerGoals,
      };
      studentsData.push(userData);
    }

    return res.status(200).json({
      success: true,
      students: studentsData,
    });
  } catch (error) {
    console.error('Error getting students:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting students',
      error: error.message,
    });
  }
};

exports.getFaculty = async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' }).exec();
    const facultiesData = [];

    for (const facultyUser of faculties) {
      const facultyDetails = await Faculty.findOne({ userId: facultyUser._id }).exec();

      if (!facultyDetails) {
          continue; 
      }

      const userData = {
        id: facultyUser._id,
        role: facultyUser.role,
        email: facultyUser.email,
        verified: facultyUser.verified,
        loginAllowed: facultyUser.loginAllowed,
        name: facultyDetails.name,
        research: facultyDetails.research,
        projects: facultyDetails.projects,
        engagementActivities: facultyDetails.engagementActivities,
      };
      facultiesData.push(userData);
    }

    return res.status(200).json({
      success: true,
      faculties: facultiesData,
    });
  } catch (error) {
    console.error('Error getting faculties:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting faculties',
      error: error.message,
    });
  }
};

exports.getAlumni = async (req, res) => {
  try {
    const alumniUsers = await User.find({ role: 'alumni' }).exec();
    const alumniData = [];

    for (const alumniUser of alumniUsers) {
      const alumniDetails = await Alumni.findOne({ userId: alumniUser._id }).exec();

      if (!alumniDetails) {
          continue; 
      }
      const userData = {
        id: alumniUser._id,
        role: alumniUser.role,
        email: alumniUser.email,
        verified: alumniUser.verified,
        loginAllowed: alumniUser.loginAllowed,
        name: alumniDetails.name,
        degree: alumniDetails.degree,
        batchYear: alumniDetails.batchYear,
        jobDetails: alumniDetails.jobDetails,
        skills: alumniDetails.skills,
        contactPreferences: alumniDetails.contactPreferences,
        verificationProof: alumniDetails.verificationProof,
      };
      alumniData.push(userData);
    }

    return res.status(200).json({
      success: true,
      alumni: alumniData,
    });
  } catch (error) {
    console.error('Error getting alumni:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting alumni',
      error: error.message,
    });
  }
};

exports.updateAlumniProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { jobDetails, skills, contactPreferences, industry, location } = req.body;

    if (!jobDetails || !skills || !contactPreferences) {
      return res.status(400).json({
        success: false,
        message: "All required fields (jobDetails, skills, contactPreferences) are required.",
      });
    }

    const parsedSkills = Array.isArray(skills) ? skills : [skills];

    const alumni = await Alumni.findOne({ userId }).exec();

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not found.",
      });
    }

    alumni.jobDetails = jobDetails;
    alumni.skills = parsedSkills;
    alumni.contactPreferences = contactPreferences;
    alumni.industry = industry;
    alumni.location = location;

    await alumni.save();

    return res.status(200).json({
      success: true,
      message: "Alumni profile updated successfully.",
      data: alumni,
    });
  } catch (error) {
    console.error("Error updating alumni profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating alumni profile",
      error: error.message,
    });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { academicDetails, interests, careerGoals } = req.body;

  
    if (!academicDetails || !interests || !careerGoals) {
      return res.status(400).json({
        success: false,
        message: "All fields (academicDetails, interests, careerGoals) are required.",
      });
    }

    
    const parsedInterests = Array.isArray(interests) ? interests : [interests];

    
    const student = await Student.findOne({ userId }).exec();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    
    student.academicDetails = academicDetails;
    student.interests = parsedInterests;
    student.careerGoals = careerGoals;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating student profile",
      error: error.message,
    });
  }
};

exports.updateFacultyProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { research, projects, engagementActivities } = req.body;

    if (!research || !projects || !engagementActivities) {
      return res.status(400).json({
        success: false,
        message: "All fields (research, projects, engagementActivities) are required.",
      });
    }

    const parsedResearch = Array.isArray(research) ? research : [research];
    const parsedProjects = Array.isArray(projects) ? projects : [projects];
    const parsedEngagementActivities = Array.isArray(engagementActivities)
      ? engagementActivities
      : [engagementActivities];

    const faculty = await Faculty.findOne({ userId }).exec();

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found.",
      });
    }

    faculty.research = parsedResearch; 
    faculty.projects = parsedProjects; 
    faculty.engagementActivities = parsedEngagementActivities;

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Faculty profile updated successfully.",
      data: faculty,
    });
  } catch (error) {
    console.error("Error updating faculty profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating faculty profile",
      error: error.message,
    });
  }
};

