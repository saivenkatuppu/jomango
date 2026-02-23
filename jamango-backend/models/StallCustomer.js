const mongoose = require('mongoose');

const stallCustomerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        stallId: {
            type: String, // References the human-readable stallId or ObjectId? 
            // Let's use ObjectId for robust linking and stallId string for quick reference.
            required: true,
        },
        stall: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stall',
            required: true,
        },
        email: {
            type: String,
        },
        purchasedVariety: {
            type: String,
        },
        purchasedQuantity: {
            type: Number,
        },
        consent: {
            type: Boolean,
            required: true,
            default: false,
        },
        consentDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
        },
        purchaseHistory: [
            {
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
                date: { type: Date, default: Date.now },
                amount: Number,
                items: Array
            }
        ],
        type: {
            type: String,
            enum: ['New', 'Repeat', 'Premium'],
            default: 'New'
        }
    },
    {
        timestamps: true,
    }
);

// Compound index to allow same customer to be recorded at different stalls but uniquely per stall for easier CRM
stallCustomerSchema.index({ mobile: 1, stall: 1 }, { unique: true });

const StallCustomer = mongoose.model('StallCustomer', stallCustomerSchema);

module.exports = StallCustomer;
