const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const user = await User.findOne({ role: 'admin' });
    console.log(user ? user.email : 'No admin found');
    process.exit();
}
run();
