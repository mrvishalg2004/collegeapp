const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Certificate = require('./models/Certificate');

dotenv.config();

const listCertificates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const certs = await Certificate.find({});
        console.log(`Found ${certs.length} certificates.`);

        certs.forEach(c => {
            console.log(`- ID: ${c._id}`);
            console.log(`  Student: ${c.studentId}`);
            console.log(`  URL: ${c.pdfUrl}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listCertificates();
