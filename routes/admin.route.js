const express = require('express');
const router = express.Router();

const{
  adminSignup,
  adminLogin,
  getPendingVerifications,
  updateVerificationStatus
} = require('../controller/admin.controller');

const {admin} = require('../middleware/auth.middleware');

router.post('/admin/signup', adminSignup);
router.post('/admin/login', adminLogin);
router.get('/admin/pending-verifications', getPendingVerifications);
router.post('/admin/update-verification-status/:id',admin, updateVerificationStatus);

module.exports = router;