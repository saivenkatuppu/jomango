const mongoose = require('mongoose');

const notificationLogSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['EMAIL', 'SMS', 'ALL'],
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false, // Could be a general notification
        },
        status: {
            type: String,
            enum: ['Pending', 'Sent', 'Failed'],
            default: 'Pending',
        },
        recipientCount: {
            type: Number,
            default: 0,
        },
        payload: {
            subject: String,
            message: String,
            link: String,
        },
        triggeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;
