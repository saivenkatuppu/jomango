const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stall = require('./models/Stall');
const StallCustomer = require('./models/StallCustomer');

dotenv.config();

const seedCustomers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const stalls = await Stall.find({});
        if (stalls.length === 0) {
            console.error('No stalls found. Please run seed-stalls.js first.');
            process.exit(1);
        }

        const firstNames = ["Rahul", "Anjali", "Vikram", "Sneha", "Amit", "Priya", "Sanjay", "Deepa", "Karan", "Pooja", "Arjun", "Neha"];
        const lastNames = ["Sharma", "Verma", "Patil", "Deshmukh", "Joshi", "Kulkarni", "Gupta", "Malhotra", "Reddy", "Nair"];

        let totalAdded = 0;

        for (const stall of stalls) {
            // Add 3-5 customers per stall
            const customerCount = Math.floor(Math.random() * 3) + 3;

            for (let i = 0; i < customerCount; i++) {
                const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
                const name = `${fname} ${lname}`;

                // Create a phone number based on stall index and customer index to avoid unique constraint collisions
                const mobile = `9${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}${Math.floor(Math.random() * 1000)}`;

                try {
                    await StallCustomer.create({
                        name,
                        mobile,
                        stallId: stall.stallId,
                        stall: stall._id,
                        consent: true,
                        type: ['New', 'Repeat', 'Premium'][Math.floor(Math.random() * 3)],
                        notes: `Enjoys ${['Alphonso', 'Kesar', 'Badami'][Math.floor(Math.random() * 3)]} mangoes`,
                        purchasedVariety: ['Alphonso', 'Kesar', 'Badami'][Math.floor(Math.random() * 3)],
                        purchasedQuantity: Math.floor(Math.random() * 5) + 1
                    });
                    totalAdded++;
                } catch (e) {
                    // Ignore duplicates if they happen
                    if (e.code !== 11000) console.error(e);
                }
            }
            console.log(`Seeded customers for: ${stall.stallName}`);
        }

        console.log(`Successfully added ${totalAdded} test customers across ${stalls.length} stalls!`);
        process.exit(0);
    } catch (error) {
        console.error('Error during customer seeding:', error);
        process.exit(1);
    }
};

seedCustomers();
