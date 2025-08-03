const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [200, 'Todo text cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  time: {
    type: String,
    required: [true, 'Due time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  done: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['academic', 'personal', 'work', 'health', 'social', 'other'],
    default: 'personal'
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [5, 'Estimated duration must be at least 5 minutes'],
    max: [480, 'Estimated duration cannot exceed 8 hours']
  },
  actualDuration: {
    type: Number, // in minutes
    min: [0, 'Actual duration cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  subtasks: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Subtask text cannot be more than 100 characters']
    },
    done: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    time: {
      type: Number, // minutes before due time
      default: 15,
      min: [0, 'Reminder time cannot be negative']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  repeat: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Repeat interval must be at least 1']
    },
    endDate: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
todoSchema.index({ user: 1, done: 1 });
todoSchema.index({ user: 1, date: 1 });
todoSchema.index({ user: 1, priority: 1 });
todoSchema.index({ date: 1, done: false });

// Virtual for full datetime
todoSchema.virtual('datetime').get(function() {
  if (!this.date || !this.time) return null;
  
  const dateStr = this.date.toISOString().split('T')[0];
  return new Date(`${dateStr}T${this.time}:00`);
});

// Virtual for todo status
todoSchema.virtual('status').get(function() {
  if (this.done) return 'completed';
  
  const now = new Date();
  const dueDate = this.datetime;
  
  if (!dueDate) return 'unknown';
  
  if (dueDate < now) return 'overdue';
  if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'due-soon';
  return 'pending';
});

// Virtual for progress percentage (based on subtasks)
todoSchema.virtual('progress').get(function() {
  if (this.subtasks.length === 0) {
    return this.done ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.done).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for formatted due date
todoSchema.virtual('formattedDueDate').get(function() {
  if (!this.date) return null;
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to mark as completed
todoSchema.methods.markCompleted = function() {
  this.done = true;
  this.completedAt = new Date();
  
  // Mark all subtasks as completed
  this.subtasks.forEach(subtask => {
    if (!subtask.done) {
      subtask.done = true;
      subtask.completedAt = new Date();
    }
  });
  
  return this.save();
};

// Method to toggle completion
todoSchema.methods.toggleCompletion = function() {
  this.done = !this.done;
  this.completedAt = this.done ? new Date() : null;
  return this.save();
};

// Method to add subtask
todoSchema.methods.addSubtask = function(text) {
  this.subtasks.push({ text });
  return this.save();
};

// Method to toggle subtask
todoSchema.methods.toggleSubtask = function(subtaskIndex) {
  if (subtaskIndex >= 0 && subtaskIndex < this.subtasks.length) {
    this.subtasks[subtaskIndex].done = !this.subtasks[subtaskIndex].done;
    this.subtasks[subtaskIndex].completedAt = this.subtasks[subtaskIndex].done ? new Date() : null;
  }
  return this.save();
};

// Method to get overdue todos
todoSchema.statics.getOverdue = function(userId) {
  const now = new Date();
  return this.find({
    user: userId,
    done: false,
    date: { $lt: now }
  }).sort({ date: 1, time: 1 });
};

// Method to get today's todos
todoSchema.statics.getToday = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    user: userId,
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).sort({ time: 1 });
};

// Method to get todos by priority
todoSchema.statics.getByPriority = function(userId, priority) {
  return this.find({
    user: userId,
    priority: priority
  }).sort({ date: 1, time: 1 });
};

// Method to get todos by category
todoSchema.statics.getByCategory = function(userId, category) {
  return this.find({
    user: userId,
    category: category
  }).sort({ date: 1, time: 1 });
};

module.exports = mongoose.model('Todo', todoSchema); 