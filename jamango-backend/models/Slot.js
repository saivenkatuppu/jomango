const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            // e.g. "10:00 AM – 12:00 PM"
        },
        startTime: {
            type: String,
            required: true,
            // e.g. "10:00"
        },
        endTime: {
            type: String,
            required: true,
            // e.g. "12:00"
        },
        maxOrders: {
            type: Number,
            required: true,
            default: 20,
        },
        currentOrders: {
            type: Number,
            default: 0,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
