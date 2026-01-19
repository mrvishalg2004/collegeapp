const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

// @route   POST api/events
// @desc    Create an event
// @access  Private (College Admin or Super Admin)
router.post('/', auth, async (req, res) => {
    // Allow 'college' or 'admin'
    if (req.user.role !== 'college' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { name, description, date, venue, fee, maxParticipants, departmentId, coordinators, collegeId } = req.body;
        const mongoose = require('mongoose');

        let targetCollegeId;

        if (req.user.role === 'admin') {
            // Super Admin MUST provide a collegeId
            if (!collegeId) {
                return res.status(400).json({ message: 'College ID is required for Super Admin' });
            }
            targetCollegeId = collegeId;
        } else {
            // College Admin: use their assigned collegeId
            const user = await User.findById(req.user.id);
            if (!user.collegeId) {
                return res.status(400).json({ message: 'User does not belong to a college' });
            }
            targetCollegeId = user.collegeId;
        }

        // Validation
        if (!date) return res.status(400).json({ message: 'Date is required' });
        if (departmentId && !mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({ message: 'Invalid Department ID' });
        }

        // Validate coordinators
        let validCoordinators = [];
        if (coordinators && Array.isArray(coordinators)) {
            validCoordinators = coordinators.filter(id => mongoose.Types.ObjectId.isValid(id));
        }

        const event = new Event({
            collegeId: targetCollegeId,
            departmentId: departmentId || undefined,
            coordinators: validCoordinators,
            name,
            description,
            date,
            venue,
            fee,
            maxParticipants
        });

        await event.save();
        res.json(event);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/events
// @desc    Get all events (Can filter by college or department)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { collegeId, departmentId } = req.query;
        let query = {};
        if (collegeId) query.collegeId = collegeId;
        if (departmentId) query.departmentId = departmentId;

        const events = await Event.find(query)
            .populate('departmentId', 'name')
            .populate('coordinators', 'name email')
            .populate('coordinatorId', 'name'); // Legacy population
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/events/:id/registrations
// @desc    Get registrations for a specific event
// @access  Private (College, Coordinator)
router.get('/:id/registrations', auth, async (req, res) => {
    try {
        const Registration = require('../models/Registration'); // Lazy load
        const registrations = await Registration.find({ eventId: req.params.id })
            .populate('studentId', 'name email');
        res.json(registrations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/events/my-assignments
// @desc    Get events assigned to logged in coordinator
// @access  Private (Coordinator)
router.get('/my-assignments', auth, async (req, res) => {
    if (req.user.role !== 'coordinator') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        // Match if user is in 'coordinators' array OR is the legacy 'coordinatorId'
        const events = await Event.find({
            $or: [
                { coordinators: req.user.id },
                { coordinatorId: req.user.id }
            ]
        }).populate('departmentId', 'name');
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (College Admin)
router.delete('/:id', auth, async (req, res) => {
    // Allow 'college' or 'admin' (Super Admin)
    if (req.user.role !== 'college' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // If College Admin, check ownership
        if (req.user.role === 'college') {
            const User = require('../models/User');
            const user = await User.findById(req.user.id);

            // Check if event belongs to this college
            if (event.collegeId.toString() !== user.collegeId.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this event' });
            }
        }
        // If 'admin', skip ownership check (Super Admin can delete anything)

        await event.deleteOne();
        res.json({ message: 'Event removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/events/:id/complete
// @desc    Mark event as completed (Coordinator only)
// @access  Private (Coordinator)
router.put('/:id/complete', auth, async (req, res) => {
    if (req.user.role !== 'coordinator') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const isCoordinator = (event.coordinators && event.coordinators.includes(req.user.id)) ||
            (event.coordinatorId && event.coordinatorId.toString() === req.user.id);

        if (!isCoordinator) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        event.completed = true;
        await event.save();

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
