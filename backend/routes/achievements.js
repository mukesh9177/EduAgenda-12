const express = require('express');
const { body, query } = require('express-validator');
const Achievement = require('../models/Achievement');
const { protect, checkOwnership } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadCertificate, handleUploadError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @desc    Get all achievements for user
// @route   GET /api/achievements
// @access  Private
router.get('/', protect, [
  query('category').optional().isIn(['academic', 'personal', 'work', 'health', 'social', 'creative', 'learning', 'other']),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { category, difficulty, startDate, endDate } = req.query;
    const userId = req.user._id;

    // Build filter object
    const filter = { user: userId };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const achievements = await Achievement.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
});

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
router.get('/:id', protect, checkOwnership(Achievement), async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.resource
    });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement'
    });
  }
});

// @desc    Create new achievement
// @route   POST /api/achievements
// @access  Private
router.post('/', protect, uploadCertificate, handleUploadError, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Achievement title is required and must be less than 100 characters'),


  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'personal', 'work', 'health', 'social', 'creative', 'learning', 'other'])
    .withMessage('Invalid category'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Points must be between 1 and 1000'),
  body('mood')
    .optional()
    .isIn(['excellent', 'great', 'good', 'okay', 'poor'])
    .withMessage('Invalid mood'),
  body('energy')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  body('evidence')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Evidence cannot exceed 1000 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], validate, async (req, res) => {
  try {
    const achievementData = {
      ...req.body,
      user: req.user._id
    };

    // Add file information if a file was uploaded
    if (req.file) {
      achievementData.attachments = [{
        filename: req.file.filename,
        url: `/uploads/certificates/${req.file.filename}`,
        size: req.file.size,
        uploadedAt: new Date()
      }];
    }

    const achievement = await Achievement.create(achievementData);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating achievement'
    });
  }
});

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private
router.put('/:id', protect, checkOwnership(Achievement), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Achievement title must be less than 100 characters'),


  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'personal', 'work', 'health', 'social', 'creative', 'learning', 'other'])
    .withMessage('Invalid category'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Points must be between 1 and 1000'),
  body('mood')
    .optional()
    .isIn(['excellent', 'great', 'good', 'okay', 'poor'])
    .withMessage('Invalid mood'),
  body('energy')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  body('evidence')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Evidence cannot exceed 1000 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], validate, async (req, res) => {
  try {
    const updateData = { ...req.body };

    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement'
    });
  }
});

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private
router.delete('/:id', protect, checkOwnership(Achievement), async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting achievement'
    });
  }
});

// @desc    Get recent achievements
// @route   GET /api/achievements/recent
// @access  Private
router.get('/recent', protect, [
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const achievements = await Achievement.getRecent(req.user._id, limit);

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get recent achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent achievements'
    });
  }
});

// @desc    Get achievements by date range
// @route   GET /api/achievements/range
// @access  Private
router.get('/range', protect, [
  query('startDate').isISO8601().withMessage('Start date is required'),
  query('endDate').isISO8601().withMessage('End date is required')
], validate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const achievements = await Achievement.getByDateRange(
      req.user._id,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements by range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements by date range'
    });
  }
});

// @desc    Get achievements by category
// @route   GET /api/achievements/category/:category
// @access  Private
router.get('/category/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const achievements = await Achievement.getByCategory(req.user._id, category);

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements by category'
    });
  }
});

// @desc    Get achievements by difficulty
// @route   GET /api/achievements/difficulty/:difficulty
// @access  Private
router.get('/difficulty/:difficulty', protect, async (req, res) => {
  try {
    const { difficulty } = req.params;
    const achievements = await Achievement.getByDifficulty(req.user._id, difficulty);

    res.json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements by difficulty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements by difficulty'
    });
  }
});

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [totalPoints, achievementsByCategory, streakResult] = await Promise.all([
      Achievement.getTotalPoints(userId),
      Achievement.getCountByCategory(userId),
      Achievement.getStreak(userId)
    ]);

    const totalPointsValue = totalPoints.length > 0 ? totalPoints[0].totalPoints : 0;
    const streak = streakResult.length > 0 ? streakResult[0].streak : { current: 0, max: 0 };

    res.json({
      success: true,
      data: {
        totalPoints: totalPointsValue,
        achievementsByCategory,
        streak: {
          current: streak.current,
          max: streak.max
        }
      }
    });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement statistics'
    });
  }
});

