const mongoose = require('mongoose');
const config = require('./index');

const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  await mongoose.connect(config.mongodb.uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
};

module.exports = connectDatabase;