const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const startDate = '2026-02-26';
    const endDate = '2026-02-26';

    let rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    let rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    try {
        const totalOrders = await Order.countDocuments();
        console.log('Total orders in DB:', totalOrders);

        const count = await Order.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd } });
        console.log('Orders found in range:', count);

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid', status: { $ne: 'Cancelled' }, createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('Revenue in range:', revenueResult);
    } catch (e) { console.error('Error in query', e); }

    process.exit();
}
run();
