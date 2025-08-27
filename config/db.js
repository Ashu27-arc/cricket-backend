// config/db.js
const mongoose = require('mongoose');

async function connectDB(mongoUri) {
    try {
        await mongoose.connect(mongoUri, {
            // mongoose 7 has sensible defaults; leave options minimal
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
