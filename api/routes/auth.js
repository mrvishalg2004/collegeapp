const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, collegeId, departmentId } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            passwordHash,
            role: role || 'student',
            collegeId: collegeId || null,
            departmentId: departmentId || null
        });

        await user.save();

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, collegeId: user.collegeId } });

    } catch (err) {
        console.error('❌ Register Error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Attempting login for: ${email}`);

        // Check user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.log(`Invalid password for: ${email}`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        console.log(`User ${email} authenticated successfully. Role: ${user.role}`);

        // Check College Status if applicable
        if (user.collegeId) {
            console.log(`Checking college status for: ${user.collegeId}`);
            const college = await College.findById(user.collegeId);
            if (college && college.status === 'inactive') {
                console.log(`College ${user.collegeId} is blocked.`);
                return res.status(403).json({ message: 'This college is currently blocked by administration. Please contact your administrator.' });
            }
        }

        // Return Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, collegeId: user.collegeId, departmentId: user.departmentId } });

    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Current User (Protected)
router.get('/me', async (req, res) => {
    // Basic middleware for token check (inline for simplicity or move to middleware)
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

module.exports = router;
