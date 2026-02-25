const mongoose = require('mongoose');

const stallSchema = mongoose.Schema(
    {
        stallName: {
            type: String,
            required: true,
            trim: true,
        },
        stallId: {
            type: String,
            required: true,
            unique: true,
            // e.g., "STAL-001"
        },
        ownerName: {
            type: String,
            required: true,
        },
        ownerMobile: {
            type: String,
            required: true,
        },
        ownerEmail: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: true, // City / Area
        },
        address: {
            type: String,
            required: true,
        },
        stallType: {
            type: String,
            enum: ['Temporary', 'Permanent'],
            required: true,
        },
        operatingDates: {
            from: { type: Date },
            to: { type: Date },
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isLocked: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const Stall = mongoose.model('Stall', stallSchema);

module.exports = Stall;
