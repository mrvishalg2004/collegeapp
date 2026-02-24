const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./api/models/User');
const College = require('./api/models/College');

async function debugDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const colleges = await College.find();
        console.log('\n--- COLLEGES ---');
        colleges.forEach(c => console.log(`ID: ${c._id}, Name: ${c.name}, Email: ${c.email}`));

        const users = await User.find();
        console.log('\n--- USERS ---');
        users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, CollegeId: ${u.collegeId}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugDb();
