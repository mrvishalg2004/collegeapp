const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentMethod: { type: String, enum: ['online', 'offline'], default: 'offline' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    attendance: { type: Boolean, default: false },
    certificateGenerated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
