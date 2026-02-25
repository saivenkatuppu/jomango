const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stall = require('./models/Stall');
const User = require('./models/User');

dotenv.config();

const createTestStalls = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ isAdmin: true });
        if (!admin) {
            console.error('Fatal: No Admin user found. Seed aborted.');
            process.exit(1);
        }

        const testStalls = [
            { name: "Pune Orchard Hub", id: "ST-PUN-01", owner: "Aditya", phone: "9800000001", loc: "Pune" },
            { name: "Mumbai Mango Point", id: "ST-MUM-01", owner: "Sagar", phone: "9800000002", loc: "Mumbai" },
            { name: "Nashik Fresh Store", id: "ST-NSK-01", owner: "Rahul", phone: "9800000003", loc: "Nashik" },
            { name: "Bangalore Fruit Zone", id: "ST-BNG-01", owner: "Kiran", phone: "9800000004", loc: "Bangalore" },
            { name: "Hyderabad Jamango", id: "ST-HYD-01", owner: "Venkatesh", phone: "9800000005", loc: "Hyderabad" },
            { name: "Delhi Orchard Express", id: "ST-DEL-01", owner: "Amit", phone: "9800000006", loc: "Delhi" },
            { name: "Ahmedabad King Store", id: "ST-AHM-01", owner: "Jigar", phone: "9800000007", loc: "Ahmedabad" },
            { name: "Surat Mango Mart", id: "ST-SUR-01", owner: "Pratik", phone: "9800000008", loc: "Surat" },
            { name: "Nagpur Orange City Stall", id: "ST-NAG-01", owner: "Manoj", phone: "9800000009", loc: "Nagpur" },
            { name: "Goa Beach Orchard", id: "ST-GOA-01", owner: "Ricardo", phone: "9800000010", loc: "Goa" }
        ];

        for (const data of testStalls) {
            // Check if user exists
            let user = await User.findOne({ phone: data.phone });
            if (!user) {
                user = await User.create({
                    name: data.owner,
                    phone: data.phone,
                    email: data.phone, // Using phone as email like standard login
                    password: "password123",
                    role: 'stall_owner',
                    stallId: data.id
                });
            }

            // Check if stall exists
            let stall = await Stall.findOne({ stallId: data.id });
            if (!stall) {
                stall = await Stall.create({
                    stallName: data.name,
                    stallId: data.id,
                    ownerName: data.owner,
                    ownerMobile: data.phone,
                    location: data.loc,
                    address: `Test address for ${data.name}, ${data.loc}`,
                    stallType: "Permanent",
                    status: "Active",
                    createdBy: admin._id
                });

                user.assignedStall = stall._id;
                await user.save();
                console.log(`Created: ${data.name}`);
            } else {
                console.log(`Skipped (Exists): ${data.name}`);
            }
        }

        console.log('All 10 test stalls are ready!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

createTestStalls();
