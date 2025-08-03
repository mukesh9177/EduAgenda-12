const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [100, 'Achievement title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  achievementDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Achievement date is required']
  },
  category: {
    type: String,
    enum: ['academic', 'personal', 'work', 'health', 'social', 'creative', 'learning', 'other'],
    default: 'personal'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10,
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  evidence: {
    type: String,
    trim: true,
    maxlength: [1000, 'Evidence cannot be more than 1000 characters']
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
  certifications: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Certification title cannot be more than 200 characters']
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Issuer name cannot be more than 100 characters']
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    certificateNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Certificate number cannot be more than 50 characters']
    },
    certificateFile: {
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
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending', 'revoked'],
      default: 'active'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Certification description cannot be more than 500 characters']
    }
  }],
  mood: {
    type: String,
    enum: ['excellent', 'great', 'good', 'okay', 'poor'],
    default: 'good'
  },
  energy: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level cannot exceed 10'],
    default: 5
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedTodo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
achievementSchema.index({ user: 1, createdAt: -1 });
achievementSchema.index({ user: 1, category: 1 });
achievementSchema.index({ user: 1, difficulty: 1 });
achievementSchema.index({ createdAt: -1 });

// Method to get achievements by date range
achievementSchema.statics.getByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Method to get achievements by category
achievementSchema.statics.getByCategory = function(userId, category) {
  return this.find({
    user: userId,
    category: category
  }).sort({ createdAt: -1 });
};

// Method to get achievements by difficulty
achievementSchema.statics.getByDifficulty = function(userId, difficulty) {
  return this.find({
    user: userId,
    difficulty: difficulty
  }).sort({ createdAt: -1 });
};

// Method to get recent achievements
achievementSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({
    user: userId
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Method to get total points
achievementSchema.statics.getTotalPoints = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalPoints: { $sum: '$points' } } }
  ]);
};

// Method to get achievements count by category
achievementSchema.statics.getCountByCategory = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Method to get streak information
achievementSchema.statics.getStreak = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: null,
        achievements: { $push: '$$ROOT' }
      }
    },
    {
      $addFields: {
        streak: {
          $reduce: {
            input: '$achievements',
            initialValue: { current: 0, max: 0, lastDate: null },
            in: {
              current: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ['$$value.lastDate', null] },
                      {
                        $eq: [
                          { $dateToString: { date: '$$this.createdAt', format: '%Y-%m-%d' } },
                          {
                            $dateToString: {
                              date: {
                                $add: [
                                  '$$value.lastDate',
                                  { $multiply: [24 * 60 * 60 * 1000, 1] }
                                ]
                              },
                              format: '%Y-%m-%d'
                            }
                          }
                        ]
                      }
                    ]
                  },
                  then: { $add: ['$$value.current', 1] },
                  else: 1
                }
              },
              max: {
                $max: [
                  '$$value.max',
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ['$$value.lastDate', null] },
                          {
                            $eq: [
                              { $dateToString: { date: '$$this.createdAt', format: '%Y-%m-%d' } },
                              {
                                $dateToString: {
                                  date: {
                                    $add: [
                                      '$$value.lastDate',
                                      { $multiply: [24 * 60 * 60 * 1000, 1] }
                                    ]
                                  },
                                  format: '%Y-%m-%d'
                                }
                              }
                            ]
                          }
                        ]
                      },
                      then: { $add: ['$$value.current', 1] },
                      else: 1
                    }
                  }
                ]
              },
              lastDate: '$$this.createdAt'
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Achievement', achievementSchema); 