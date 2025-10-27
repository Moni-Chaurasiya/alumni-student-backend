const jwt = require('jsonwebtoken');

exports.verifySignUpBody = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      role, 
      name, 
      degree, 
      batchYear 
    } = req.body;

    if (!email) {
      return res.status(400).send({
        message: 'Failed: Email is required'
      });
    }

    if (!password) {
      return res.status(400).send({
        message: 'Failed: Password is required'
      });
    }

    if (!role) {
      return res.status(400).send({
        message: 'Failed: User role is required'
      });
    }

    switch(role) {
      case 'alumni':
        if (!name) {
          return res.status(400).send({
            message: 'Failed: Name is required for alumni'
          });
        }
        if (!degree) {
          return res.status(400).send({
            message: 'Failed: Degree is required for alumni'
          });
        }
        if (!batchYear) {
          return res.status(400).send({
            message: 'Failed: Batch Year is required for alumni'
          });
        }
        break;

      case 'student':
        if (!name) {
          return res.status(400).send({
            message: 'Failed: Name is required for student'
          });
        }
        
        const studentEmailRegex =  /^[a-zA-Z0-9._-]+_\d{4}@ltce\.in$/;
        if (!studentEmailRegex.test(email)) {
          return res.status(400).send({
            message: 'Failed: Invalid college email format for student'
          });
        }
        break;

      case 'faculty':
        if (!name) {
          return res.status(400).send({
            message: 'Failed: Name is required for faculty'
          });
        }
        
        const facultyEmailRegex = /^[a-zA-Z0-9._-]+@ltce\.in$/;
        if (!facultyEmailRegex.test(email)) {
          return res.status(400).send({
            message: 'Failed: Invalid college email format for faculty'
          });
        }
        break;

      default:
        return res.status(400).send({
          message: 'Failed: Invalid user role'
        });
    }

    next();
  } catch (err) {
    console.error('Error in sign up validation:', err);
    res.status(500).send({
      message: 'Error in sign up validation',
      error: err.message
    });
  }
};

exports.verifySignInBody = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({
      message: 'Failed: Email is required'
    });
  }

  if (!password) {
    return res.status(400).send({
      message: 'Failed: Password is required'
    });
  }

  next();
};

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers['authorization'].replace('Bearer ', '');
    if (!token) {
      res.status(500).json({
        success: false,
        message: 'token not found',
        error,
      });
    }

    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.user = data;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'User not verifed',
        error,
      });
    }
  } catch (error) {
    console.log('ERROR in auth middleware', error),
      res.status(500).json({
        success: false,
        message: 'Error in auth middleware',
        error,
      });
  }
};