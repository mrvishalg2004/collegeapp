const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const College = require('../models/College');
const Department = require('../models/Department');
const User = require('../models/User');

// @route   POST api/colleges
// @desc    Create a college (Admin only)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { name, email, password } = req.body;

        let college = await College.findOne({ email });
        if (college) {
            return res.status(400).json({ message: 'College already exists with this email' });
        }

        college = new College({ name, email });
        await college.save();

        // Create College Admin User
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || '123456', salt); // Default if not provided

        const newAdmin = new User({
            name: `${name} Admin`,
            email: email,
            passwordHash: hashedPassword,
            role: 'college',
            collegeId: college._id
        });
        await newAdmin.save();

        res.json({ college, adminUser: newAdmin });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/colleges
// @desc    Get all colleges
// @access  Public
router.get('/', async (req, res) => {
    try {
        const colleges = await College.find();
        res.json(colleges);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/colleges/departments
// @desc    Add a department (College Admin only)
// @access  Private (College)
router.post('/departments', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        // Find the college associated with this user
        // In a real app, we'd probably store collegeId on the user better or look it up.
        // Assuming the user model has collegeId populated for College Admins.
        const user = await User.findById(req.user.id);
        if (!user.collegeId) {
            return res.status(400).json({ message: 'User not associated with a college' });
        }

        const { name } = req.body;
        const department = new Department({
            collegeId: user.collegeId,
            name
        });

        await department.save();
        res.json(department);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/colleges/:id/departments
// @desc    Get departments of a college
// @access  Public
router.get('/:id/departments', async (req, res) => {
    try {
        const departments = await Department.find({ collegeId: req.params.id });
        res.json(departments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/colleges/:id
// @desc    Delete a college (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const college = await College.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        await college.deleteOne(); // or remove() depending on Mongoose version

        // Optional: Delete associated departments, events, users?
        // For now, let's keep it simple or maybe delete the admin user strictly associated?
        // Leaving cascades for later to avoid accidental data loss without warning.

        res.json({ message: 'College removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
