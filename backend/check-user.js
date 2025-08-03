const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function checkUser(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found in database`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('name email');
      allUsers.forEach(u => console.log(`- ${u.name} (${u.email})`));
    } else {
      console.log(`✅ User found: ${user.name} (${user.email})`);
      console.log(`Password field exists: ${!!user.password}`);
      console.log(`Password length: ${user.password ? user.password.length : 0}`);
      console.log(`User active: ${user.isActive}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'test@test.com';
console.log(`Checking for user: ${email}`);
checkUser(email); 