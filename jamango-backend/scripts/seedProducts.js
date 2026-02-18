const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('../models/Product');

const products = [
    // 3 KG Box variants
    {
        name: 'Banganapalli 3KG Box',
        variety: 'Banganapalli',
        weight: 3,
        price: 899,
        stock: 50,
        active: true,
        badge: 'BEST SELLER',
        description: 'Classic Andhra favourite. Sweet, fibre-free, golden flesh.',
    },
    {
        name: 'Kesar 3KG Box',
        variety: 'Kesar',
        weight: 3,
        price: 1099,
        stock: 40,
        active: true,
        badge: '',
        description: 'The Queen of Mangoes from Gujarat. Rich saffron colour and aroma.',
    },
    {
        name: 'Alphonso 3KG Box',
        variety: 'Alphonso',
        weight: 3,
        price: 1299,
        stock: 30,
        active: true,
        badge: 'PREMIUM',
        description: 'The King of Mangoes. Buttery texture, zero strings, divine taste.',
    },

    // 5 KG Box variants
    {
        name: 'Banganapalli 5KG Box',
        variety: 'Banganapalli',
        weight: 5,
        price: 1399,
        stock: 50,
        active: true,
        badge: 'BEST SELLER',
        description: 'Classic Andhra favourite. Sweet, fibre-free, golden flesh.',
    },
    {
        name: 'Kesar 5KG Box',
        variety: 'Kesar',
        weight: 5,
        price: 1599,
        stock: 40,
        active: true,
        badge: '',
        description: 'The Queen of Mangoes from Gujarat. Rich saffron colour and aroma.',
    },
    {
        name: 'Alphonso 5KG Box',
        variety: 'Alphonso',
        weight: 5,
        price: 1899,
        stock: 30,
        active: true,
        badge: 'PREMIUM',
        description: 'The King of Mangoes. Buttery texture, zero strings, divine taste.',
    },
    {
        name: 'Mixed Harvest 5KG Box',
        variety: 'Mixed Harvest',
        weight: 5,
        price: 1599,
        stock: 25,
        active: true,
        badge: 'SEASONAL MIX',
        description: "Can't decide? Enjoy a curated mix of seasonal mangoes.",
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check if products already exist
        const existing = await Product.countDocuments();
        if (existing > 0) {
            console.log(`⚠️  ${existing} products already exist in DB.`);
            console.log('Deleting existing products and re-seeding...');
            await Product.deleteMany({});
        }

        const inserted = await Product.insertMany(products);
        console.log(`✅ Seeded ${inserted.length} products successfully:`);
        inserted.forEach((p) => console.log(`   - ${p.name} (₹${p.price})`));

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message);
        process.exit(1);
    }
};

seed();
