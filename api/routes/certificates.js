const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// @route   POST api/certificates/generate
// @desc    Generate Certificate (Triggered by System/Admin or Self after completion)
// @access  Private
router.post('/generate', auth, async (req, res) => {
    try {
        const { registrationId } = req.body;

        const registration = await Registration.findById(registrationId);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (registration.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Check attendance and completion (logic depends on requirements, assuming checked before calling this or checked here)
        if (!registration.attendance) {
            return res.status(400).json({ message: 'Attendance not marked' });
        }

        // Mock PDF Generation
        // In real world: Use pdfkit or puppeteer to generate PDF, upload to S3/Cloudinary, get URL.
        const mockPdfUrl = `https://mock-certificate-url.com/cert_${registration._id}.pdf`;

        let certificate = new Certificate({
            registrationId: registration._id,
            studentId: registration.studentId,
            eventId: registration.eventId,
            pdfUrl: mockPdfUrl,
            sentViaEmail: true
        });

        await certificate.save();

        registration.certificateGenerated = true;
        await registration.save();

        res.json(certificate);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/certificates/my-certificates
// @desc    Get logged in user's certificates
// @access  Private (Student)
router.get('/my-certificates', auth, async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentId: req.user.id }).populate('eventId', 'name date');
        res.json(certificates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
