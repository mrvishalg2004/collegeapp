const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./models/Event');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const events = await Event.find({});
        console.log("Found", events.length, "events:");
        events.forEach(e => {
            console.log(`- [${e._id}] ${e.name} (${e.date})`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
