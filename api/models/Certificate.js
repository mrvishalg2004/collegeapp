const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    pdfUrl: { type: String, required: true }, // Could be a public URL or base64 (if small)
    sentViaEmail: { type: Boolean, default: false },
    issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
