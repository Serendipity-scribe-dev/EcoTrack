const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * GET /api/stats/global
 * MongoDB aggregation: total CO2 logged by all users (the "Global Meter").
 */
router.get('/global', async (req, res) => {
  try {
    // Run both aggregations in parallel
    const [activityResult, totalUsers] = await Promise.all([
      Activity.aggregate([
        {
          $group: {
            _id: null,
            totalCarbon: { $sum: '$carbonScore' },
            totalActivities: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            totalCarbon: { $round: ['$totalCarbon', 2] },
            totalActivities: 1,
          },
        },
      ]),
      // Count ALL registered users, not just those with activities
      User.countDocuments(),
    ]);

    const activity = activityResult[0] || { totalCarbon: 0, totalActivities: 0 };
    res.json({ ...activity, totalUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/weekly
 * User's carbon emissions grouped by day for the last 7 days.
 */
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await Activity.aggregate([
      {
        $match: {
          userId: user._id,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          carbon: { $sum: '$carbonScore' },
          activities: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const match = result.find(r => r._id === key);
      days.push({
        date: key,
        day: dayLabel,
        carbon: match ? parseFloat(match.carbon.toFixed(2)) : 0,
        activities: match ? match.activities : 0,
      });
    }

    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/leaderboard
 * Top 10 users by total XP.
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const top10 = await User.find()
      .sort({ totalXP: -1 })
      .limit(10)
      .select('name avatar totalXP level badge currentStreak');

    res.json(top10);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats/category-breakdown
 * User's carbon breakdown by category this month.
 */
router.get('/category-breakdown', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await Activity.aggregate([
      { $match: { userId: user._id, timestamp: { $gte: startOfMonth } } },
      { $group: { _id: '$category', carbon: { $sum: '$carbonScore' } } },
      { $project: { category: '$_id', carbon: { $round: ['$carbon', 2] }, _id: 0 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
