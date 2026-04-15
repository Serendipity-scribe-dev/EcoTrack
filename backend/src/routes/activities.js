const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * GET /api/activities
 * Fetch paginated list of user's activities (newest first).
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activities = await Activity.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Activity.countDocuments({ userId: user._id });

    res.json({ activities, page, limit, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/activities
 * Log a new activity. Calculates carbonScore, awards XP, updates streak.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category, subType, value, description } = req.body;

    if (!category || !subType || value === undefined) {
      return res.status(400).json({ error: 'category, subType, and value are required' });
    }

    // Get user
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate carbon score
    const factors = Activity.EMISSION_FACTORS[category];
    if (!factors || !factors[subType]) {
      return res.status(400).json({ error: `Invalid category/subType: ${category}/${subType}` });
    }
    const carbonScore = Activity.calculateCarbon(category, subType, value);
    const xpEarned   = Activity.calculateXP(category, subType, carbonScore);
    const unit        = factors[subType].unit;

    // Create activity
    const activity = await Activity.create({
      userId: user._id,
      firebaseUid: req.user.uid,
      category,
      subType,
      description: description || factors[subType].label,
      value,
      unit,
      carbonScore,
      xpEarned,
    });

    // Update user XP and streak
    user.addXP(xpEarned);
    user.totalCarbonLogged += carbonScore;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastActivityDate) {
      user.currentStreak = 1;
    } else {
      const lastDate = new Date(user.lastActivityDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already logged today, no streak change
      } else if (diffDays === 1) {
        user.currentStreak += 1;
      } else {
        user.currentStreak = 1; // streak broken
      }
    }

    user.lastActivityDate = new Date();
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    await user.save();

    res.status(201).json({
      activity,
      user: {
        totalXP: user.totalXP,
        level: user.level,
        badge: user.badge,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    console.error('Activity create error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/activities/:id
 * Delete an activity log (only owner can delete).
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      firebaseUid: req.user.uid,
    });

    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    // Reverse XP and carbon
    const user = await User.findOne({ firebaseUid: req.user.uid });
    user.totalXP = Math.max(0, user.totalXP - activity.xpEarned);
    user.totalCarbonLogged = Math.max(0, user.totalCarbonLogged - activity.carbonScore);
    // Recalculate level/badge
    const levelInfo = User.getLevelFromXP(user.totalXP);
    user.level = levelInfo.level;
    user.badge = levelInfo.badge;
    await user.save();

    await activity.deleteOne();

    res.json({ message: 'Activity deleted', activityId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/activities/factors
 * Returns all emission factors (for the frontend form).
 */
router.get('/factors', async (req, res) => {
  res.json(Activity.EMISSION_FACTORS);
});

module.exports = router;
