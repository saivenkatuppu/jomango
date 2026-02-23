const asyncHandler = require('express-async-handler');
const StallCustomer = require('../models/StallCustomer');
const Stall = require('../models/Stall');

// @desc    Add a new customer from a stall
// @route   POST /api/crm/customers
// @access  Private/StallOwner|Admin
const addCustomer = asyncHandler(async (req, res) => {
    const { name, mobile, consent, notes } = req.body;

    // A stall owner's req.user will have stallId and assignedStall (ObjectId)
    if (!req.user.assignedStall && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('User is not assigned to any stall');
    }

    const stallObjectId = req.body.stallObjectId || req.user.assignedStall;
    const stallId = req.body.stallId || req.user.stallId;

    // Check if customer already exists for THIS stall
    let customer = await StallCustomer.findOne({ mobile, stall: stallObjectId });

    if (customer) {
        customer.name = name || customer.name;
        customer.consent = consent !== undefined ? consent : customer.consent;
        customer.notes = notes || customer.notes;
        await customer.save();
        res.status(200).json(customer);
    } else {
        customer = await StallCustomer.create({
            name,
            mobile,
            stallId,
            stall: stallObjectId,
            consent,
            notes,
            type: 'New'
        });
        res.status(201).json(customer);
    }
});

// @desc    Get customers (Stall specific or all for Admin)
// @route   GET /api/crm/customers
// @access  Private/StallOwner|Admin
const getCustomers = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'stall_owner') {
        query = { stall: req.user.assignedStall };
    } else if (req.user.role === 'admin' && req.query.stallId) {
        // Admin filtering by a specific stall's ObjectId
        query = { stall: req.query.stallId };
    }

    const customers = await StallCustomer.find(query)
        .populate('stall', 'stallName stallId')
        .sort({ createdAt: -1 });

    res.json(customers);
});

// @desc    Get customer breakdown/counts for Admin
// @route   GET /api/crm/stats
// @access  Private/Admin
const getCRMStats = asyncHandler(async (req, res) => {
    const totalCustomers = await StallCustomer.countDocuments();

    const stallWiseCounts = await StallCustomer.aggregate([
        {
            $group: {
                _id: '$stall',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'stalls',
                localField: '_id',
                foreignField: '_id',
                as: 'stallInfo'
            }
        },
        {
            $unwind: '$stallInfo'
        },
        {
            $project: {
                stallName: '$stallInfo.stallName',
                stallId: '$stallInfo.stallId',
                count: 1
            }
        }
    ]);

    res.json({
        totalCustomers,
        stallWiseCounts
    });
});

module.exports = {
    addCustomer,
    getCustomers,
    getCRMStats,
};
