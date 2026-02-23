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
        const { name, email, password, subscriptionPrice, subscriptionDuration } = req.body;

        let college = await College.findOne({ email });
        if (college) {
            return res.status(400).json({ message: 'College already exists with this email' });
        }

        college = new College({
            name,
            email,
            subscriptionPrice: subscriptionPrice || 0,
            subscriptionDuration: subscriptionDuration || 12
        });
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

// @route   PUT api/colleges/:id
// @desc    Update a college (Admin only)
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { name, email, status } = req.body;
        let college = await College.findById(req.params.id);

        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // Update fields if provided
        if (name) college.name = name;
        if (email) college.email = email;
        if (status) college.status = status;

        await college.save();
        res.json(college);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/colleges/:id
// @desc    Get college by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) return res.status(404).json({ message: 'College not found' });
        res.json(college);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/colleges/:id/pay
// @desc    Pay subscription and activate
// @access  Private (College)
router.post('/:id/pay', auth, async (req, res) => {
    try {
        const college = await College.findById(req.params.id);
        if (!college) return res.status(404).json({ message: 'College not found' });

        // Update subscription
        college.subscriptionStatus = 'paid';
        college.paidAt = Date.now();

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (college.subscriptionDuration || 12));
        college.subscriptionExpiry = expiryDate;

        await college.save();
        res.json({ message: 'Subscription activated', college });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/colleges/departments/:id
// @desc    Update a department (College Admin only)
// @access  Private (College)
router.put('/departments/:id', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { name } = req.body;
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Verify ownership (optional but recommended: ensure dept belongs to user's college)
        // Leaving simple for now or perform check:
        // const user = await User.findById(req.user.id);
        // if (department.collegeId.toString() !== user.collegeId.toString()) return 401...

        department.name = name;
        await department.save();

        res.json(department);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/colleges/departments/:id
// @desc    Delete a department (College Admin only)
// @access  Private (College)
router.delete('/departments/:id', auth, async (req, res) => {
    if (req.user.role !== 'college') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        await department.deleteOne();
        res.json({ message: 'Department removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/colleges/coordinators
// @desc    Create a Coordinator (College Admin only)
// @access  Private (College)
router.post('/coordinators', auth, async (req, res) => {
    if (req.user.role !== 'college') return res.status(403).json({ message: 'Access denied' });

    try {
        const { name, email, password } = req.body;
        const CollegeUser = await User.findById(req.user.id);

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newCoordinator = new User({
            name,
            email,
            passwordHash,
            role: 'coordinator',
            collegeId: CollegeUser.collegeId
        });

        await newCoordinator.save();
        res.json(newCoordinator);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/colleges/coordinators
// @desc    Get all coordinators for the college
// @access  Private (College)
router.get('/coordinators', auth, async (req, res) => {
    if (req.user.role !== 'college') return res.status(403).json({ message: 'Access denied' });

    try {
        const CollegeUser = await User.findById(req.user.id);
        const coordinators = await User.find({
            collegeId: CollegeUser.collegeId,
            role: 'coordinator'
        }).select('-passwordHash');

        res.json(coordinators);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/colleges/coordinators/:id
// @desc    Delete a Coordinator
// @access  Private (College)
router.delete('/coordinators/:id', auth, async (req, res) => {
    if (req.user.role !== 'college') return res.status(403).json({ message: 'Access denied' });

    try {
        const coordinator = await User.findById(req.params.id);
        if (!coordinator) return res.status(404).json({ message: 'User not found' });

        // Ensure we are deleting a coordinator from OUR college
        const CollegeUser = await User.findById(req.user.id);
        if (coordinator.collegeId.toString() !== CollegeUser.collegeId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await coordinator.deleteOne();
        res.json({ message: 'Coordinator removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
