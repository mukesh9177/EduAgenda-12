const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('EduAgenda API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_dashboard_test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        dob: '1990-01-01',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      
      authToken = response.body.data.token;
      userId = response.body.data.user._id;
    });

    test('should login user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('Events', () => {
    let eventId;

    test('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        date: '2024-01-15',
        time: '14:00',
        description: 'Test event description',
        category: 'academic',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(eventData.title);
      
      eventId = response.body.data._id;
    });

    test('should get all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    test('should get single event', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(eventId);
    });
  });

  describe('Todos', () => {
    let todoId;

    test('should create a new todo', async () => {
      const todoData = {
        text: 'Test Todo',
        date: '2024-01-15',
        time: '16:00',
        description: 'Test todo description',
        category: 'personal',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe(todoData.text);
      
      todoId = response.body.data._id;
    });

    test('should get all todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    test('should toggle todo completion', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.done).toBe(true);
    });
  });

  describe('Achievements', () => {
    let achievementId;

    test('should create a new achievement', async () => {
      const achievementData = {
        title: 'Test Achievement',
        date: '2024-01-15',
        time: '18:00',
        description: 'Test achievement description',
        category: 'personal',
        difficulty: 'medium',
        points: 25
      };

      const response = await request(app)
        .post('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(achievementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(achievementData.title);
      
      achievementId = response.body.data._id;
    });

    test('should get all achievements', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    test('should get achievement statistics', async () => {
      const response = await request(app)
        .get('/api/achievements/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPoints).toBeGreaterThan(0);
    });
  });

  describe('User Statistics', () => {
    test('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEvents');
      expect(response.body.data).toHaveProperty('totalTodos');
      expect(response.body.data).toHaveProperty('totalAchievements');
    });

    test('should get dashboard data', async () => {
      const response = await request(app)
        .get('/api/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recentEvents');
      expect(response.body.data).toHaveProperty('recentTodos');
      expect(response.body.data).toHaveProperty('recentAchievements');
    });
  });
}); 