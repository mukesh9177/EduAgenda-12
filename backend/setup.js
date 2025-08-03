const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Todo = require('./models/Todo');
const Achievement = require('./models/Achievement');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard');
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Todo.deleteMany({}),
      Achievement.deleteMany({})
    ]);

    // Create sample user
    console.log('👤 Creating sample user...');
    const sampleUser = await User.create({
      name: 'Sample Student',
      email: 'student@example.com',
      phone: '+1234567890',
      dob: new Date('2000-01-01'),
      password: 'password123'
    });

    console.log('✅ Sample user created:', sampleUser.email);

    // Create sample events
    console.log('📅 Creating sample events...');
    const sampleEvents = await Event.create([
      {
        user: sampleUser._id,
        title: 'Math Class',
        date: new Date('2024-01-15'),
        time: '09:00',
        description: 'Advanced calculus lecture',
        category: 'academic',
        priority: 'high'
      },
      {
        user: sampleUser._id,
        title: 'Gym Session',
        date: new Date('2024-01-15'),
        time: '17:00',
        description: 'Cardio and strength training',
        category: 'health',
        priority: 'medium'
      }
    ]);

    console.log('✅ Sample events created:', sampleEvents.length);

    // Create sample todos
    console.log('📝 Creating sample todos...');
    const sampleTodos = await Todo.create([
      {
        user: sampleUser._id,
        text: 'Complete homework assignment',
        date: new Date('2024-01-15'),
        time: '14:00',
        description: 'Finish the math problems',
        category: 'academic',
        priority: 'urgent',
        done: false
      },
      {
        user: sampleUser._id,
        text: 'Buy groceries',
        date: new Date('2024-01-16'),
        time: '10:00',
        description: 'Get food for the week',
        category: 'personal',
        priority: 'medium',
        done: false
      }
    ]);

    console.log('✅ Sample todos created:', sampleTodos.length);

    // Create sample achievements
    console.log('🏆 Creating sample achievements...');
    const sampleAchievements = await Achievement.create([
      {
        user: sampleUser._id,
        title: 'Completed Project',
        date: new Date('2024-01-14'),
        time: '16:00',
        description: 'Finished the semester project',
        category: 'academic',
        difficulty: 'hard',
        points: 50,
        mood: 'excellent',
        energy: 8
      },
      {
        user: sampleUser._id,
        title: 'Workout Streak',
        date: new Date('2024-01-13'),
        time: '18:00',
        description: 'Completed 7 days of workouts',
        category: 'health',
        difficulty: 'medium',
        points: 30,
        mood: 'great',
        energy: 7
      }
    ]);

    console.log('✅ Sample achievements created:', sampleAchievements.length);

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Sample Data:');
    console.log(`- User: ${sampleUser.email} (password: password123)`);
    console.log(`- Events: ${sampleEvents.length}`);
    console.log(`- Todos: ${sampleTodos.length}`);
    console.log(`- Achievements: ${sampleAchievements.length}`);
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 