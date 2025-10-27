const express = require('express');
const router = express.Router();

const {
  signup,
  signin,
  getUser,
  getUsers,
  deleteUser,
  updateAlumniProfile,
  updateStudentProfile,
  updateFacultyProfile,
  getStudents ,
  getFaculty,   
  getAlumni,
} = require('../controller/user.controller');

const {searchAlumni}=require('../controller/search.controller');

const {
  verifySignUpBody,
  verifySignInBody,
  auth,
  admin,
  isAlumni,
  isFaculty,
  isStudent
} = require('../middleware/alumni.middleware');

router.post('/signup', verifySignUpBody, signup); 
router.post('/signin', verifySignInBody, signin); 
router.get('/get/user/:id',auth, getUser); 
router.get('/users',auth, getUsers); 
router.delete('/delete/:id',auth,admin,  deleteUser)

router.get('/students', getStudents);
router.get('/faculty', getFaculty);
router.get('/alumni', getAlumni);

router.put('/alumni/:userId/profile', updateAlumniProfile);
router.put('/students/:userId/profile', updateStudentProfile);
router.put('/faculty/:userId/profile', updateFacultyProfile);

router.get('/alumni/search', searchAlumni);


module.exports = router;