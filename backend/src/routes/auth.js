const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

/**
 * POST /api/auth/sync
 * Called after Google sign-in to create or update the user record.
 */
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // New user
      user = await User.create({
        firebaseUid: uid,
        email,
        name,
        avatar: picture || '',
        totalXP: 0,
        level: 1,
        badge: 'Seedling',
      });
      console.log(`✅ New user created: ${email}`);
    } else {
      // Update name/avatar in case they changed
      user.name = name;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    res.json({
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      totalXP: user.totalXP,
      level: user.level,
      badge: user.badge,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      monthlyGoal: user.monthlyGoal,
      totalCarbonLogged: user.totalCarbonLogged,
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: 'Failed to sync user', message: error.message });
  }
});

/**
 * GET /api/auth/me
 * Returns the current user's profile.
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/auth/goal
 * Update user's monthly CO2 goal.
 */
router.patch('/goal', authMiddleware, async (req, res) => {
  try {
    const { monthlyGoal } = req.body;
    if (!monthlyGoal || monthlyGoal < 1) {
      return res.status(400).json({ error: 'Invalid monthly goal' });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { monthlyGoal },
      { new: true }
    );

    res.json({ monthlyGoal: user.monthlyGoal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
