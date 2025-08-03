const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: './config.env' });
const cron = require('node-cron');
const Todo = require('./models/Todo');
const Event = require('./models/Event');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const todoRoutes = require('./routes/todos');
const achievementRoutes = require('./routes/achievements');
const mailer = require('./mailer'); // Will create this file

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5000', 'null'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Student Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../index.html');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/achievements', achievementRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Run every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Find users
  const users = await User.find();
  for (const user of users) {
    // Overdue todos
    const overdueTodos = await Todo.find({ user: user._id, done: false, date: { $lt: now } });
    // Todos due soon
    const dueSoonTodos = await Todo.find({ user: user._id, done: false, date: { $gte: now, $lt: soon } });
    // Overdue events
    const overdueEvents = await Event.find({ user: user._id, isCompleted: false, date: { $lt: now } });
    // Events due soon
    const dueSoonEvents = await Event.find({ user: user._id, isCompleted: false, date: { $gte: now, $lt: soon } });

    let emailBody = '';
    let htmlBody = `<div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color: #2a7ae2;">EduAgenda: Task & Event Reminders</h2>`;

    if (overdueTodos.length > 0) {
      emailBody += `Overdue Todos:\n` + overdueTodos.map(t => `- ${t.text} (was due ${t.date.toLocaleString()})`).join('\n') + '\n\n';
      htmlBody += `<h3 style='color: #d32f2f;'>Overdue Todos</h3><ul>` + overdueTodos.map(t => `<li><b>${t.text}</b> <span style='color:#d32f2f;'>(was due ${t.date.toLocaleString()})</span></li>`).join('') + `</ul>`;
    }
    if (dueSoonTodos.length > 0) {
      emailBody += `Todos Due Soon (next 24h):\n` + dueSoonTodos.map(t => `- ${t.text} (due ${t.date.toLocaleString()})`).join('\n') + '\n\n';
      htmlBody += `<h3 style='color: #fbc02d;'>Todos Due Soon (next 24h)</h3><ul>` + dueSoonTodos.map(t => `<li><b>${t.text}</b> <span style='color:#fbc02d;'>(due ${t.date.toLocaleString()})</span></li>`).join('') + `</ul>`;
    }
    if (overdueEvents.length > 0) {
      emailBody += `Overdue Events:\n` + overdueEvents.map(e => `- ${e.title} (was on ${e.date.toLocaleString()})`).join('\n') + '\n\n';
      htmlBody += `<h3 style='color: #d32f2f;'>Overdue Events</h3><ul>` + overdueEvents.map(e => `<li><b>${e.title}</b> <span style='color:#d32f2f;'>(was on ${e.date.toLocaleString()})</span></li>`).join('') + `</ul>`;
    }
    if (dueSoonEvents.length > 0) {
      emailBody += `Events Coming Up (next 24h):\n` + dueSoonEvents.map(e => `- ${e.title} (on ${e.date.toLocaleString()})`).join('\n') + '\n\n';
      htmlBody += `<h3 style='color: #388e3c;'>Events Coming Up (next 24h)</h3><ul>` + dueSoonEvents.map(e => `<li><b>${e.title}</b> <span style='color:#388e3c;'>(on ${e.date.toLocaleString()})</span></li>`).join('') + `</ul>`;
    }

    htmlBody += `<hr style='margin:32px 0 8px 0;'><div style='font-size:12px;color:#888;'>This is an automated reminder from your EduAgenda.</div></div>`;

    if (emailBody && user.email) {
      await mailer.sendMail({
        to: user.email,
        subject: 'EduAgenda: Task & Event Reminders',
        text: emailBody,
        html: htmlBody
      });
    }
  }
});

startServer(); 