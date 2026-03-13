'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // This helps debug if the URI is actually being read
    console.log('Attempted URI:', process.env.MONGO_URI ? 'URI found in .env' : 'URI NOT FOUND');
    process.exit(1);
  }
};

module.exports = connectDB;