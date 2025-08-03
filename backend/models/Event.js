const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Event description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  duration: {
    type: Number, // in minutes
    default: 60,
    min: [15, 'Event duration must be at least 15 minutes'],
    max: [480, 'Event duration cannot exceed 8 hours']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  category: {
    type: String,
    enum: ['academic', 'personal', 'work', 'health', 'social', 'other'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Recurrence interval must be at least 1']
    },
    endDate: {
      type: Date
    }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    time: {
      type: Number, // minutes before event
      default: 15,
      min: [0, 'Reminder time cannot be negative']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
eventSchema.index({ user: 1, date: 1 });
eventSchema.index({ user: 1, isCompleted: 1 });
eventSchema.index({ date: 1, isCompleted: 1 });

// Virtual for full datetime
eventSchema.virtual('datetime').get(function() {
  if (!this.date || !this.time) return null;
  
  const dateStr = this.date.toISOString().split('T')[0];
  return new Date(`${dateStr}T${this.time}:00`);
});

// Virtual for event status
eventSchema.virtual('status').get(function() {
  if (this.isCompleted) return 'completed';
  
  const now = new Date();
  const eventDate = this.datetime;
  
  if (!eventDate) return 'unknown';
  
  if (eventDate < now) return 'overdue';
  if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'upcoming';
  return 'scheduled';
});

// Virtual for formatted date
eventSchema.virtual('formattedDate').get(function() {
  if (!this.date) return null;
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to mark as completed
eventSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to get upcoming events
eventSchema.statics.getUpcoming = function(userId, limit = 10) {
  const now = new Date();
  return this.find({
    user: userId,
    date: { $gte: now },
    isCompleted: false
  })
  .sort({ date: 1, time: 1 })
  .limit(limit);
};

// Method to get events by date range
eventSchema.statics.getByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1, time: 1 });
};

// Method to get events by category
eventSchema.statics.getByCategory = function(userId, category) {
  return this.find({
    user: userId,
    category: category
  }).sort({ date: 1, time: 1 });
};

module.exports = mongoose.model('Event', eventSchema); 