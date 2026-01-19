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
        const Registration = require('../models/Registration');

        // 1. Total Revenue (Sum of fees from paid registrations)
        const revenueAggregation = await Registration.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $lookup: {
                    from: 'events',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$event.fee' }
                }
            }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

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

        // 3. Recent Registrations (Last 5)
        const recentRegistrations = await Registration.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('studentId', 'name email')
            .populate('eventId', 'name');

        res.json({
            totalRevenue,
            topColleges,
            recentRegistrations
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
