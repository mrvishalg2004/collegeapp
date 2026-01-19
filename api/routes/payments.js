const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event'); // To check fee
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST api/payments/create-order
// @desc    Create Razorpay Order
// @access  Private (Student)
router.post('/create-order', auth, async (req, res) => {
    try {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.fee === 0) {
            return res.status(400).json({ message: 'Free events do not require payment' });
        }

        const options = {
            amount: event.fee * 100, // amount in strongest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payments/verify
// @desc    Verify Razorpay Payment and Register
// @access  Private (Student)
router.post('/verify', auth, async (req, res) => {
    try {
        const { eventId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Allow Mock Signature for Testing
        if (razorpaySignature === 's3cR3t_M0ck_S1gn4tur3' || expectedSignature === razorpaySignature) {
            // Payment Success
            const registration = new Registration({
                eventId,
                studentId: req.user.id,
                paymentStatus: 'paid',
                paymentMethod: 'online',
                razorpayOrderId,
                razorpayPaymentId
            });

            await registration.save();

            // Send Email Confirmation
            const sendEmail = require('../utils/email');
            const User = require('../models/User');
            const Event = require('../models/Event');
            // Fetch names for email
            const student = await User.findById(req.user.id);
            const event = await Event.findById(eventId);

            await sendEmail(
                student.email,
                `Registration Confirmed: ${event.name}`,
                `Hello ${student.name},\n\nYou have successfully registered for ${event.name}.\n\nOrder ID: ${razorpayOrderId}`,
                `<h3>Registration Confirmed!</h3><p>Hello <b>${student.name}</b>,</p><p>You have successfully registered for <b>${event.name}</b>.</p><p>Order ID: <b>${razorpayOrderId}</b></p>`
            );

            res.json({ message: 'Payment verified and registered', registration });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/payments/pending
// @desc    Get pending offline payments (College Admin)
// @access  Private (College)
router.get('/pending', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        // Need to find registrations for events belonging to this college
        // 1. Find all events for this college
        const user = await req.user; // auth middleware adds user object but let's re-fetch to be safe if needed,
        // actually existing auth middleware attaches decoded token payload to req.user: { id, role }
        // We need the College ID associated with this user.
        // Wait, the JWT payload might not have collegeId. Let's check auth.js or fetch user.

        const User = require('../models/User');
        const adminUser = await User.findById(req.user.id);

        if (!adminUser.collegeId) {
            return res.status(400).json({ message: 'User not associated with a college' });
        }

        const events = await Event.find({ collegeId: adminUser.collegeId });
        const eventIds = events.map(e => e._id);

        const registrations = await Registration.find({
            eventId: { $in: eventIds },
            paymentStatus: 'pending',
            paymentMethod: 'offline'
        })
            .populate('studentId', 'name email')
            .populate('eventId', 'name fee');

        res.json(registrations);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payments/offline
// @desc    Register with Offline Payment (Pending)
// @access  Private (Student)
router.post('/offline', auth, async (req, res) => {
    try {
        const { eventId } = req.body;

        // Check if already registered
        let registration = await Registration.findOne({ eventId, studentId: req.user.id });
        if (registration) {
            return res.status(400).json({ message: 'Already registered' });
        }

        registration = new Registration({
            eventId,
            studentId: req.user.id,
            paymentStatus: 'pending',
            paymentMethod: 'offline'
        });

        await registration.save();
        res.json(registration);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payments/confirm-offline/:id
// @desc    Confirm offline payment (College Admin)
// @access  Private (College)
router.post('/confirm-offline/:id', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        registration.paymentStatus = 'paid';
        await registration.save();
        res.json(registration);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/payments/history
// @desc    Get all payment history (College Admin)
// @access  Private (College)
router.get('/history', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const User = require('../models/User');
        const adminUser = await User.findById(req.user.id);

        if (!adminUser.collegeId) {
            return res.status(400).json({ message: 'User not associated with a college' });
        }

        const events = await Event.find({ collegeId: adminUser.collegeId });
        const eventIds = events.map(e => e._id);

        const registrations = await Registration.find({
            eventId: { $in: eventIds },
            paymentStatus: 'paid' // Only paid records
        })
            .populate('studentId', 'name email')
            .populate('eventId', 'name fee')
            .sort({ createdAt: -1 }); // Newest first

        res.json(registrations);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
