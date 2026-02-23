const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from api/public
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);
app.use('/public', express.static(publicPath));

// Redirect singular /public/certificate to plural /public/certificates for backward compatibility
app.use('/public/certificate', (req, res) => {
    const target = `/public/certificates${req.url}`;
    console.log(`Redirecting from ${req.originalUrl} to ${target}`);
    res.redirect(301, target);
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB Atlas');

        // Seed Admin User
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');

        try {
            const adminEmail = 'admin@gmail.com';
            const adminExists = await User.findOne({ email: adminEmail });
            if (!adminExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin@gmail.com', salt);

                const newAdmin = new User({
                    name: 'Super Admin',
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    role: 'admin'
                });
                await newAdmin.save();
                console.log('👑 Admin Account Seeded: admin@gmail.com / admin@gmail.com');
            } else {
                console.log('👑 Admin Account Exists');
            }
        } catch (seedErr) {
            console.error('Seed Error:', seedErr);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        // process.exit(1); // Don't crash in dev if DB fails temporarily
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/events', require('./routes/events'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/registrations', require('./routes/registrations'));

app.get('/', (req, res) => {
    res.send('EventCraft API is Running');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
