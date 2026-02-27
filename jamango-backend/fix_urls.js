const mongoose = require('mongoose');
require('dotenv').config();
const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./models/Product');
    const StallMango = require('./models/StallMango');
    const products = await Product.find({ image: { $regex: '^https://(localhost|127\\.0\\.0\\.1|192\\.168\\.|10\\.)' } });
    for (const p of products) {
        p.image = p.image.replace('https://', 'http://');
        await p.save();
    }
    const stallMangoes = await StallMango.find({ image: { $regex: '^https://(localhost|127\\.0\\.0\\.1|192\\.168\\.|10\\.)' } });
    for (const sm of stallMangoes) {
        sm.image = sm.image.replace('https://', 'http://');
        await sm.save();
    }
    console.log('Reverted local https back to http for local testing');
    process.exit(0);
};
run().catch(console.error);
