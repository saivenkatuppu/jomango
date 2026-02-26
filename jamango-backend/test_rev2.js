const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/jamangostore', {}).then(async () => {
    try {
        const Order = require('./models/Order');

        // Test without any date
        let res = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log("No paymentStatus filter:", res);

        let res2 = await Order.aggregate([
            { $match: { paymentStatus: 'paid', status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log("paymentStatus: 'paid':", res2);

        // Orders created today vs all-time
        let allOrders = await Order.find().select('totalAmount paymentStatus status createdAt paymentMode');
        console.log("All orders:");
        allOrders.forEach(o => console.log(` - ID: ${o._id}, Amount: ${o.totalAmount}, paymentStatus: ${o.paymentStatus}, paymentMode: ${o.paymentMode}, createdAt: ${o.createdAt}, status: ${o.status}`));

    } catch (e) { console.error(e) }
    process.exit(0);
});
