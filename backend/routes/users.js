const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts from different collections
    const Event = require('../models/Event');
    const Todo = require('../models/Todo');
    const Achievement = require('../models/Achievement');

    const [eventCount, todoCount, achievementCount] = await Promise.all([
      Event.countDocuments({ user: userId }),
      Todo.countDocuments({ user: userId }),
      Achievement.countDocuments({ user: userId })
    ]);

    // Get completed todos count
    const completedTodosCount = await Todo.countDocuments({ 
      user: userId, 
      done: true 
    });

    // Get upcoming events count (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEventsCount = await Event.countDocuments({
      user: userId,
      date: { $gte: new Date(), $lte: nextWeek },
      isCompleted: false
    });

    // Get overdue todos count
    const overdueTodosCount = await Todo.countDocuments({
      user: userId,
      done: false,
      date: { $lt: new Date() }
    });

    // Get total points from achievements
    const totalPointsResult = await Achievement.getTotalPoints(userId);
    const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].totalPoints : 0;

    // Get achievements by category
    const achievementsByCategory = await Achievement.getCountByCategory(userId);

    // Get streak information
    const streakResult = await Achievement.getStreak(userId);
    const streak = streakResult.length > 0 ? streakResult[0].streak : { current: 0, max: 0 };

    res.json({
      success: true,
      data: {
        totalEvents: eventCount,
        totalTodos: todoCount,
        completedTodos: completedTodosCount,
        upcomingEvents: upcomingEventsCount,
        overdueTodos: overdueTodosCount,
        totalAchievements: achievementCount,
        totalPoints,
        achievementsByCategory,
        streak: {
          current: streak.current,
          max: streak.max
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const Event = require('../models/Event');
    const Todo = require('../models/Todo');
    const Achievement = require('../models/Achievement');

    // Get recent data
    const [recentEvents, recentTodos, recentAchievements] = await Promise.all([
      Event.find({ user: userId })
        .sort({ date: 1, time: 1 })
        .limit(5),
      Todo.find({ user: userId })
        .sort({ date: 1, time: 1 })
        .limit(5),
      Achievement.find({ user: userId })
        .sort({ date: -1, time: -1 })
        .limit(5)
    ]);

    // Get today's todos
    const todayTodos = await Todo.getToday(userId);

    // Get upcoming events (next 3 days)
    const nextThreeDays = new Date();
    nextThreeDays.setDate(nextThreeDays.getDate() + 3);
    const upcomingEvents = await Event.find({
      user: userId,
      date: { $gte: new Date(), $lte: nextThreeDays },
      isCompleted: false
    }).sort({ date: 1, time: 1 }).limit(5);

    // Get overdue todos
    const overdueTodos = await Todo.getOverdue(userId).limit(5);

    res.json({
      success: true,
      data: {
        recentEvents,
        recentTodos,
        recentAchievements,
        todayTodos,
        upcomingEvents,
        overdueTodos
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user data
    const Event = require('../models/Event');
    const Todo = require('../models/Todo');
    const Achievement = require('../models/Achievement');

    await Promise.all([
      Event.deleteMany({ user: userId }),
      Todo.deleteMany({ user: userId }),
      Achievement.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

module.exports = router; 