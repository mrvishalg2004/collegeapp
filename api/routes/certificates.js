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
const generateCertificate = require('../utils/certificateGenerator');
const sendEmail = require('../utils/email');
const path = require('path');
const fs = require('fs');

// @route   POST api/certificates/generate
// @desc    Generate Certificate (Triggered by System/Admin or Self after completion)
// @access  Private
router.post('/generate', auth, async (req, res) => {
    try {
        const { registrationId } = req.body;

        const registration = await Registration.findById(registrationId)
            .populate('studentId', 'name email')
            .populate({
                path: 'eventId',
                populate: { path: 'collegeId', select: 'name' }
            });

        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (registration.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Check attendance
        if (!registration.attendance) {
            return res.status(400).json({ message: 'Attendance not marked' });
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({ registrationId });
        if (existingCert) {
            return res.json(existingCert);
        }

        const studentName = registration.studentId.name;
        const studentEmail = registration.studentId.email;
        const eventName = registration.eventId.name;
        const eventDate = registration.eventId.date;
        const collegeName = registration.eventId.collegeId.name;

        // Generate PDF
        const { filePath, relativePath, fileName } = await generateCertificate(studentName, eventName, eventDate, collegeName);

        // Construct URL (Replace localhost with actual IP in prod, or handle on client)
        // For development, we store the relative path or a constructed URL if we know the host
        // Best to store relative and prepend base URL on client, OR store full URL here if we know env.
        // Let's assume common IP for now or use relative.
        const pdfUrl = `http://192.168.1.4:3000${relativePath}`;

        let certificate = new Certificate({
            registrationId: registration._id,
            studentId: registration.studentId._id,
            eventId: registration.eventId._id,
            pdfUrl: pdfUrl,
            sentViaEmail: true
        });

        await certificate.save();

        registration.certificateGenerated = true;
        await registration.save();

        // Send Email
        const emailSubject = `Certificate of Participation - ${eventName}`;
        const emailText = `Dear ${studentName},\n\nCongratulations! You have successfully completed the event "${eventName}" at ${collegeName}.\n\nPlease find your certificate attached.\n\nBest Regards,\nEvent Team`;
        const emailHtml = `
            <h3>Certificate of Participation</h3>
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>Congratulations! You have successfully completed the event <strong>${eventName}</strong> at <strong>${collegeName}</strong>.</p>
            <p>Please find your certificate attached.</p>
            <br/>
            <p>Best Regards,<br/>Event Team</p>
        `;

        await sendEmail(studentEmail, emailSubject, emailText, emailHtml, [
            {
                filename: fileName,
                path: filePath
            }
        ]);

        res.json(certificate);

    } catch (err) {
        console.error(err); // Log full error
        res.status(500).send('Server Error: ' + err.message);
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
