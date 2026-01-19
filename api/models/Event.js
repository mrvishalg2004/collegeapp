const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Optional (if college-wide)
    coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Multiple Coordinators
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Deprecated, keeping for backward compat if needed (but we will migrate logic)
    name: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    venue: String,
    fee: { type: Number, required: true, default: 0 },
    maxParticipants: { type: Number, default: 100 },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
