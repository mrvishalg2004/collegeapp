const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./api/models/User');

async function fixDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fix ghrceevent@gmail.com and Kunal@gmail.com
        const correctCollegeId = '699d2f0ebf83556c30548da3';

        const result = await User.updateMany(
            { collegeId: '696e3f6a6436a649328ae0a0' },
            { $set: { collegeId: new mongoose.Types.ObjectId(correctCollegeId) } }
        );

        console.log(`Updated ${result.modifiedCount} users to correct collegeId.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDb();
