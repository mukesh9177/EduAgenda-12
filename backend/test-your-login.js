const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function testYourLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('Connected to MongoDB');

    const email = 'gummadimukesh17@gmail.com';
    const password = 'Sunny@7890';
    
    console.log(`Testing login with: ${email}`);
    console.log(`Password: ${password}`);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.name}`);
    console.log(`Password exists: ${!!user.password}`);
    console.log(`Password length: ${user.password ? user.password.length : 0}`);
    
    // Test password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);
    
    if (isMatch) {
      console.log('🎉 Login successful! Your credentials are correct.');
      console.log('The issue might be in the frontend or how you\'re entering the credentials.');
    } else {
      console.log('❌ Password mismatch');
      console.log('The password you entered does not match the stored password.');
      console.log('Possible issues:');
      console.log('- Extra spaces before or after the password');
      console.log('- Case sensitivity (check Caps Lock)');
      console.log('- Special characters not being entered correctly');
      console.log('- Password was changed during registration');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testYourLogin(); 