// @desc    Get streak information
// @route   GET /api/achievements/streak
// @access  Private
router.get('/streak', protect, async (req, res) => {
  try {
    const streakResult = await Achievement.getStreak(req.user._id);
    const streak = streakResult.length > 0 ? streakResult[0].streak : { current: 0, max: 0 };

    res.json({
      success: true,
      data: {
        current: streak.current,
        max: streak.max
      }
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching streak information'
    });
  }
});

// @desc    Add certification to achievement
// @route   POST /api/achievements/:id/certifications
// @access  Private
router.post('/:id/certifications', protect, checkOwnership(Achievement), uploadCertificate, handleUploadError, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Certification title is required and must be less than 200 characters'),
  body('issuer')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Issuer name is required and must be less than 100 characters'),
  body('issueDate')
    .isISO8601()
    .withMessage('Please provide a valid issue date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date'),
  body('certificateNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Certificate number cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'expired', 'pending', 'revoked'])
    .withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Certificate file is required'
      });
    }

    const certificationData = {
      title: req.body.title,
      issuer: req.body.issuer,
      issueDate: new Date(req.body.issueDate),
      certificateNumber: req.body.certificateNumber,
      description: req.body.description,
      status: req.body.status || 'active',
      certificateFile: {
        filename: req.file.filename,
        url: `/uploads/certificates/${req.file.filename}`,
        size: req.file.size,
        uploadedAt: new Date()
      }
    };

    if (req.body.expiryDate) {
      certificationData.expiryDate = new Date(req.body.expiryDate);
    }

    const achievement = await Achievement.findById(req.params.id);
    achievement.certifications.push(certificationData);
    await achievement.save();

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding certification'
    });
  }
});

// @desc    Update certification
// @route   PUT /api/achievements/:id/certifications/:certId
// @access  Private
router.put('/:id/certifications/:certId', protect, checkOwnership(Achievement), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Certification title must be less than 200 characters'),
  body('issuer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Issuer name must be less than 100 characters'),
  body('issueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid issue date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date'),
  body('certificateNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Certificate number cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'expired', 'pending', 'revoked'])
    .withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    const certification = achievement.certifications.id(req.params.certId);
    
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Update certification fields
    Object.keys(req.body).forEach(key => {
      if (key === 'issueDate' || key === 'expiryDate') {
        certification[key] = new Date(req.body[key]);
      } else {
        certification[key] = req.body[key];
      }
    });

    await achievement.save();

    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating certification'
    });
  }
});

// @desc    Delete certification
// @route   DELETE /api/achievements/:id/certifications/:certId
// @access  Private
router.delete('/:id/certifications/:certId', protect, checkOwnership(Achievement), async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    const certification = achievement.certifications.id(req.params.certId);
    
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Delete the file from server
    if (certification.certificateFile && certification.certificateFile.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'certificates', certification.certificateFile.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove certification from array
    achievement.certifications.pull(req.params.certId);
    await achievement.save();

    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting certification'
    });
  }
});

// @desc    Download certification file
// @route   GET /api/achievements/:id/certifications/:certId/download
// @access  Private
router.get('/:id/certifications/:certId/download', protect, checkOwnership(Achievement), async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    const certification = achievement.certifications.id(req.params.certId);
    
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    if (!certification.certificateFile || !certification.certificateFile.filename) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'certificates', certification.certificateFile.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found on server'
      });
    }

    res.download(filePath, certification.certificateFile.filename);
  } catch (error) {
    console.error('Download certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading certification'
    });
  }
});

// @desc    Get all certifications for an achievement
// @route   GET /api/achievements/:id/certifications
// @access  Private
router.get('/:id/certifications', protect, checkOwnership(Achievement), async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    res.json({
      success: true,
      count: achievement.certifications.length,
      data: achievement.certifications
    });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certifications'
    });
  }
});

module.exports = router; 