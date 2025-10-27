const express = require('express');
const router = express.Router();

const {
  requestMentorship,
  updateMentorshipStatus,
  getStudentMentorships,
  getAlumniMentorships,
  addMentorshipNotes,
  scheduleNextMeeting,
  
} = require('../controller/mentorShips.controller');

const {
  auth,
  isAlumni,
  isStudent
} = require('../middleware/alumni.middleware');

router.post('/request-mentorship',requestMentorship);
router.post('/update-mentorship-status/:mentorshipId',updateMentorshipStatus);
router.get('/update-mentorship-status/:mentorshipId', updateMentorshipStatus);
router.get('/student-mentorship/:studentId',getStudentMentorships);
router.get('/alumni-mentorship/:alumniId',getAlumniMentorships);
router.post('/add-mentorship-note/:mentorshipId',addMentorshipNotes);
router.post('/schedule-next-meeting/:mentorshipId',scheduleNextMeeting);

module.exports = router;