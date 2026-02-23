const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const College = require('../models/College');
const Event = require('../models/Event');
const User = require('../models/User');

// @route   GET api/admin/stats
// @desc    Get dashboard statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const collegeCount = await College.countDocuments();
        const eventCount = await Event.countDocuments();
        const studentCount = await User.countDocuments({ role: 'student' });

        res.json({
            colleges: collegeCount,
            events: eventCount,
            students: studentCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/reports
// @desc    Get system reports statistics
// @access  Private (Admin)
router.get('/reports', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        // 1. Total Subscription Revenue (Sum of college activation fees)
        const subscriptionAggregation = await College.aggregate([
            { $match: { subscriptionStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$subscriptionPrice' }
                }
            }
        ]);
        const totalRevenue = subscriptionAggregation.length > 0 ? subscriptionAggregation[0].totalRevenue : 0;

        // 2. Top Performing Colleges (Most events created)
        const topColleges = await Event.aggregate([
            {
                $group: {
                    _id: '$collegeId',
                    eventCount: { $sum: 1 }
                }
            },
            { $sort: { eventCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'colleges',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'college'
                }
            },
            { $unwind: '$college' },
            {
                $project: {
                    collegeName: '$college.name',
                    eventCount: 1
                }
            }
        ]);

        // 3. Recent Subscriptions (Last 5 colleges that paid)
        const recentSubscriptions = await College.find({ subscriptionStatus: 'paid' })
            .sort({ paidAt: -1 })
            .limit(5)
            .select('name subscriptionPrice paidAt');

        res.json({
            totalRevenue,
            topColleges,
            recentSubscriptions
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
