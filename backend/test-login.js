const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('Connected to MongoDB');

    // Test user data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      dob: '1990-01-01',
      password: 'password123'
    };

    // Check if user exists
    let user = await User.findOne({ email: testUser.email });
    
    if (!user) {
      console.log('Creating test user...');
      user = await User.create(testUser);
      console.log('User created successfully:', user.email);
    } else {
      console.log('User already exists:', user.email);
    }

    // Test login
    console.log('\nTesting login...');
    const loginUser = await User.findOne({ email: testUser.email }).select('+password');
    
    if (!loginUser) {
      console.log('❌ User not found for login');
      return;
    }

    console.log('User found for login:', loginUser.email);
    console.log('Password field exists:', !!loginUser.password);
    console.log('Password length:', loginUser.password ? loginUser.password.length : 0);

    // Test password comparison
    const isMatch = await loginUser.comparePassword(testUser.password);
    console.log('Password match:', isMatch);

    if (isMatch) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed - password mismatch');
      
      // Let's check the password hash
      console.log('Stored password hash:', loginUser.password);
      
      // Try to hash the password manually
      const bcrypt = require('bcryptjs');
      const manualHash = await bcrypt.hash(testUser.password, 12);
      console.log('Manual hash:', manualHash);
      
      // Compare with manual hash
      const manualMatch = await bcrypt.compare(testUser.password, manualHash);
      console.log('Manual hash match:', manualMatch);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testLogin(); 