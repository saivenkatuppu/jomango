require('dotenv').config();
const mongoose = require('mongoose');
const Stall = require('./models/Stall');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const testLock = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) { console.log("No admin user found."); return process.exit(1); }

    // Simulate token auth middleware manually
    const req = { user: adminUser, params: {} };
    const res = { json: (data) => console.log("Success:", data), status: (code) => console.log("Status:", code) };

    // Admin middleware simulation
    if (!(req.user && (req.user.isAdmin || req.user.role === 'admin'))) {
        console.log("Not authorized as admin"); return process.exit(1);
    }

    const stall = await Stall.findOne({ stallName: /Hyderabad/i });
    if (!stall) { console.log("Stall not found"); return process.exit(1); }
    req.params.id = stall._id.toString();

    try {
        const dbStall = await Stall.findById(req.params.id);
        dbStall.isLocked = !dbStall.isLocked;
        await dbStall.save();
        console.log("Successfully toggled lock status. New status:", dbStall.isLocked);
    } catch (e) {
        console.error("Error toggling:", e.message);
    }
    process.exit(0);
};

testLock();
