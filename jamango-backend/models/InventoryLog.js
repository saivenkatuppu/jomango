const mongoose = require('mongoose');

const inventoryLogSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        previousStock: {
            type: Number,
            required: true,
        },
        newStock: {
            type: Number,
            required: true,
        },
        adjustmentAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            default: 'Manual adjustment',
        },
        adjustedBy: {
            type: String,
            default: 'Admin',
        }
    },
    {
        timestamps: true,
    }
);

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;
