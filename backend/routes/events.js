const express = require('express');
const { body, query } = require('express-validator');
const Event = require('../models/Event');
const { protect, checkOwnership } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// @desc    Get all events for user
// @route   GET /api/events
// @access  Private
router.get('/', protect, [
  query('category').optional().isIn(['academic', 'personal', 'work', 'health', 'social', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('completed').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { category, priority, startDate, endDate, completed } = req.query;
    const userId = req.user._id;

    // Build filter object
    const filter = { user: userId };
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (completed !== undefined) filter.isCompleted = completed === 'true';
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const events = await Event.find(filter).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
router.get('/:id', protect, checkOwnership(Event), async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.resource
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', protect, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Event title is required and must be less than 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'personal', 'work', 'health', 'social', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
], validate, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      user: req.user._id,
      date: new Date(req.body.date)
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
router.put('/:id', protect, checkOwnership(Event), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Event title must be less than 100 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'personal', 'work', 'health', 'social', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
], validate, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
router.delete('/:id', protect, checkOwnership(Event), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
});

// @desc    Mark event as completed
// @route   PUT /api/events/:id/complete
// @access  Private
router.put('/:id/complete', protect, checkOwnership(Event), async (req, res) => {
  try {
    const event = await req.resource.markCompleted();

    res.json({
      success: true,
      message: 'Event marked as completed',
      data: event
    });
  } catch (error) {
    console.error('Complete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing event'
    });
  }
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
router.get('/upcoming', protect, [
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await Event.getUpcoming(req.user._id, limit);

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events'
    });
  }
});

// @desc    Get events by date range
// @route   GET /api/events/range
// @access  Private
router.get('/range', protect, [
  query('startDate').isISO8601().withMessage('Start date is required'),
  query('endDate').isISO8601().withMessage('End date is required')
], validate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const events = await Event.getByDateRange(
      req.user._id,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events by range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events by date range'
    });
  }
});

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Private
router.get('/category/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const events = await Event.getByCategory(req.user._id, category);

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events by category'
    });
  }
});

module.exports = router; 