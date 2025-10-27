const express = require('express');
const router = express.Router();

const {
  postJob,
  deleteJob,
  getJob,
  getAllJobs,
  getRecentJobs,
  searchJobs,
  updateJobStatus,
 
} = require('../controller/jobPost.controller');

const {
  auth,
} = require('../middleware/auth.middleware');

const {
  isAlumni,
  isStudent,
  isFaculty
} = require('../middleware/alumni.middleware');

router.post('/post-job/:id', auth, postJob);
router.delete('/job/delete/:postedBy/:id',auth,deleteJob);
router.get('/getJob/:id',getJob);
router.get('/getAllJobs', getAllJobs);
router.get('/getRecentJobs',getRecentJobs);
router.get('/searchJobs',searchJobs);
router.post('/updateJobStatus/:id',updateJobStatus);

module.exports = router;