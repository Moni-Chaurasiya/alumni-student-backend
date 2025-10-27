const mongoose = require('mongoose');
require('dotenv').config();

const mongoDb = async () => {
  await mongoose
    .connect(process.env.DATABASE_URI)
    .then(
      () => mongoose.set('strictPopulate', false),
      console.log('MongoDB connected'),
    )
    .catch((error) => {
      console.error('MongoDB connection Failed', error);
      process.exit(1);
    });
};

module.exports = mongoDb;