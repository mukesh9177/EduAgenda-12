const express = require('express');
const { body, query } = require('express-validator');
const Todo = require('../models/Todo');
const { protect, checkOwnership } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// @desc    Get all todos for user
// @route   GET /api/todos
// @access  Private
router.get('/', protect, [
  query('category').optional().isIn(['academic', 'personal', 'work', 'health', 'social', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('done').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { category, priority, done, startDate, endDate } = req.query;
    const userId = req.user._id;

    // Build filter object
    const filter = { user: userId };
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (done !== undefined) filter.done = done === 'true';
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const todos = await Todo.find(filter).sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching todos'
    });
  }
});

// @desc    Get single todo
// @route   GET /api/todos/:id
// @access  Private
router.get('/:id', protect, checkOwnership(Todo), async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.resource
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching todo'
    });
  }
});

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
router.post('/', protect, [
  body('text')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Todo text is required and must be less than 200 characters'),
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
  body('estimatedDuration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('Estimated duration must be between 5 and 480 minutes')
], validate, async (req, res) => {
  try {
    const todoData = {
      ...req.body,
      user: req.user._id,
      date: new Date(req.body.date)
    };

    const todo = await Todo.create(todoData);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating todo'
    });
  }
});

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
router.put('/:id', protect, checkOwnership(Todo), [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Todo text must be less than 200 characters'),
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
  body('estimatedDuration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('Estimated duration must be between 5 and 480 minutes'),
  body('actualDuration')
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage('Actual duration must be between 0 and 480 minutes')
], validate, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating todo'
    });
  }
});

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
router.delete('/:id', protect, checkOwnership(Todo), async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting todo'
    });
  }
});

// @desc    Toggle todo completion
// @route   PUT /api/todos/:id/toggle
// @access  Private
router.put('/:id/toggle', protect, checkOwnership(Todo), async (req, res) => {
  try {
    const todo = await req.resource.toggleCompletion();

    res.json({
      success: true,
      message: `Todo ${todo.done ? 'completed' : 'uncompleted'}`,
      data: todo
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling todo'
    });
  }
});

// @desc    Mark todo as completed
// @route   PUT /api/todos/:id/complete
// @access  Private
router.put('/:id/complete', protect, checkOwnership(Todo), async (req, res) => {
  try {
    const todo = await req.resource.markCompleted();

    res.json({
      success: true,
      message: 'Todo marked as completed',
      data: todo
    });
  } catch (error) {
    console.error('Complete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing todo'
    });
  }
});

// @desc    Add subtask to todo
// @route   POST /api/todos/:id/subtasks
// @access  Private
router.post('/:id/subtasks', protect, checkOwnership(Todo), [
  body('text')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subtask text is required and must be less than 100 characters')
], validate, async (req, res) => {
  try {
    const { text } = req.body;
    const todo = await req.resource.addSubtask(text);

    res.json({
      success: true,
      message: 'Subtask added successfully',
      data: todo
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding subtask'
    });
  }
});

// @desc    Toggle subtask completion
// @route   PUT /api/todos/:id/subtasks/:subtaskIndex
// @access  Private
router.put('/:id/subtasks/:subtaskIndex', protect, checkOwnership(Todo), [
  body('subtaskIndex')
    .isInt({ min: 0 })
    .withMessage('Subtask index must be a non-negative integer')
], validate, async (req, res) => {
  try {
    const subtaskIndex = parseInt(req.params.subtaskIndex);
    const todo = await req.resource.toggleSubtask(subtaskIndex);

    res.json({
      success: true,
      message: 'Subtask toggled successfully',
      data: todo
    });
  } catch (error) {
    console.error('Toggle subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling subtask'
    });
  }
});

// @desc    Get today's todos
// @route   GET /api/todos/today
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const todos = await Todo.getToday(req.user._id);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Get today todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s todos'
    });
  }
});

// @desc    Get overdue todos
// @route   GET /api/todos/overdue
// @access  Private
router.get('/overdue', protect, async (req, res) => {
  try {
    const todos = await Todo.getOverdue(req.user._id);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Get overdue todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue todos'
    });
  }
});

// @desc    Get todos by priority
// @route   GET /api/todos/priority/:priority
// @access  Private
router.get('/priority/:priority', protect, async (req, res) => {
  try {
    const { priority } = req.params;
    const todos = await Todo.getByPriority(req.user._id, priority);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Get todos by priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching todos by priority'
    });
  }
});

// @desc    Get todos by category
// @route   GET /api/todos/category/:category
// @access  Private
router.get('/category/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const todos = await Todo.getByCategory(req.user._id, category);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    console.error('Get todos by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching todos by category'
    });
  }
});

// @desc    Get todo progress statistics
// @route   GET /api/todos/progress
// @access  Private
router.get('/progress', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [totalTodos, completedTodos, overdueTodos] = await Promise.all([
      Todo.countDocuments({ user: userId }),
      Todo.countDocuments({ user: userId, done: true }),
      Todo.countDocuments({ user: userId, done: false, date: { $lt: new Date() } })
    ]);

    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    res.json({
      success: true,
      data: {
        total: totalTodos,
        completed: completedTodos,
        pending: totalTodos - completedTodos,
        overdue: overdueTodos,
        completionRate
      }
    });
  } catch (error) {
    console.error('Get todo progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching todo progress'
    });
  }
});

module.exports = router; 