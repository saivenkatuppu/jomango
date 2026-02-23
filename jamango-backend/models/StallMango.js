const mongoose = require('mongoose');

const stallMangoSchema = mongoose.Schema(
    {
        stallId: {
            type: String,
            required: false, // Optional for global templates
        },
        stall: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stall',
            required: false,
        },
        variety: {
            type: String,
            required: true,
            trim: true,
        },
        ripeningType: {
            type: String,
            enum: ['Natural', 'Carbide-Free', 'Other'],
            default: 'Natural',
        },
        price: {
            type: Number,
            required: true,
        },
        priceUnit: {
            type: String,
            enum: ['per kg', 'per box'],
            default: 'per kg',
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        qualityGrade: {
            type: String,
            enum: ['A', 'Premium', 'Export'],
            default: 'A',
        },
        status: {
            type: String,
            enum: ['In Stock', 'Sold Out'],
            default: 'In Stock',
        },
        isGlobalTemplate: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const StallMango = mongoose.model('StallMango', stallMangoSchema);

module.exports = StallMango;
