const express = require('express');
const router = express.Router();
const {
  postNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} = require('../controller/alumni.controller');

const {
  auth,
} = require('../middleware/auth.middleware');


router.post('/postNews',auth,postNews);
router.get('/getAllNews',getAllNews);
router.get('/getNews/:id',getNewsById);
router.post('/updateNews/:id',auth,updateNews);
router.delete('/deleteNews/:id',auth,deleteNews);

module.exports = router;