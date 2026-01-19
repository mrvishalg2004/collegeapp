const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Certificate = require('./models/Certificate');
const Registration = require('./models/Registration');

dotenv.config();

const fixCertificates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find certificates with mock URL
        const badCerts = await Certificate.find({ pdfUrl: { $regex: 'mock-certificate-url' } });
        console.log(`Found ${badCerts.length} certificates with mock URL.`);

        for (const cert of badCerts) {
            console.log(`Deleting invalid certificate for student: ${cert.studentId}`);

            // Allow regeneration by setting certificateGenerated to false on Registration
            await Registration.findByIdAndUpdate(cert.registrationId, { certificateGenerated: false });

            // Delete the certificate
            await Certificate.findByIdAndDelete(cert._id);
        }

        console.log('🎉 Cleanup complete. You can now re-generate certificates.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixCertificates();
