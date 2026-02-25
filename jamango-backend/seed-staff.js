const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createStaffUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const staffData = [
            { name: "Staff Member 1", phone: "9900000001" },
            { name: "Staff Member 2", phone: "9900000002" },
            { name: "Staff Member 3", phone: "9900000003" },
            { name: "Staff Member 4", phone: "9900000004" },
            { name: "Staff Member 5", phone: "9900000005" },
            { name: "Staff Member 6", phone: "9900000006" },
            { name: "Staff Member 7", phone: "9900000007" },
            { name: "Staff Member 8", phone: "9900000008" },
            { name: "Staff Member 9", phone: "9900000009" },
            { name: "Staff Member 10", phone: "9900000010" }
        ];

        for (const data of staffData) {
            let user = await User.findOne({ phone: data.phone });
            if (!user) {
                await User.create({
                    name: data.name,
                    phone: data.phone,
                    email: data.phone + "@jamango.staff", // Unique email required per schema
                    password: "staffPassword123",
                    role: 'staff',
                    status: 'active'
                });
                console.log(`Created: ${data.name} (${data.phone})`);
            } else {
                console.log(`Skipped (Exists): ${data.name} (${data.phone})`);
            }
        }

        console.log('All 10 staff accounts are ready!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding staff:', error);
        process.exit(1);
    }
};

createStaffUsers();
