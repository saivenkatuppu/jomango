const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stall = require('./models/Stall');
const StallCustomer = require('./models/StallCustomer');

dotenv.config();

const cleanupOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all existing stall IDs
        const stalls = await Stall.find({});
        const validStallIds = stalls.map(s => s._id.toString());

        console.log(`Checking CRM records against ${validStallIds.length} active stalls...`);

        // Delete customers who belong to a stall ID that is NOT in our valid list
        const result = await StallCustomer.deleteMany({
            stall: { $nin: validStallIds }
        });

        console.log(`Successfully removed ${result.deletedCount} orphaned "Deleted Store" records.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupOrphans();
