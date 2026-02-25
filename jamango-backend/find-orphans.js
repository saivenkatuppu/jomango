const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stall = require('./models/Stall');
const StallCustomer = require('./models/StallCustomer');

dotenv.config();

const findOrphanedCustomers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Orphan Finder: Connected to MongoDB');

        const customers = await StallCustomer.find({}).lean();
        const stalls = await Stall.find({}).lean();
        const stallIds = stalls.map(s => s._id.toString());

        const orphaned = customers.filter(c => !stallIds.includes(c.stall.toString()));

        if (orphaned.length === 0) {
            console.log('No orphaned customers found.');
        } else {
            console.log(`Found ${orphaned.length} orphaned customers:`);
            orphaned.forEach(c => {
                console.log(`- Customer: ${c.name} (${c.mobile}), Linked Stall ID: ${c.stall}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findOrphanedCustomers();
