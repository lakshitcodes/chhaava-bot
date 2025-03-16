// backend/config/database.js
const mongoose = require('mongoose');

// Database connection options
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to database function (used if you need to connect outside server.js)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, dbOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };