const express = require('express');
const router = express.Router();
const {
  postDiscussion,
  getAllDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  commentOnDiscussion,
  deleteComment,
} = require('../controller/discussionPost.controller');

const {
  auth,
} = require('../middleware/auth.middleware');

router.post('/postDiscussion',auth,postDiscussion);
router.get('/getAllDiscussions', getAllDiscussions);
router.get('/getDiscussion/:discussionId', getDiscussionById);
router.post('/updateDiscussion/:discussionId',updateDiscussion);
router.delete('/deleteDiscussion/:discussionId',deleteDiscussion);
router.post('/commentOnDiscussion/:discussionId',auth,commentOnDiscussion);
router.delete('/deleteComment/:discussionId/:commentId',deleteComment);

module.exports = router;