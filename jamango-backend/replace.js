const mongoose = require('mongoose');
require('dotenv').config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./models/Product');
    const StallMango = require('./models/StallMango');
    
    const products = await Product.find({ image: { $regex: '^http://' } });
    for (const p of products) {
        p.image = p.image.replace('http://', 'https://');
        await p.save();
    }
    
    const stallMangoes = await StallMango.find({ image: { $regex: '^http://' } });
    for (const sm of stallMangoes) {
        sm.image = sm.image.replace('http://', 'https://');
        await sm.save();
    }
    
    console.log('Replaced http with https in MongoDB');
    process.exit(0);
};

run().catch(console.error);
