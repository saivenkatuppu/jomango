const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Stall = require('../models/Stall');
const User = require('../models/User');
const StallCustomer = require('../models/StallCustomer');
const Product = require('../models/Product');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const wipeStallData = async () => {
    try {
        console.log('🔴 STARTING STALL DATABASE CLEANUP...');

        // 1. Delete all Stalls
        const stallDelete = await Stall.deleteMany({});
        console.log(`✅ Deleted ${stallDelete.deletedCount} Stall(s)`);

        // 2. Delete all Stall Owners (Users with role 'stall_owner')
        // Some users might have role set to 'stall_owner'
        const userDelete = await User.deleteMany({ role: 'stall_owner' });
        console.log(`✅ Deleted ${userDelete.deletedCount} Stall Owner Account(s)`);

        // 3. Delete all Stall Customers
        const customerDelete = await StallCustomer.deleteMany({});
        console.log(`✅ Deleted ${customerDelete.deletedCount} CRM Customer Record(s)`);

        // 4. Delete stall-specific products (those with a stallId)
        const productDelete = await Product.deleteMany({ stallId: { $exists: true, $ne: "" } });
        console.log(`✅ Deleted ${productDelete.deletedCount} Stall-specific Product(s)`);

        console.log('✨ DATABASE CLEANUP COMPLETE. ALL STALL DATA REMOVED.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during cleanup: ${error.message}`);
        process.exit(1);
    }
};

// Check if user really wants to do this (just a console reminder)
console.log('WARNING: This will permanently delete ALL stalls, owners, customers, and stall products.');
console.log('Starting in 2 seconds...');

setTimeout(wipeStallData, 2000);
