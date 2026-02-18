const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        variety: {
            type: String,
            required: true,
            trim: true,
            // e.g. "Banganapalli", "Kesar", "Alphonso", "Mixed Harvest"
        },
        weight: {
            type: Number,
            required: true,
            // in KG, e.g. 3 or 5
        },
        price: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            default: '',
        },
        badge: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
