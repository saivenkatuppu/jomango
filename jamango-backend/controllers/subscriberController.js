const asyncHandler = require('express-async-handler');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User'); // Include Users in the list if needed, or strictly subscribers

// @desc    Subscribe to harvest alerts (Email or Phone)
// @route   POST /api/subscribers
// @access  Public
const subscribeUser = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        res.status(400);
        throw new Error('Please provide an email or phone number');
    }

    // Check if exists
    let subscriberExists;
    if (email) {
        subscriberExists = await Subscriber.findOne({ email });
    } else if (phone) {
        subscriberExists = await Subscriber.findOne({ phone });
    }

    if (subscriberExists) {
        // If it exists, maybe update missing fields? 
        // For now, just return error as per "Prevent duplicate"
        res.status(400);
        throw new Error('Contact already subscribed');
    }

    const subscriber = await Subscriber.create({
        email: email || undefined,
        phone: phone || undefined,
        source: 'website'
    });

    if (subscriber) {
        res.status(201).json({
            _id: subscriber.id,
            email: subscriber.email,
            phone: subscriber.phone,
        });
    } else {
        res.status(400);
        throw new Error('Invalid subscriber data');
    }
});

// @desc    Add a contact manually (Admin)
// @route   POST /api/subscribers/add
// @access  Private/Admin
const addContact = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        res.status(400);
        throw new Error('Please provide an email or phone number');
    }

    // Duplicate check
    let query = { $or: [] };
    if (email) query.$or.push({ email });
    if (phone) query.$or.push({ phone });

    if (query.$or.length === 0) {
        res.status(400);
        throw new Error('No valid contact info provided');
    }

    const existing = await Subscriber.findOne(query);

    if (existing) {
        res.status(400);
        throw new Error('Contact already exists');
    }

    const contact = await Subscriber.create({
        email: email || undefined,
        phone: phone || undefined,
        source: 'admin'
    });

    res.status(201).json(contact);
});

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
    const { type, query: query_start } = req.query;

    let filter = {};
    if (type === 'email') {
        filter.email = { $exists: true, $ne: null, $ne: "" };
    } else if (type === 'mobile') {
        filter.phone = { $exists: true, $ne: null, $ne: "" };
    }

    if (query_start) {
        filter.$or = [
            { email: { $regex: query_start, $options: 'i' } },
            { phone: { $regex: query_start, $options: 'i' } }
        ];
    }

    try {
        const subscribers = await Subscriber.find(filter).sort({ createdAt: -1 });
        res.json(subscribers);
    } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ message: "Server Error Fetching Subscribers" });
    }
});

module.exports = {
    subscribeUser,
    addContact,
    getSubscribers,
};
