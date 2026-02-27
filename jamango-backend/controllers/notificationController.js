const asyncHandler = require('express-async-handler');
const NotificationLog = require('../models/NotificationLog');
const Subscriber = require('../models/Subscriber');
const Product = require('../models/Product');

// @desc    Trigger notification for a product
// @route   POST /api/notifications/trigger
// @access  Private/Admin
const triggerProductNotification = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Fetch recipients
    const emailSubscribers = await Subscriber.find({ email: { $exists: true, $ne: null } });
    const phoneSubscribers = await Subscriber.find({ phone: { $exists: true, $ne: null } });

    // Mock Payload
    const payload = {
        subject: `Fresh Arrival: ${product.name}!`,
        message: `We just added ${product.name} (${product.weight}KG) to our store. Order now before it runs out!`,
        link: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/#products`,
    };

    // Log the notification
    const log = await NotificationLog.create({
        type: 'ALL',
        productId: product._id,
        status: 'Pending',
        recipientCount: emailSubscribers.length + phoneSubscribers.length,
        payload,
        triggeredBy: req.user ? req.user._id : undefined,
    });

    res.json({
        message: 'Notification trigger recorded (API integration pending)',
        logId: log._id,
        recipientCount: log.recipientCount,
    });
});

// @desc    Get notification logs
// @route   GET /api/notifications
// @access  Private/Admin
const getNotificationLogs = asyncHandler(async (req, res) => {
    const logs = await NotificationLog.find({}).populate('productId', 'name').sort({ createdAt: -1 });
    res.json(logs);
});

module.exports = {
    triggerProductNotification,
    getNotificationLogs,
};
