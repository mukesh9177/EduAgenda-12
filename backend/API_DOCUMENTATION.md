# EduAgenda API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... }
}
```

## Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "dob": "1990-01-01",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dob": "1990-01-01T00:00:00.000Z",
      "age": 34,
      "preferences": {
        "theme": "light",
        "notifications": true,
        "timezone": "UTC"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1987654321",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

### Change Password
**PUT** `/auth/password`

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## User Endpoints

### Get User Statistics
**GET** `/users/stats`

Get comprehensive user statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 15,
    "totalTodos": 25,
    "completedTodos": 18,
    "upcomingEvents": 5,
    "overdueTodos": 2,
    "totalAchievements": 12,
    "totalPoints": 450,
    "achievementsByCategory": [
      { "_id": "academic", "count": 5 },
      { "_id": "personal", "count": 4 },
      { "_id": "health", "count": 3 }
    ],
    "streak": {
      "current": 3,
      "max": 7
    }
  }
}
```

### Get Dashboard Data
**GET** `/users/dashboard`

Get data for dashboard display.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recentEvents": [...],
    "recentTodos": [...],
    "recentAchievements": [...],
    "todayTodos": [...],
    "upcomingEvents": [...],
    "overdueTodos": [...]
  }
}
```

---

## Event Endpoints

### Get All Events
**GET** `/events`

Get all events with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): academic, personal, work, health, social, other
- `priority` (optional): low, medium, high, urgent
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `completed` (optional): true/false

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Math Class",
      "description": "Advanced calculus lecture",
      "date": "2024-01-15T00:00:00.000Z",
      "time": "09:00",
      "duration": 60,
      "location": "Room 101",
      "category": "academic",
      "priority": "high",
      "isCompleted": false,
      "datetime": "2024-01-15T09:00:00.000Z",
      "status": "upcoming",
      "formattedDate": "Monday, January 15, 2024",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Event
**POST** `/events`

Create a new event.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Study Session",
  "description": "Math homework review",
  "date": "2024-01-15",
  "time": "14:00",
  "duration": 120,
  "location": "Library",
  "category": "academic",
  "priority": "high"
}
```

### Update Event
**PUT** `/events/:id`

Update an existing event.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Study Session",
  "duration": 90
}
```

### Delete Event
**DELETE** `/events/:id`

Delete an event.

**Headers:**
```
Authorization: Bearer <token>
```

### Mark Event as Completed
**PUT** `/events/:id/complete`

Mark an event as completed.

**Headers:**
```
Authorization: Bearer <token>
```

### Get Upcoming Events
**GET** `/events/upcoming`

Get upcoming events.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of events to return (1-50, default: 10)

---

## Todo Endpoints

### Get All Todos
**GET** `/todos`

Get all todos with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): academic, personal, work, health, social, other
- `priority` (optional): low, medium, high, urgent
- `done` (optional): true/false
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "text": "Complete homework assignment",
      "description": "Finish the math problems",
      "date": "2024-01-15T00:00:00.000Z",
      "time": "14:00",
      "done": false,
      "priority": "urgent",
      "category": "academic",
      "estimatedDuration": 60,
      "progress": 0,
      "datetime": "2024-01-15T14:00:00.000Z",
      "status": "due-soon",
      "formattedDueDate": "Monday, January 15, 2024",
      "subtasks": [],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Todo
**POST** `/todos`

Create a new todo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Complete project report",
  "description": "Finish the quarterly report",
  "date": "2024-01-15",
  "time": "16:00",
  "category": "work",
  "priority": "urgent",
  "estimatedDuration": 180
}
```

### Toggle Todo Completion
**PUT** `/todos/:id/toggle`

Toggle todo completion status.

**Headers:**
```
Authorization: Bearer <token>
```

### Add Subtask
**POST** `/todos/:id/subtasks`

Add a subtask to a todo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Research topic"
}
```

### Get Today's Todos
**GET** `/todos/today`

Get todos due today.

**Headers:**
```
Authorization: Bearer <token>
```

### Get Overdue Todos
**GET** `/todos/overdue`

Get overdue todos.

**Headers:**
```
Authorization: Bearer <token>
```

### Get Todo Progress
**GET** `/todos/progress`

Get todo progress statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 18,
    "pending": 7,
    "overdue": 2,
    "completionRate": 72
  }
}
```

---

## Achievement Endpoints

### Get All Achievements
**GET** `/achievements`

