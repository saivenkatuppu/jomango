const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Do NOT call process.exit(1) — let the server stay up so routes are accessible
        // Requests requiring DB will fail gracefully with 500 errors
    }
};

module.exports = connectDB;
