const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Test certification functionality
async function testCertification() {
  try {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-dashboard-test');
    
    console.log('Testing certification functionality...');
    
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      dob: '1990-01-01',
      password: 'password123'
    });
    
    // Create a test achievement
    const testAchievement = await Achievement.create({
      user: testUser._id,
      title: 'Test Achievement',
      description: 'A test achievement for certification testing',
      date: new Date(),
      time: '10:00',
      category: 'academic'
    });
    
    console.log('Test achievement created:', testAchievement._id);
    
    // Add a test certification
    testAchievement.certifications.push({
      title: 'Test Certification',
      issuer: 'Test Institute',
      issueDate: new Date(),
      certificateNumber: 'CERT-001',
      description: 'A test certification',
      status: 'active',
      certificateFile: {
        filename: 'test-certificate.pdf',
        url: '/uploads/certificates/test-certificate.pdf',
        size: 1024,
        uploadedAt: new Date()
      }
    });
    
    await testAchievement.save();
    console.log('Test certification added successfully');
    
    // Verify the certification was added
    const updatedAchievement = await Achievement.findById(testAchievement._id);
    console.log('Certifications count:', updatedAchievement.certifications.length);
    console.log('First certification:', updatedAchievement.certifications[0]);
    
    // Clean up
    await Achievement.findByIdAndDelete(testAchievement._id);
    await User.findByIdAndDelete(testUser._id);
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCertification();
}

module.exports = { testCertification }; 