Get all achievements with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): academic, personal, work, health, social, creative, learning, other
- `difficulty` (optional): easy, medium, hard, expert
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Completed Project",
      "description": "Finished the semester project",
      "date": "2024-01-14T00:00:00.000Z",
      "time": "16:00",
      "category": "academic",
      "difficulty": "hard",
      "points": 50,
      "mood": "excellent",
      "energy": 8,
      "datetime": "2024-01-14T16:00:00.000Z",
      "formattedDate": "Sunday, January 14, 2024",
      "timeAgo": "1 day ago",
      "createdAt": "2024-01-14T16:00:00.000Z",
      "updatedAt": "2024-01-14T16:00:00.000Z"
    }
  ]
}
```

### Create Achievement
**POST** `/achievements`

Create a new achievement.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Workout Streak",
  "description": "Completed 7 days of workouts",
  "date": "2024-01-13",
  "time": "18:00",
  "category": "health",
  "difficulty": "medium",
  "points": 30,
  "mood": "great",
  "energy": 7
}
```

### Get Achievement Statistics
**GET** `/achievements/stats`

Get achievement statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPoints": 450,
    "achievementsByCategory": [
      { "_id": "academic", "count": 5 },
      { "_id": "personal", "count": 4 },
      { "_id": "health", "count": 3 }
    ],
    "streak": {
      "current": 3,
      "max": 7
    }
  }
}
```

### Get Streak Information
**GET** `/achievements/streak`

Get current and maximum streak information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 3,
    "max": 7
  }
}
```

---

## Certification Management

### Add Certification to Achievement
**POST** `/achievements/:id/certifications`

Add a certification to an existing achievement.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
title: "AWS Certified Solutions Architect"
issuer: "Amazon Web Services"
issueDate: "2024-01-15"
expiryDate: "2027-01-15" (optional)
certificateNumber: "AWS-123456" (optional)
description: "Professional level certification" (optional)
status: "active" (optional)
certificate: [file upload]
```

**Response:**
```json
{
  "success": true,
  "message": "Certification added successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Test Achievement",
    "certifications": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "title": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "issueDate": "2024-01-15T00:00:00.000Z",
        "expiryDate": "2027-01-15T00:00:00.000Z",
        "certificateNumber": "AWS-123456",
        "description": "Professional level certification",
        "status": "active",
        "certificateFile": {
          "filename": "certificate-1234567890.pdf",
          "url": "/uploads/certificates/certificate-1234567890.pdf",
          "size": 1024000,
          "uploadedAt": "2024-01-15T10:00:00.000Z"
        }
      }
    ]
  }
}
```

### Update Certification
**PUT** `/achievements/:id/certifications/:certId`

Update an existing certification.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Certification Title",
  "status": "expired",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certification updated successfully",
  "data": { ... }
}
```

### Delete Certification
**DELETE** `/achievements/:id/certifications/:certId`

Delete a certification and its associated file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Certification deleted successfully"
}
```

### Download Certification File
**GET** `/achievements/:id/certifications/:certId/download`

Download the certificate file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** File download

### Get All Certifications for Achievement
**GET** `/achievements/:id/certifications`

Get all certifications for a specific achievement.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "title": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "issueDate": "2024-01-15T00:00:00.000Z",
      "expiryDate": "2027-01-15T00:00:00.000Z",
      "certificateNumber": "AWS-123456",
      "description": "Professional level certification",
      "status": "active",
      "certificateFile": {
        "filename": "certificate-1234567890.pdf",
        "url": "/uploads/certificates/certificate-1234567890.pdf",
        "size": 1024000,
        "uploadedAt": "2024-01-15T10:00:00.000Z"
      }
    }
  ]
}
```

**File Upload Requirements:**
- Supported formats: PDF, JPEG, JPG, PNG, GIF, DOC, DOCX
- Maximum file size: 10MB
- File field name: `certificate`

**Certification Status Options:**
- `active`: Currently valid certification
- `expired`: Certification has expired
- `pending`: Certification is pending verification
- `revoked`: Certification has been revoked

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Validation Rules

### User Registration/Login
- Email: Valid email format
- Password: Minimum 6 characters
- Phone: Valid phone number format
- Name: 2-50 characters

### Events
- Title: 1-100 characters
- Date: Valid ISO date
- Time: HH:MM format
- Duration: 15-480 minutes

### Todos
- Text: 1-200 characters
- Date: Valid ISO date
- Time: HH:MM format
- Estimated duration: 5-480 minutes

### Achievements
- Title: 1-100 characters
- Date: Valid ISO date
- Time: HH:MM format
- Points: 1-1000
- Energy: 1-10

## Testing

Use the provided test suite to verify API functionality:

```bash
npm test
```

## Health Check

**GET** `/health`

Check API status.

**Response:**
```json
{
  "status": "OK",
  "message": "EduAgenda API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
``` 