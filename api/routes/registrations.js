const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @route   PUT api/registrations/:id/attendance
// @desc    Mark attendance (Coordinator only)
// @access  Private (Coordinator)
router.put('/:id/attendance', auth, async (req, res) => {
    if (req.user.role !== 'coordinator') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { status } = req.body; // boolean
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if coordinator is assigned to this event
        const event = await Event.findById(registration.eventId);
        const isCoordinator = (event.coordinators && event.coordinators.includes(req.user.id)) ||
            (event.coordinatorId && event.coordinatorId.toString() === req.user.id);

        if (!isCoordinator) {
            return res.status(401).json({ message: 'Not authorized for this event' });
        }

        registration.attendance = status;
        await registration.save();

        res.json(registration);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
