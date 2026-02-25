require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Stall = require('./models/Stall');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stallOwners = await User.find({ role: 'stall_owner' }).populate('assignedStall');
        console.log("\n====== STALL OWNER ACCOUNTS ======");
        stallOwners.forEach(u => {
            console.log(`Stall ID/Name: ${u.assignedStall ? u.assignedStall.stallName : 'Unassigned'} (${u.stallId})`);
            console.log(`Name: ${u.name}`);
            console.log(`Login Email/Mobile: ${u.email}`);
            console.log(`Password: password123`); // Standard password used during seeding
            console.log("----------------------------------");
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
connectDB();
