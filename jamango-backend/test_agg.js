require('dotenv').config();
const mongoose = require('mongoose');
const StallCustomer = require('./models/StallCustomer.js');
const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const adminStats = await StallCustomer.aggregate([
            { $match: {} },
            { $group: { _id: '$stall', count: { $sum: 1 } } },
            { $lookup: { from: 'stalls', localField: '_id', foreignField: '_id', as: 'stallInfo' } },
            { $unwind: '$stallInfo' },
            { $project: { stallName: '$stallInfo.stallName', stallId: '$stallInfo.stallId', count: 1 } }
        ]);
        console.log('Admin Stats:', adminStats);

        // Let's test specific stalls
        const stalls = await StallCustomer.distinct('stall');
        for (let s of stalls) {
            const ownerStats = await StallCustomer.aggregate([
                { $match: { stall: s } },
                { $group: { _id: '$stall', count: { $sum: 1 } } },
                { $lookup: { from: 'stalls', localField: '_id', foreignField: '_id', as: 'stallInfo' } },
                { $unwind: '$stallInfo' },
                { $project: { stallName: '$stallInfo.stallName', stallId: '$stallInfo.stallId', count: 1 } }
            ]);
            console.log('Owner Stats for', s, ':', ownerStats);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit();
}
test().catch(console.error);
