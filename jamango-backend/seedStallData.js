require('dotenv').config();
const mongoose = require('mongoose');
const Stall = require('./models/Stall');
const StallMango = require('./models/StallMango');
const StallCustomer = require('./models/StallCustomer');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected.');
    } catch (error) {
        console.log('Error connecting to DB: ' + error.message);
        process.exit(1);
    }
};

const varietiesList = [
    { variety: 'Alphonso', price: 1200, priceUnit: 'per box', ripeningType: 'Natural', initQty: 50 },
    { variety: 'Kesar', price: 800, priceUnit: 'per box', ripeningType: 'Natural', initQty: 60 },
    { variety: 'Dasheri', price: 600, priceUnit: 'per box', ripeningType: 'Natural', initQty: 40 },
    { variety: 'Langra', price: 700, priceUnit: 'per box', ripeningType: 'Natural', initQty: 30 }
];

const names = ['Amit Patel', 'Neha Sharma', 'Rahul Gupta', 'Priya Singh', 'Anjali Desai', 'Suresh Kumar'];

async function trigger() {
    await connectDB();

    console.log('Clearing old test data (optional, skipping for safety)...');

    const stalls = await Stall.find({ status: 'Active' });
    if (stalls.length === 0) {
        console.log('No active stalls found.');
        process.exit(0);
    }

    console.log(`Found ${stalls.length} active stalls. Populating inventory...`);

    for (const stall of stalls) {
        // Create varieties if they don't exist
        for (const vData of varietiesList) {
            const existing = await StallMango.findOne({ stall: stall._id, variety: vData.variety });
            if (!existing) {
                await StallMango.create({
                    stallId: stall.stallId,
                    stall: stall._id,
                    variety: vData.variety,
                    ripeningType: vData.ripeningType,
                    price: vData.price,
                    priceUnit: vData.priceUnit,
                    quantity: vData.initQty,
                    qualityGrade: 'Premium',
                    status: 'In Stock'
                });
                console.log(`Added ${vData.variety} to ${stall.stallName}`);
            } else {
                // Update quantity just to be sure
                existing.quantity += vData.initQty;
                await existing.save();
            }
        }

        // Generate random sales over the past 30 days
        console.log(`Generating sales for ${stall.stallName}...`);

        for (let i = 0; i < 20; i++) {
            const randomVariety = varietiesList[Math.floor(Math.random() * varietiesList.length)];
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomDaysAgo = Math.floor(Math.random() * 30);

            const date = new Date();
            date.setDate(date.getDate() - randomDaysAgo);

            const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 boxes

            const customer = new StallCustomer({
                name: randomName,
                mobile: '98' + Math.floor(10000000 + Math.random() * 90000000), // Random 10-digit number starting with 98
                stallId: stall.stallId,
                stall: stall._id,
                purchasedVariety: randomVariety.variety,
                purchasedQuantity: qty,
                consent: true,
                type: 'New'
            });

            await customer.save(); // Save first to get the document

            // Manually update the createdAt field to simulate past sales
            await StallCustomer.findByIdAndUpdate(customer._id, { createdAt: date, updatedAt: date });
        }
    }

    console.log('Successfully seeded inventory and sales data for all active stalls.');
    process.exit(0);
}

trigger();
