// backend/config/db.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gofly.com' });
    if (!adminExists) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@gofly.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
      });
      console.log('Demo Admin (admin@gofly.com / Admin@123) seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding demo admin:', error.message);
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        await seedAdmin();
    } catch (e) {
        console.log(`Fallback to MongoDB Memory Server due to: ${e.message}`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
        await seedAdmin();
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
