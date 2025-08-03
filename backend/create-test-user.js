const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('Connected to MongoDB');

    // Create a simple test user
    const testUser = {
      name: 'Test User',
      email: 'test@test.com',
      phone: '+1234567890',
      dob: '1990-01-01',
      password: '123456'
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists. Deleting and recreating...');
      await User.deleteOne({ email: testUser.email });
    }

    // Create new test user
    const user = await User.create(testUser);
    console.log('✅ Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Password: 123456');
    console.log('\nTry logging in with these credentials:');
    console.log('Email: test@test.com');
    console.log('Password: 123456');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser(); 