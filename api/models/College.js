const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // College Admin login email
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    subscriptionPrice: { type: Number, default: 0 },
    subscriptionDuration: { type: Number, default: 12 }, // in months
    subscriptionStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    subscriptionExpiry: { type: Date },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', CollegeSchema);
