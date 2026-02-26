const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Order = require('./models/Order');
    const items = await Order.find().sort({ createdAt: -1 }).limit(3).lean();
    console.log(JSON.stringify(items, null, 2));
    process.exit();
}
run();
