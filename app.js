const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();

//*****middleware********
app.use(express.json());

app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 50 MB
  }),
);

app.use(
  cors({
    origin: '*',
  }),
);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An error occurred', error: err.message });
});


//*****import routes********
const userRoutes = require('./routes/user.route');
const adminRoutes = require('./routes/admin.route');
const mentorshipRoutes = require('./routes/mentorship.route');
const jobPostRoutes = require('./routes/jobPost.route');
const newsPostRoutes = require('./routes/newsPost.route');
const discussionPostRoutes = require('./routes/discussionPost.route');


//*****routes********

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/mentorship', mentorshipRoutes);
app.use('/api/v1/job', jobPostRoutes);  
app.use('/api/v1/news', newsPostRoutes);
app.use('/api/v1/discussion', discussionPostRoutes);

module.exports = app;
