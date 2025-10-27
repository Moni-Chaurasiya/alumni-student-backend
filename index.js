const app = require('./app.js');
const mongoose = require('mongoose');
const mongoDB = require('./database/mongoDB.database.js');
const { cloudinaryDB } = require('./database/cloudinary.database.js');

require('dotenv').config();
const admin = require('./firebase.js'); 
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Server started');
});

mongoDB();
cloudinaryDB();
