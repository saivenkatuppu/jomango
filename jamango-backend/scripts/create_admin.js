const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const createAdmin = async () => {
    try {
        const email = 'jamango@gmail.com';
        const password = '123456';

        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Updating to Admin...');
            user.password = password; // Will be hashed by pre-save middleware
            user.isAdmin = true;
            await user.save();
            console.log('User updated successfully.');
        } else {
            console.log('User not found. Creating new Admin...');
            user = await User.create({
                name: 'Jamango Admin',
                email,
                password,
                isAdmin: true,
            });
            console.log('Admin user created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
