const mongoose = require('mongoose');

const subscriberSchema = mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allows null/undefined values to be ignored for uniqueness
        },
        phone: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allows null/undefined values to be ignored for uniqueness
        },
        source: {
            type: String,
            default: 'website', // website, admin, etc.
        }
    },
    {
        timestamps: true,
    }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
