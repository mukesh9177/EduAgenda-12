const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function testExistingUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('Connected to MongoDB');

    // Test with existing user
    const email = 'student@example.com';
    const password = 'password123'; // Common default password
    
    console.log(`Testing login with: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.name}`);
    console.log(`Password exists: ${!!user.password}`);
    
    // Test password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);
    
    if (isMatch) {
      console.log('🎉 Login successful with existing user!');
      console.log('Try these credentials:');
      console.log(`Email: ${email}`);
      console.log('Password: password123');
    } else {
      console.log('❌ Password mismatch');
      console.log('The password might be different. Try common passwords like:');
      console.log('- password123');
      console.log('- 123456');
      console.log('- password');
      console.log('- admin');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testExistingUser(); 