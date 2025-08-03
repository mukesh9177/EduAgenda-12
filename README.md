# EduAgenda Backend

A comprehensive Node.js/Express backend for the EduAgenda application with MongoDB database, JWT authentication, and full CRUD operations for events, todos, and achievements.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Event Management**: Schedule and manage events with categories and priorities
- **Todo Management**: Create, track, and complete tasks with progress tracking
- **Achievement Tracking**: Record accomplishments with points and streak tracking
- **User Profiles**: Manage user information and preferences
- **Statistics**: Comprehensive analytics and progress tracking
- **Security**: Password hashing, rate limiting, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env` and update the values:
   ```bash
   cp config.env .env
   ```
   - Update the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `PORT`: Server port (default: 5000)

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/password` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/stats` | Get user statistics | Private |
| GET | `/api/users/dashboard` | Get dashboard data | Private |
| GET | `/api/users/profile` | Get user profile | Private |
| DELETE | `/api/users/account` | Delete user account | Private |

### Events

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/events` | Get all events | Private |
| GET | `/api/events/:id` | Get single event | Private |
| POST | `/api/events` | Create event | Private |
| PUT | `/api/events/:id` | Update event | Private |
| DELETE | `/api/events/:id` | Delete event | Private |
| PUT | `/api/events/:id/complete` | Mark event as completed | Private |
| GET | `/api/events/upcoming` | Get upcoming events | Private |
| GET | `/api/events/range` | Get events by date range | Private |
| GET | `/api/events/category/:category` | Get events by category | Private |

### Todos

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/todos` | Get all todos | Private |
| GET | `/api/todos/:id` | Get single todo | Private |
| POST | `/api/todos` | Create todo | Private |
| PUT | `/api/todos/:id` | Update todo | Private |
| DELETE | `/api/todos/:id` | Delete todo | Private |
| PUT | `/api/todos/:id/toggle` | Toggle todo completion | Private |
| PUT | `/api/todos/:id/complete` | Mark todo as completed | Private |
| POST | `/api/todos/:id/subtasks` | Add subtask | Private |
| PUT | `/api/todos/:id/subtasks/:subtaskIndex` | Toggle subtask | Private |
| GET | `/api/todos/today` | Get today's todos | Private |
| GET | `/api/todos/overdue` | Get overdue todos | Private |
| GET | `/api/todos/priority/:priority` | Get todos by priority | Private |
| GET | `/api/todos/category/:category` | Get todos by category | Private |
| GET | `/api/todos/progress` | Get todo progress statistics | Private |

### Achievements

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/achievements` | Get all achievements | Private |
| GET | `/api/achievements/:id` | Get single achievement | Private |
| POST | `/api/achievements` | Create achievement | Private |
| PUT | `/api/achievements/:id` | Update achievement | Private |
| DELETE | `/api/achievements/:id` | Delete achievement | Private |
| GET | `/api/achievements/recent` | Get recent achievements | Private |
| GET | `/api/achievements/range` | Get achievements by date range | Private |
| GET | `/api/achievements/category/:category` | Get achievements by category | Private |
| GET | `/api/achievements/difficulty/:difficulty` | Get achievements by difficulty | Private |
| GET | `/api/achievements/stats` | Get achievement statistics | Private |
| GET | `/api/achievements/streak` | Get streak information | Private |

## Request/Response Examples

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "password": "password123"
}
```

### User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Event
```bash
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Study Session",
  "date": "2024-01-15",
  "time": "14:00",
  "description": "Math homework review",
  "category": "academic",
  "priority": "high",
  "duration": 120
}
```

### Create Todo
```bash
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Complete project report",
  "date": "2024-01-15",
  "time": "16:00",
  "description": "Finish the quarterly report",
  "category": "work",
  "priority": "urgent",
  "estimatedDuration": 180
}
```

### Create Achievement
```bash
POST /api/achievements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Completed Project",
  "date": "2024-01-15",
  "time": "18:00",
  "description": "Finished the major project",
  "category": "work",
  "difficulty": "hard",
  "points": 50,
  "mood": "excellent",
  "energy": 8
}
```

## Database Models

### User
- Basic info: name, email, phone, dob
- Authentication: password (hashed)
- Preferences: theme, notifications, timezone
- Statistics: login count, last login

### Event
- Details: title, description, date, time
- Organization: category, priority, location
- Tracking: completion status, reminders
- Advanced: recurrence, tags, notes

### Todo
- Basic: text, date, time, completion status
- Organization: category, priority, tags
- Progress: subtasks, estimated/actual duration
- Features: reminders, attachments, notes

### Achievement
- Details: title, description, date, time
- Classification: category, difficulty, points
- Tracking: mood, energy level, evidence
- Social: sharing, related items

## Security Features

- **Password Hashing**: bcryptjs with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Error Handling**: Centralized error handling with proper status codes

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/student_dashboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

### Running in Development
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm start
```

## Error Handling

The API uses a centralized error handling system that:
- Catches and formats Mongoose validation errors
- Handles JWT authentication errors
- Provides meaningful error messages
- Includes stack traces in development mode

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables
- Returns appropriate error messages when limits are exceeded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 