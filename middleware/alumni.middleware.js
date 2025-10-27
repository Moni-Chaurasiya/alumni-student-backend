
exports.isAlumniVerified = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'This route is only for alumni'
      });
    }

    if (!req.user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Alumni account not verified',
        details: req.user.verificationDetails
      });
    }

    next();
  } catch (error) {
    console.error('Alumni verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in alumni verification',
      error: error.message
    });
  }
};

exports.isAlumni = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'This route is only accessible for alumni'
      });
    }

    next();
  } catch (error) {
    console.error('isAlumni middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in alumni role verification',
      error: error.message
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'This route is only accessible for students'
      });
    }

    next();
  } catch (error) {
    console.error('isStudent middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in student role verification',
      error: error.message
    });
  }
};

exports.isFaculty = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'This route is only accessible for faculty'
      });
    }

    next();
  } catch (error) {
    console.error('isFaculty middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in faculty role verification',
      error: error.message
    });
  }
};